import { View, Text, Pressable, ScrollView, Alert } from 'react-native'
import React, { useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

const SafetyAlerts = () => {
  const [alerts, setAlerts] = useState([
    {
      id: 1,
      type: 'urgent',
      title: 'High Risk Zone Alert',
      location: 'NH-5, Kullu District',
      time: '2 minutes ago',
      message: 'You are approaching a landslide-prone area. Immediate rerouting recommended.',
      dismissed: false
    },
    {
      id: 2,
      type: 'warning',
      title: 'Crowd Density Warning',
      location: 'Mall Road, Shimla',
      time: '15 minutes ago',
      message: 'High crowd density detected at Mall Road. Consider visiting during off-peak hours.',
      dismissed: false
    },
    {
      id: 3,
      type: 'info',
      title: 'Tourist Police Patrol',
      location: 'Ridge Area, Shimla',
      time: '1 hour ago',
      message: 'Enhanced security patrol active in your area. Safe for evening activities.',
      dismissed: false
    },
    {
      id: 4,
      type: 'info',
      title: 'Weather Advisory',
      location: 'Shimla Region',
      time: '2 hours ago',
      message: 'Heavy rainfall expected between 3-6 PM. Indoor activities recommended.',
      dismissed: false
    }
  ]);

  const [alertCounts, setAlertCounts] = useState({
    urgent: 0,
    warning: 0,
    info: 0
  });

  useEffect(() => {
    updateAlertCounts();
  }, [alerts]);

  const updateAlertCounts = () => {
    const activeAlerts = alerts.filter(alert => !alert.dismissed);
    const counts = {
      urgent: activeAlerts.filter(alert => alert.type === 'urgent').length,
      warning: activeAlerts.filter(alert => alert.type === 'warning').length,
      info: activeAlerts.filter(alert => alert.type === 'info').length
    };
    setAlertCounts(counts);
  };

  // Interactive handlers
  const handleReroute = (alertId: number) => {
    Alert.alert(
      'Rerouting',
      'Finding alternative safe route...',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Confirm', 
          onPress: () => {
            Alert.alert('Success', 'New safe route has been calculated!');
            dismissAlert(alertId);
          }
        }
      ]
    );
  };

  const handleShowAlternative = (alertId: number) => {
    Alert.alert(
      'Alternative Locations',
      'Showing nearby alternatives with lower crowd density:\n\n• The Ridge (Light crowd)\n• Scandal Point (Moderate crowd)\n• Christ Church (Light crowd)',
      [
        { text: 'Close', style: 'cancel' },
        { text: 'Navigate', onPress: () => Alert.alert('Navigation', 'Opening directions to The Ridge...') }
      ]
    );
  };

  const handleViewDetails = (alert: any) => {
    Alert.alert(
      alert.title,
      `Location: ${alert.location}\nTime: ${alert.time}\n\n${alert.message}\n\nAdditional Info: This alert is based on real-time data from local authorities and tourist safety monitoring systems.`,
      [{ text: 'OK' }]
    );
  };

  const handleIndoorSuggestions = () => {
    Alert.alert(
      'Indoor Activity Suggestions',
      '• Himachal State Museum\n• Gaiety Theatre\n• Mall Road Shopping Centers\n• Local Cafes and Restaurants\n• Hotel Lobbies and Lounges',
      [
        { text: 'Close', style: 'cancel' },
        { text: 'Get Directions', onPress: () => Alert.alert('Navigation', 'Opening directions to nearest indoor location...') }
      ]
    );
  };

  const dismissAlert = (alertId: number) => {
    setAlerts(prevAlerts => 
      prevAlerts.map(alert => 
        alert.id === alertId ? { ...alert, dismissed: true } : alert
      )
    );
    Alert.alert('Dismissed', 'Alert has been dismissed');
  };

  const handleNotificationSettings = () => {
    Alert.alert(
      'Notification Settings',
      'Configure your alert preferences',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Mute All', onPress: () => Alert.alert('Muted', 'All notifications muted for 1 hour') },
        { text: 'Settings', onPress: () => Alert.alert('Settings', 'Opening notification preferences...') }
      ]
    );
  };
  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="pt-16 px-6 pb-4 bg-white border-b border-gray-100">
        <View className="flex-row items-center justify-between">
          <Text className="text-2xl font-bold text-gray-900">Safety Alerts</Text>
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
                  {alert.type === 'urgent' && (
                    <View className="flex-row">
                      <Pressable 
                        className="flex-1 bg-blue-500 rounded-lg py-3 mr-2"
                        onPress={() => handleReroute(alert.id)}
                      >
                        <Text className="text-white font-semibold text-center text-sm">Reroute Me</Text>
                      </Pressable>
                      <Pressable 
                        className="flex-1 bg-gray-200 rounded-lg py-3 ml-2"
                        onPress={() => dismissAlert(alert.id)}
                      >
                        <Text className="text-gray-700 font-semibold text-center text-sm">Continue Anyway</Text>
                      </Pressable>
                    </View>
                  )}
                  
                  {alert.type === 'warning' && (
                    <View className="flex-row">
                      <Pressable 
                        className="flex-1 bg-blue-500 rounded-lg py-3 mr-2"
                        onPress={() => handleShowAlternative(alert.id)}
                      >
                        <Text className="text-white font-semibold text-center text-sm">Show Alternative</Text>
                      </Pressable>
                      <Pressable 
                        className="flex-1 bg-gray-200 rounded-lg py-3 ml-2"
                        onPress={() => dismissAlert(alert.id)}
                      >
                        <Text className="text-gray-700 font-semibold text-center text-sm">Dismiss</Text>
                      </Pressable>
                    </View>
                  )}
                  
                  {alert.type === 'info' && alert.title.includes('Police') && (
                    <Pressable 
                      className="bg-blue-500 rounded-lg py-3"
                      onPress={() => handleViewDetails(alert)}
                    >
                      <Text className="text-white font-semibold text-center text-sm">View Details</Text>
                    </Pressable>
                  )}
                  
                  {alert.type === 'info' && alert.title.includes('Weather') && (
                    <View className="flex-row">
                      <Pressable 
                        className="flex-1 bg-blue-500 rounded-lg py-3 mr-2"
                        onPress={handleIndoorSuggestions}
                      >
                        <Text className="text-white font-semibold text-center text-sm">Indoor Suggestions</Text>
                      </Pressable>
                      <Pressable 
                        className="flex-1 bg-gray-200 rounded-lg py-3 ml-2"
                        onPress={() => dismissAlert(alert.id)}
                      >
                        <Text className="text-gray-700 font-semibold text-center text-sm">Got it</Text>
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
    </View>
  )
}

export default SafetyAlerts