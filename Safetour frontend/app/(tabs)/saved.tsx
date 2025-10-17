import { View, Text, Pressable, ScrollView, Alert, ActivityIndicator, Linking, Modal, TextInput } from 'react-native'
import React, { useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Location from 'expo-location'
import { apiService } from '../../services/api'
import { useRouter } from 'expo-router'

const SafetyAlerts = () => {
  const router = useRouter();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [city, setCity] = useState('Unknown');
  const [userLocation, setUserLocation] = useState<{latitude: number, longitude: number} | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<any>(null);
  const [showDestinationModal, setShowDestinationModal] = useState(false);
  const [destination, setDestination] = useState('');
  const [currentRoutingAlert, setCurrentRoutingAlert] = useState<any>(null);

  const [alertCounts, setAlertCounts] = useState({
    urgent: 0,
    warning: 0,
    info: 0
  });

  useEffect(() => {
    fetchAlertsData();
  }, []);

  useEffect(() => {
    updateAlertCounts();
  }, [alerts]);

  const fetchAlertsData = async () => {
    try {
      setIsLoading(true);
      
      // Get user location
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Location permission denied');
        Alert.alert('Permission Required', 'Please enable location access to view safety alerts.');
        setIsLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      
      // Store user location for navigation
      setUserLocation({ latitude, longitude });
      
      console.log('📍 Fetching alerts for:', latitude, longitude);
      
      // Fetch alerts from backend
      const data = await apiService.fetchAlerts(latitude, longitude);
      
      console.log('✅ Received alerts data:', JSON.stringify(data, null, 2));
      
      if (data) {
        if (data.alerts && data.alerts.length > 0) {
          setAlerts(data.alerts);
          console.log(`✅ Set ${data.alerts.length} alerts`);
        } else {
          setAlerts([]);
          console.log('ℹ️ No alerts found');
        }
        setCity(data.city || 'Unknown');
        setAlertCounts(data.alert_counts || { urgent: 0, warning: 0, info: 0 });
      } else {
        console.error('❌ No data received from backend');
        Alert.alert('Error', 'No data received from server. Please check your connection.');
      }
    } catch (error) {
      console.error('❌ Error fetching alerts:', error);
      Alert.alert('Error', `Failed to fetch safety alerts: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const updateAlertCounts = () => {
    const activeAlerts = alerts.filter(alert => !alert.dismissed);
    const counts = {
      urgent: activeAlerts.filter(alert => alert.type === 'urgent').length,
      warning: activeAlerts.filter(alert => alert.type === 'warning').length,
      info: activeAlerts.filter(alert => alert.type === 'info').length
    };
    setAlertCounts(counts);
  };

  // Navigate to geofencing map with specific alert location
  const viewAlertOnMap = async (alert: any) => {
    try {
      // Store alert data for geofencing page to display
      await AsyncStorage.setItem('selectedAlertLocation', JSON.stringify({
        latitude: alert.latitude || userLocation?.latitude,
        longitude: alert.longitude || userLocation?.longitude,
        title: alert.title,
        location: alert.location,
        risk_type: alert.risk_type,
        severity: alert.severity
      }));
      
      // Navigate to geofencing tab
      router.push('/geofencing');
    } catch (error) {
      console.error('Error storing alert location:', error);
      router.push('/geofencing');
    }
  };

  // Smart routing with destination input and danger zone avoidance
  const handleSmartRouting = async (alert: any) => {
    if (!userLocation) {
      Alert.alert('Location Required', 'Please enable location access.');
      return;
    }

    setCurrentRoutingAlert(alert);
    setDestination('');
    setShowDestinationModal(true);
  };

  const processRoute = () => {
    if (!destination || destination.trim() === '' || !currentRoutingAlert || !userLocation) {
      Alert.alert('Error', 'Please enter a destination');
      return;
    }

    setShowDestinationModal(false);

    // Get all danger zone locations from alerts
    const dangerZones = alerts
      .filter(a => (a.type === 'urgent' || a.type === 'warning') && a.latitude && a.longitude)
      .map(a => ({
        location: a.location,
        latitude: a.latitude,
        longitude: a.longitude
      }));

    // Build Google Maps URL - Simple route without waypoints
    // Google Maps will automatically suggest alternate routes
    const destinationEncoded = encodeURIComponent(destination);
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.latitude},${userLocation.longitude}&destination=${destinationEncoded}&travelmode=driving&dir_action=navigate`;

    // Show confirmation with danger zones info
    const avoidList = dangerZones.length > 0 
      ? dangerZones.slice(0, 5).map(z => `• ${z.location}`).join('\n') + (dangerZones.length > 5 ? `\n...and ${dangerZones.length - 5} more` : '')
      : '• No active danger zones';

    Alert.alert(
      '🗺️ Route to Destination',
      `Destination: ${destination}\n\n⚠️ Be aware of ${dangerZones.length} danger zone(s):\n${avoidList}\n\nGoogle Maps will show alternate routes. Choose the safest one.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'View Zones First',
          onPress: () => {
            // Store all danger zones for map view
            AsyncStorage.setItem('allDangerZones', JSON.stringify(dangerZones));
            viewAlertOnMap(currentRoutingAlert);
          }
        },
        {
          text: 'Open Maps',
          onPress: () => {
            Linking.openURL(mapsUrl);
            dismissAlert(currentRoutingAlert.id);
          }
        }
      ]
    );
  };

  // Get contextual actions based on risk type
  const getContextualActions = (alert: any) => {
    const riskType = alert.risk_type?.toLowerCase() || '';
    
    if (riskType.includes('flood') || riskType.includes('weather')) {
      return {
        primary: 'Find Shelter',
        secondary: 'View on Map',
        primaryAction: () => {
          const url = `https://www.google.com/maps/search/hotels+emergency+shelter/@${userLocation?.latitude},${userLocation?.longitude},14z`;
          Linking.openURL(url);
        },
        secondaryAction: () => viewAlertOnMap(alert)
      };
    }
    
    if (riskType.includes('fire')) {
      return {
        primary: 'Safe Route',
        secondary: 'View on Map',
        primaryAction: () => handleSmartRouting(alert),
        secondaryAction: () => viewAlertOnMap(alert)
      };
    }
    
    if (riskType.includes('crime') || riskType.includes('protest')) {
      return {
        primary: 'Safe Route',
        secondary: 'View on Map',
        primaryAction: () => handleSmartRouting(alert),
        secondaryAction: () => viewAlertOnMap(alert)
      };
    }
    
    if (riskType.includes('accident')) {
      return {
        primary: 'Alternate Route',
        secondary: 'View on Map',
        primaryAction: () => handleSmartRouting(alert),
        secondaryAction: () => viewAlertOnMap(alert)
      };
    }
    
    // Default actions
    return {
      primary: 'Safe Route',
      secondary: 'View on Map',
      primaryAction: () => handleSmartRouting(alert),
      secondaryAction: () => viewAlertOnMap(alert)
    };
  };

  const handleSmartAction = async (alert: any, actionType: 'primary' | 'secondary') => {
    if (!userLocation) {
      Alert.alert('Location Required', 'Please enable location access for navigation features.');
      return;
    }

    const actions = getContextualActions(alert);
    if (actionType === 'primary') {
      actions.primaryAction();
    } else {
      actions.secondaryAction();
    }
  };

  const handleViewDetails = (alert: any) => {
    const details = `📍 Location: ${alert.location}\n⏰ Time: ${alert.time}\n⚠️ Risk Type: ${alert.risk_type || 'General'}\n🔴 Severity: ${alert.severity || 'Medium'}\n\n${alert.message}\n\nℹ️ This alert is based on real-time news analysis and AI-powered threat detection.`;
    
    Alert.alert(
      alert.title,
      details,
      [
        { text: 'Close', style: 'cancel' },
        { 
          text: 'View on Map', 
          onPress: () => viewAlertOnMap(alert)
        },
        {
          text: 'Navigate Away',
          onPress: () => handleSmartRouting(alert)
        }
      ]
    );
  };

  const handleSafetyRecommendations = async (alert: any) => {
    if (!userLocation) {
      Alert.alert('Location Required', 'Please enable location access.');
      return;
    }

    const riskType = alert.risk_type?.toLowerCase() || '';
    
    if (riskType.includes('weather') || riskType.includes('flood')) {
      Alert.alert(
        '☔ Weather Safety',
        'Recommended safe indoor locations:',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: '🏨 Hotels & Lodges', 
            onPress: () => {
              const url = `https://www.google.com/maps/search/hotels/@${userLocation.latitude},${userLocation.longitude},14z`;
              Linking.openURL(url);
            }
          },
          { 
            text: '🏛️ Public Buildings', 
            onPress: () => {
              const url = `https://www.google.com/maps/search/community+centers+libraries/@${userLocation.latitude},${userLocation.longitude},14z`;
              Linking.openURL(url);
            }
          },
          { 
            text: '🏥 Medical Facilities', 
            onPress: () => {
              const url = `https://www.google.com/maps/search/hospitals/@${userLocation.latitude},${userLocation.longitude},14z`;
              Linking.openURL(url);
            }
          }
        ]
      );
    } else if (riskType.includes('crime') || riskType.includes('protest')) {
      Alert.alert(
        '🛡️ Safety Recommendations',
        'Stay safe with these options:',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: '👮 Police Stations', 
            onPress: () => {
              const url = `https://www.google.com/maps/search/police+station/@${userLocation.latitude},${userLocation.longitude},14z`;
              Linking.openURL(url);
            }
          },
          { 
            text: '🏨 Safe Accommodations', 
            onPress: () => {
              const url = `https://www.google.com/maps/search/hotels/@${userLocation.latitude},${userLocation.longitude},14z`;
              Linking.openURL(url);
            }
          },
          { 
            text: '🚕 Book Taxi', 
            onPress: () => {
              Alert.alert('Quick Transport', 'Opening ride-hailing apps...', [
                { text: 'Uber', onPress: () => Linking.openURL('uber://') },
                { text: 'Close' }
              ]);
            }
          }
        ]
      );
    } else {
      Alert.alert(
        'ℹ️ Local Information',
        'Useful nearby locations:',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: '🏥 Hospitals', 
            onPress: () => {
              const url = `https://www.google.com/maps/search/hospitals/@${userLocation.latitude},${userLocation.longitude},14z`;
              Linking.openURL(url);
            }
          },
          { 
            text: '⛽ Gas Stations', 
            onPress: () => {
              const url = `https://www.google.com/maps/search/gas+stations/@${userLocation.latitude},${userLocation.longitude},14z`;
              Linking.openURL(url);
            }
          },
          { 
            text: 'ℹ️ Tourist Info', 
            onPress: () => {
              const url = `https://www.google.com/maps/search/tourist+information/@${userLocation.latitude},${userLocation.longitude},14z`;
              Linking.openURL(url);
            }
          }
        ]
      );
    }
  };

  const dismissAlert = (alertId: number) => {
    setAlerts(prevAlerts => 
      prevAlerts.map(alert => 
        alert.id === alertId ? { ...alert, dismissed: true } : alert
      )
    );
    // Save dismissed alerts to storage
    AsyncStorage.setItem('dismissedAlerts', JSON.stringify([alertId]));
  };

  const handleNotificationSettings = () => {
    Alert.alert(
      'Notification Settings',
      'Configure your alert preferences',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Mute for 1 Hour', 
          onPress: async () => {
            await AsyncStorage.setItem('alertsMuted', JSON.stringify({ until: Date.now() + 3600000 }));
            Alert.alert('Muted', 'Alerts muted for 1 hour');
          }
        },
        { 
          text: 'Open Profile', 
          onPress: () => {
            router.push('/profile');
          }
        }
      ]
    );
  };
  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="pt-16 px-6 pb-4 bg-white border-b border-gray-100">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-bold text-gray-900">Safety Alerts</Text>
            <Text className="text-sm text-gray-500 mt-1">📍 {city}</Text>
          </View>
          <View className="flex-row">
            <Pressable 
              className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-2"
              onPress={handleNotificationSettings}
            >
              <Text className="text-gray-600">🔇</Text>
            </Pressable>
            <Pressable 
              className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
              onPress={handleNotificationSettings}
            >
              <Text className="text-gray-600">🔔</Text>
            </Pressable>
            <Pressable 
              className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center ml-2"
              onPress={fetchAlertsData}
            >
              <Text className="text-blue-600">🔄</Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* Alert Stats */}
      <View className="flex-row mx-6 mt-6 mb-6">
        <View className="flex-1 bg-white rounded-xl p-4 mr-2 items-center shadow-sm">
          <View className="w-12 h-12 rounded-full bg-red-100 items-center justify-center mb-2">
            <Text className="text-red-600 text-xl">⚠️</Text>
          </View>
          <Text className="text-2xl font-bold text-gray-900">{alertCounts.urgent}</Text>
          <Text className="text-sm text-gray-600">Urgent</Text>
        </View>

        <View className="flex-1 bg-white rounded-xl p-4 mx-1 items-center shadow-sm">
          <View className="w-12 h-12 rounded-full bg-orange-100 items-center justify-center mb-2">
            <Text className="text-orange-600 text-xl">⚠️</Text>
          </View>
          <Text className="text-2xl font-bold text-gray-900">{alertCounts.warning}</Text>
          <Text className="text-sm text-gray-600">Warning</Text>
        </View>

        <View className="flex-1 bg-white rounded-xl p-4 ml-2 items-center shadow-sm">
          <View className="w-12 h-12 rounded-full bg-green-100 items-center justify-center mb-2">
            <Text className="text-green-600 text-xl">ℹ️</Text>
          </View>
          <Text className="text-2xl font-bold text-gray-900">{alertCounts.info}</Text>
          <Text className="text-sm text-gray-600">Info</Text>
        </View>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="text-gray-600 mt-4">Fetching safety alerts...</Text>
        </View>
      ) : (
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {alerts.filter(alert => !alert.dismissed).map((alert) => (
          <View key={alert.id} className="mx-6 mb-4">
            <View className={`bg-white rounded-xl p-4 shadow-sm ${
              alert.type === 'urgent' ? 'border-l-4 border-red-500' : ''
            }`}>
              <View className="flex-row items-start">
                <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
                  alert.type === 'urgent' ? 'bg-red-100' : 
                  alert.type === 'warning' ? 'bg-orange-100' : 'bg-green-100'
                }`}>
                  <Text className={`text-xl ${
                    alert.type === 'urgent' ? 'text-red-600' : 
                    alert.type === 'warning' ? 'text-orange-600' : 'text-green-600'
                  }`}>
                    {alert.type === 'urgent' ? '⚠️' : 
                     alert.type === 'warning' ? '⚠️' : 
                     alert.title.includes('Police') ? '🛡️' : '🌧️'}
                  </Text>
                </View>
                <View className="flex-1">
                  <Pressable onPress={() => handleViewDetails(alert)}>
                    <View className="flex-row items-center justify-between mb-1">
                      <Text className="font-bold text-gray-900 text-base">{alert.title}</Text>
                      {alert.type === 'urgent' && <View className="w-3 h-3 rounded-full bg-red-500" />}
                    </View>
                    <View className="flex-row items-center mb-2">
                      <Text className="text-xs text-gray-500">⏰ {alert.time} • </Text>
                      <Text className="text-xs text-gray-500">📍 {alert.location}</Text>
                    </View>
                    <Text className="text-gray-700 text-sm mb-4 leading-5">
                      {alert.message}
                    </Text>
                  </Pressable>
                  
                  {/* Dynamic Action Buttons */}
                  {alert.type === 'urgent' && (() => {
                    const actions = getContextualActions(alert);
                    return (
                      <View className="flex-row">
                        <Pressable 
                          className="flex-1 bg-red-500 rounded-lg py-3 mr-2"
                          onPress={() => handleSmartAction(alert, 'primary')}
                        >
                          <Text className="text-white font-semibold text-center text-sm">{actions.primary}</Text>
                        </Pressable>
                        <Pressable 
                          className="flex-1 bg-orange-500 rounded-lg py-3 ml-2"
                          onPress={() => handleSmartAction(alert, 'secondary')}
                        >
                          <Text className="text-white font-semibold text-center text-sm">{actions.secondary}</Text>
                        </Pressable>
                      </View>
                    );
                  })()}
                  
                  {alert.type === 'warning' && (() => {
                    const actions = getContextualActions(alert);
                    return (
                      <View className="flex-row">
                        <Pressable 
                          className="flex-1 bg-orange-500 rounded-lg py-3 mr-2"
                          onPress={() => handleSmartAction(alert, 'primary')}
                        >
                          <Text className="text-white font-semibold text-center text-sm">{actions.primary}</Text>
                        </Pressable>
                        <Pressable 
                          className="flex-1 bg-blue-500 rounded-lg py-3 ml-2"
                          onPress={() => handleSafetyRecommendations(alert)}
                        >
                          <Text className="text-white font-semibold text-center text-sm">Safety Tips</Text>
                        </Pressable>
                      </View>
                    );
                  })()}
                  
                  {alert.type === 'info' && (
                    <View className="flex-row">
                      <Pressable 
                        className="flex-1 bg-blue-500 rounded-lg py-3 mr-2"
                        onPress={() => handleSafetyRecommendations(alert)}
                      >
                        <Text className="text-white font-semibold text-center text-sm">📍 Nearby Help</Text>
                      </Pressable>
                      <Pressable 
                        className="flex-1 bg-green-500 rounded-lg py-3 ml-2"
                        onPress={() => handleViewDetails(alert)}
                      >
                        <Text className="text-white font-semibold text-center text-sm">ℹ️ Details</Text>
                      </Pressable>
                    </View>
                  )}
                </View>
              </View>
            </View>
          </View>
        ))}
        
        {alerts.filter(alert => !alert.dismissed).length === 0 && (
          <View className="mx-6 mt-20 items-center">
            <Text className="text-6xl mb-4">✅</Text>
            <Text className="text-xl font-bold text-gray-900 mb-2">All Clear!</Text>
            <Text className="text-gray-600 text-center">No active safety alerts at this time.</Text>
          </View>
        )}
      </ScrollView>
      )}

      {/* Destination Input Modal */}
      <Modal
        visible={showDestinationModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDestinationModal(false)}
      >
        <View className="flex-1 justify-center items-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View className="bg-white rounded-2xl p-6 w-11/12 max-w-md">
            <Text className="text-2xl font-bold text-gray-900 mb-2">🗺️ Enter Destination</Text>
            <Text className="text-sm text-gray-600 mb-4">
              Avoiding {alerts.filter(a => (a.type === 'urgent' || a.type === 'warning') && a.latitude).length} danger zone(s)
            </Text>
            
            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-3 mb-4 text-base"
              placeholder="e.g., City Mall, Hotel Taj, Airport"
              value={destination}
              onChangeText={setDestination}
              autoFocus={true}
              onSubmitEditing={processRoute}
            />
            
            <View className="flex-row justify-end">
              <Pressable
                className="px-6 py-3 rounded-lg mr-2"
                onPress={() => setShowDestinationModal(false)}
              >
                <Text className="text-gray-600 font-semibold">Cancel</Text>
              </Pressable>
              <Pressable
                className="bg-blue-500 px-6 py-3 rounded-lg"
                onPress={processRoute}
              >
                <Text className="text-white font-semibold">Navigate</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

export default SafetyAlerts