// Profile.tsx
import { View, Text, TextInput, Pressable, Alert, ScrollView, Switch, Modal, Linking, Image, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SignOutButton } from '@/components/SignOutButton';
import { apiService, EmergencyContact } from '../../services/api';
import { useUser, useClerk } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';

const Profile = () => {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [contact, setContact] = useState('');
  const [name, setName] = useState('User');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [showAddContactModal, setShowAddContactModal] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactRelation, setNewContactRelation] = useState('');
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([
    { id: 1, name: 'Police', phone: '100', relation: 'Emergency Service' }
  ]);
  const [backendConnected, setBackendConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  
  // Settings states
  const [safetyNotifications, setSafetyNotifications] = useState(true);
  const [locationTracking, setLocationTracking] = useState(true);
  const [alertSounds, setAlertSounds] = useState(true);
  const [emergencySharing, setEmergencySharing] = useState(true);

  useEffect(() => {
    checkBackendHealth();
    loadUserData();
    loadSettings();
  }, []);

  // Reload user data when Clerk user changes
  useEffect(() => {
    if (isLoaded) {
      loadUserData();
    }
  }, [isLoaded, user]);

  const checkBackendHealth = async () => {
    try {
      const isHealthy = await apiService.healthCheck();
      setBackendConnected(isHealthy);
    } catch (error) {
      setBackendConnected(false);
    }
  };

  const loadUserData = async () => {
    try {
      if (isLoaded && user) {
        // Use Clerk user data as primary source
        const fullName = user.firstName && user.lastName 
          ? `${user.firstName} ${user.lastName}` 
          : user.firstName || user.lastName || 'User';
        const userEmail = user.emailAddresses?.[0]?.emailAddress || '';
        
        setName(fullName);
        setEmail(userEmail);
        
        // Try to load from backend using Clerk user ID
        const backendUser = await apiService.getUser(user.id);
        
        if (backendUser) {
          // Use backend emergency contacts if available
          setEmergencyContacts(backendUser.emergencyContacts);
          
          // Sync backend data to local storage
          await AsyncStorage.setItem('emergencyContacts', JSON.stringify(backendUser.emergencyContacts));
        } else {
          // Create user in backend with Clerk data
          const storedContacts = await AsyncStorage.getItem('emergencyContacts');
          const contacts = storedContacts ? JSON.parse(storedContacts) : [];
          
          await apiService.saveUser({
            id: user.id,
            name: fullName,
            email: userEmail,
            emergencyContacts: contacts
          });
          
          if (contacts.length > 0) {
            setEmergencyContacts(contacts);
          }
        }
        
        // Save to local storage
        await AsyncStorage.setItem('userName', fullName);
        await AsyncStorage.setItem('userEmail', userEmail);
      } else {
        // Fallback to local storage when Clerk is not loaded
        const storedName = await AsyncStorage.getItem('userName');
        const storedEmail = await AsyncStorage.getItem('userEmail');
        const storedContacts = await AsyncStorage.getItem('emergencyContacts');
        
        if (storedName) setName(storedName);
        if (storedEmail) setEmail(storedEmail);
        if (storedContacts) {
          setEmergencyContacts(JSON.parse(storedContacts));
        }
      }
    } catch (error) {
      console.log('Error loading user data:', error);
      // Fallback to local storage only
      try {
        const storedName = await AsyncStorage.getItem('userName');
        const storedEmail = await AsyncStorage.getItem('userEmail');
        const storedContacts = await AsyncStorage.getItem('emergencyContacts');
        
        if (storedName) setName(storedName);
        if (storedEmail) setEmail(storedEmail);
        if (storedContacts) {
          setEmergencyContacts(JSON.parse(storedContacts));
        }
      } catch (localError) {
        console.log('Error loading local user data:', localError);
      }
    }
  };

  const saveEmergencyContacts = async (contacts: EmergencyContact[]) => {
    try {
      // Save to local storage
      await AsyncStorage.setItem('emergencyContacts', JSON.stringify(contacts));
      
      // Sync to backend if user is loaded
      if (user?.id) {
        await apiService.updateUser(user.id, { emergencyContacts: contacts });
      }
    } catch (error) {
      console.log('Error saving emergency contacts:', error);
    }
  };

  const addEmergencyContact = async () => {
    if (!newContactName.trim() || !newContactPhone.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!/^\+?[0-9]{10,15}$/.test(newContactPhone.replace(/[-\s]/g, ''))) {
      Alert.alert('Invalid Number', 'Please enter a valid phone number');
      return;
    }

    const newContact = {
      id: Date.now(),
      name: newContactName.trim(),
      phone: newContactPhone.trim(),
      relation: newContactRelation.trim() || 'Contact'
    };

    const updatedContacts = [...emergencyContacts, newContact];
    setEmergencyContacts(updatedContacts);
    await saveEmergencyContacts(updatedContacts);

    // Clear form
    setNewContactName('');
    setNewContactPhone('');
    setNewContactRelation('');
    setShowAddContactModal(false);

    Alert.alert('Success', `${newContact.name} has been added to your emergency contacts`);
  };

  const removeEmergencyContact = async (contactId: number) => {
    Alert.alert(
      'Remove Contact',
      'Are you sure you want to remove this emergency contact?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            const updatedContacts = emergencyContacts.filter(c => c.id !== contactId);
            setEmergencyContacts(updatedContacts);
            await saveEmergencyContacts(updatedContacts);
            Alert.alert('Removed', 'Emergency contact has been removed');
          }
        }
      ]
    );
  };

  const loadSettings = async () => {
    try {
      const settings = await AsyncStorage.getItem('userSettings');
      if (settings) {
        const parsedSettings = JSON.parse(settings);
        setSafetyNotifications(parsedSettings.safetyNotifications ?? true);
        setLocationTracking(parsedSettings.locationTracking ?? true);
        setAlertSounds(parsedSettings.alertSounds ?? true);
        setEmergencySharing(parsedSettings.emergencySharing ?? true);
      }
    } catch (error) {
      console.log('Error loading settings:', error);
    }
  };

  const saveSettings = async (newSettings: any) => {
    try {
      await AsyncStorage.setItem('userSettings', JSON.stringify(newSettings));
    } catch (error) {
      console.log('Error saving settings:', error);
    }
  };

  // Interactive handlers
  const handleSettingChange = async (setting: string, value: boolean) => {
    const newSettings = {
      safetyNotifications,
      locationTracking,
      alertSounds,
      emergencySharing,
      [setting]: value
    };

    switch (setting) {
      case 'safetyNotifications':
        setSafetyNotifications(value);
        break;
      case 'locationTracking':
        setLocationTracking(value);
        break;
      case 'alertSounds':
        setAlertSounds(value);
        break;
      case 'emergencySharing':
        setEmergencySharing(value);
        break;
    }

    await saveSettings(newSettings);
    Alert.alert('Settings Updated', `${setting.replace(/([A-Z])/g, ' $1').toLowerCase()} ${value ? 'enabled' : 'disabled'}`);
  };

  const handleDigitalIDCard = () => {
    // Generate a consistent ID based on user's ID or create a random one
    const userId = user?.id || 'guest';
    const uniqueId = `TC-TID-${new Date().getFullYear()}-${userId.slice(0, 6).toUpperCase()}`;
    
    // Get user's full name or default to 'Guest User'
    const fullName = user?.fullName || user?.username || 'Guest User';
    
    // Generate expiry date 1 year from now
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    const formattedExpiry = expiryDate.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: '2-digit' 
    });
  
    const message = `  Tourist ID: ${uniqueId}
  Name: ${fullName}
  Email: ${user?.emailAddresses?.[0]?.emailAddress || 'Not provided'}
  Status: ${user?.publicMetadata?.verified ? 'Verified' : 'Not Verified'}
  Valid Until: ${formattedExpiry}`;
  
    Alert.alert(
      'Digital ID Card',
      message,
      [
        { 
          text: 'Close', 
          style: 'cancel' 
        },
        { 
          text: 'Share', 
          onPress: () => {
            Alert.alert(
              'Share Digital ID',
              'Your Digital ID has been copied to clipboard and is ready to share.',
              [{ text: 'OK' }]
            );
            // Uncomment to enable actual clipboard functionality
            // Clipboard.setString(message);
          } 
        }
      ]
    );
  };

  const handleQRCode = () => {
    Alert.alert(
      'QR Code',
      'Displaying your identification QR code...\n\nScan this code at tourist checkpoints for quick verification.',
      [{ text: 'OK' }]
    );
  };

  const handleVerificationStatus = () => {
    Alert.alert(
      'Verification Status',
      '✅ Identity Verified\n✅ Phone Number Verified\n✅ Emergency Contact Added\n\nLast Verified: Today, 06:47 AM',
      [{ text: 'OK' }]
    );
  };

  const handleEmergencyContacts = () => {
    setShowEmergencyModal(true);
  };

  const handleSOSPreferences = () => {
    Alert.alert(
      'SOS Preferences',
      'Configure your emergency alert settings',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Hold Duration (3s)', onPress: () => Alert.alert('Setting', 'SOS hold duration: 3 seconds') },
        { text: 'Auto-Call', onPress: () => Alert.alert('Setting', 'Auto-call emergency services: Enabled') }
      ]
    );
  };

  const handleLanguage = () => {
    Alert.alert(
      'Language Settings',
      'Select your preferred language',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'English', onPress: () => Alert.alert('Language', 'Language set to English') },
        { text: 'हिंदी', onPress: () => Alert.alert('Language', 'भाषा हिंदी में सेट की गई') }
      ]
    );
  };

  const handleNotifications = () => {
    Alert.alert(
      'Notification Settings',
      'Manage your notification preferences',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Safety Alerts', onPress: () => Alert.alert('Notifications', 'Safety alerts: Enabled') },
        { text: 'Weather Updates', onPress: () => Alert.alert('Notifications', 'Weather updates: Enabled') }
      ]
    );
  };

  const handleSound = () => {
    Alert.alert(
      'Sound Settings',
      'Configure alert sounds and volume',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Test Sound', onPress: () => Alert.alert('Sound', '🔊 Alert sound played') },
        { text: 'Volume Settings', onPress: () => Alert.alert('Volume', 'Alert volume: 80%') }
      ]
    );
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out? You will need to log in again to access SafeTour.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsSigningOut(true);
              
              console.log('Starting sign out process from Profile...');
              
              // Clear all local storage
              await AsyncStorage.clear();
              console.log('Local storage cleared');
              
              // Sign out from Clerk
              await signOut();
              console.log('Clerk sign out complete');
              
              // Small delay to ensure Clerk state updates
              await new Promise(resolve => setTimeout(resolve, 100));
              
              // Redirect to landing page
              console.log('Redirecting to landing page...');
              router.replace('/');
            } catch (error) {
              console.error('Error during sign out:', error);
              setIsSigningOut(false);
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          }
        }
      ]
    );
  };

  const makeCall = async (phoneNumber: string, contactName: string) => {
    try {
      const contact: EmergencyContact = {
        id: Date.now(),
        name: contactName,
        phone: phoneNumber,
        relation: 'Contact'
      };
      
      const result = await apiService.callContact(contact, name, 'Profile Page');
      
      if (result.success) {
        Alert.alert('Call Initiated', `${result.message}\n\nCalling via Twilio service.`);
      } else {
        Alert.alert('Error', result.message || 'Failed to initiate call');
      }
    } catch (error) {
      Alert.alert('Error', `Failed to call ${contactName}`);
    }
  };

  const sendSMS = async (phoneNumber: string, contactName: string) => {
    try {
      const contact: EmergencyContact = {
        id: Date.now(),
        name: contactName,
        phone: phoneNumber,
        relation: 'Contact'
      };
      
      const result = await apiService.sendSMS(contact, name, 'Profile Page');
      
      if (result.success) {
        Alert.alert('SMS Sent', `${result.message}\n\nMessage sent via Twilio service.`);
      } else {
        Alert.alert('Error', result.message || 'Failed to send SMS');
      }
    } catch (error) {
      Alert.alert('Error', `Failed to send SMS to ${contactName}`);
    }
  };

  const testSMS = async (phoneNumber: string, contactName: string) => {
    try {
      setIsLoading(true);
      const result = await apiService.testSMS(phoneNumber);
      
      if (result.success) {
        Alert.alert(
          '✅ SMS Test Successful', 
          `${result.message}\n\nTest message sent to ${contactName}.\n\nIf you received the test SMS, the service is working correctly!`
        );
      } else {
        Alert.alert(
          '❌ SMS Test Failed', 
          `${result.message}\n\nPlease check:\n• Twilio credentials\n• Phone number format\n• Account balance`
        );
      }
    } catch (error) {
      Alert.alert('Error', `Failed to test SMS to ${contactName}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContactAction = (contact: any) => {
    Alert.alert(
      contact.name,
      `Choose an action for ${contact.name}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Call', 
          onPress: () => makeCall(contact.phone, contact.name)
        },
        { 
          text: 'Send SMS', 
          onPress: () => sendSMS(contact.phone, contact.name)
        }
      ]
    );
  };

  const handleSave = async () => {
    if (!/^\+?[0-9]{10,15}$/.test(contact)) {
      Alert.alert('Invalid Number', 'Please enter a valid phone number.');
      return;
    }
    setLoading(true);
    try {
      await AsyncStorage.setItem('emergencyContact', contact);
      if (name) await AsyncStorage.setItem('userName', name);
      if (email) await AsyncStorage.setItem('userEmail', email);
      setTimeout(() => {
        setLoading(false);
        Alert.alert('Saved', 'Profile updated successfully!');
      }, 500);
    } catch (err) {
      setLoading(false);
      Alert.alert('Error', 'Failed to save profile.');
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="pt-16 px-6 pb-4 bg-white border-b border-gray-100">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-bold text-gray-900">Profile</Text>
            <Pressable 
              className="flex-row items-center mt-1"
              onPress={checkBackendHealth}
            >
              <View className={`w-2 h-2 rounded-full mr-2 ${backendConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <Text className={`text-xs ${backendConnected ? 'text-green-600' : 'text-red-600'}`}>
                {backendConnected ? 'Twilio Service Online' : 'Twilio Service Offline'}
              </Text>
            </Pressable>
          </View>
          <Pressable className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center">
            <Text className="text-gray-600">⚙️</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View className="bg-white px-6 py-6 border-b border-gray-100">
          <View className="items-center">
            <View className="w-20 h-20 rounded-full bg-blue-500 items-center justify-center mb-3 relative overflow-hidden">
              {user?.imageUrl ? (
                <Image 
                  source={{ uri: user.imageUrl }} 
                  className="w-full h-full rounded-full"
                  resizeMode="cover"
                />
              ) : (
                <Text className="text-white text-2xl font-bold">
                  {name.charAt(0).toUpperCase()}
                </Text>
              )}
              <View className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 rounded-full border-2 border-white items-center justify-center">
                <Text className="text-white text-xs">✓</Text>
              </View>
            </View>
            <Pressable 
              onPress={() => {
                Alert.prompt(
                  'Edit Name',
                  'Enter your full name',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { 
                      text: 'Save', 
                      onPress: async (newName?: string) => {
                        if (newName && newName.trim()) {
                          setName(newName.trim());
                          await AsyncStorage.setItem('userName', newName.trim());
                          
                          // Sync to backend
                          if (user?.id) {
                            await apiService.updateUser(user.id, { name: newName.trim() });
                          }
                          
                          Alert.alert('Success', 'Name updated successfully!');
                        }
                      }
                    }
                  ],
                  'plain-text',
                  name
                );
              }}
            >
              <Text className="text-xl font-bold text-gray-900">{name} ✏️</Text>
            </Pressable>
            <Text className="text-sm text-gray-500">
              {'Visitor'}
            </Text>

            <View className="flex-row items-center mt-2">
              <Text className="text-green-600 text-sm">
                🆔 {`TC-TID-${new Date().getFullYear()}-${user?.id?.slice(0, 6).toUpperCase() || '000000'}`}
              </Text>
              <View className="ml-2 bg-green-100 px-2 py-1 rounded-full">
                <Text className="text-green-700 text-xs font-semibold">
                  {user?.publicMetadata?.verified ? '✓ Verified' : 'Unverified'}
                </Text>
              </View>
            </View>

            <Text className="text-gray-500 text-xs mt-1">
              📅 Trip: {new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit' })} -{' '}
              {new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { 
                month: 'short', 
                day: '2-digit', 
                year: 'numeric' 
              })}
            </Text>
          </View>
        </View>

        {/* Quick Settings */}
        <View className="bg-white mx-6 mt-6 rounded-xl shadow-sm">
          <Text className="text-lg font-semibold text-gray-900 p-4 pb-2">Quick Settings</Text>
          
          <View className="px-4 pb-4">
            <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
              <View className="flex-row items-center">
                <View className="w-8 h-8 rounded-full bg-blue-100 items-center justify-center mr-3">
                  <Text className="text-blue-600">🔔</Text>
                </View>
                <Text className="text-gray-900 font-medium">Safety Notifications</Text>
              </View>
              <Switch
                value={safetyNotifications}
                onValueChange={(value) => handleSettingChange('safetyNotifications', value)}
                trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
                thumbColor={safetyNotifications ? '#FFFFFF' : '#FFFFFF'}
              />
            </View>

            <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
              <View className="flex-row items-center">
                <View className="w-8 h-8 rounded-full bg-green-100 items-center justify-center mr-3">
                  <Text className="text-green-600">📍</Text>
                </View>
                <Text className="text-gray-900 font-medium">Location Tracking</Text>
              </View>
              <Switch
                value={locationTracking}
                onValueChange={(value) => handleSettingChange('locationTracking', value)}
                trackColor={{ false: '#E5E7EB', true: '#10B981' }}
                thumbColor={locationTracking ? '#FFFFFF' : '#FFFFFF'}
              />
            </View>

            <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
              <View className="flex-row items-center">
                <View className="w-8 h-8 rounded-full bg-orange-100 items-center justify-center mr-3">
                  <Text className="text-orange-600">🔊</Text>
                </View>
                <Text className="text-gray-900 font-medium">Alert Sounds</Text>
              </View>
              <Switch
                value={alertSounds}
                onValueChange={(value) => handleSettingChange('alertSounds', value)}
                trackColor={{ false: '#E5E7EB', true: '#F59E0B' }}
                thumbColor={alertSounds ? '#FFFFFF' : '#FFFFFF'}
              />
            </View>

            <View className="flex-row items-center justify-between py-3">
              <View className="flex-row items-center">
                <View className="w-8 h-8 rounded-full bg-purple-100 items-center justify-center mr-3">
                  <Text className="text-purple-600">🤝</Text>
                </View>
                <Text className="text-gray-900 font-medium">Emergency Sharing</Text>
              </View>
              <Switch
                value={emergencySharing}
                onValueChange={(value) => handleSettingChange('emergencySharing', value)}
                trackColor={{ false: '#E5E7EB', true: '#8B5CF6' }}
                thumbColor={emergencySharing ? '#FFFFFF' : '#FFFFFF'}
              />
            </View>
          </View>
        </View>

        {/* Digital Identity */}
        <View className="bg-white mx-6 mt-6 rounded-xl shadow-sm">
          <Text className="text-lg font-semibold text-gray-900 p-4 pb-2">Digital Identity</Text>
          
          <Pressable 
            className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100"
            onPress={handleDigitalIDCard}
          >
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-full bg-purple-100 items-center justify-center mr-3">
                <Text className="text-purple-600">🆔</Text>
              </View>
              <View>
                <Text className="text-gray-900 font-medium">Digital ID Card</Text>
                <Text className="text-gray-500 text-sm">View your Tourist ID</Text>
              </View>
            </View>
            <Text className="text-gray-400">›</Text>
          </Pressable>

          <Pressable 
            className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100"
            onPress={handleQRCode}
          >
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-full bg-blue-100 items-center justify-center mr-3">
                <Text className="text-blue-600">📱</Text>
              </View>
              <View>
                <Text className="text-gray-900 font-medium">QR Code</Text>
                <Text className="text-gray-500 text-sm">Show identification code</Text>
              </View>
            </View>
            <Text className="text-gray-400">›</Text>
          </Pressable>

          <Pressable 
            className="flex-row items-center justify-between px-4 py-3"
            onPress={handleVerificationStatus}
          >
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-full bg-green-100 items-center justify-center mr-3">
                <Text className="text-green-600">✅</Text>
              </View>
              <View>
                <Text className="text-gray-900 font-medium">Verification Status</Text>
                <Text className="text-gray-500 text-sm">Check verification status</Text>
              </View>
            </View>
            <Text className="text-gray-400">›</Text>
          </Pressable>
        </View>

        {/* Emergency Settings */}
        <View className="bg-white mx-6 mt-6 rounded-xl shadow-sm">
          <Text className="text-lg font-semibold text-gray-900 p-4 pb-2">Emergency Settings</Text>
          
          <Pressable 
            className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100"
            onPress={handleEmergencyContacts}
          >
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-full bg-red-100 items-center justify-center mr-3">
                <Text className="text-red-600">📞</Text>
              </View>
              <View>
                <Text className="text-gray-900 font-medium">Emergency Contacts</Text>
                <Text className="text-gray-500 text-sm">{emergencyContacts.length} contacts added</Text>
              </View>
            </View>
            <Text className="text-gray-400">›</Text>
          </Pressable>

          <Pressable 
            className="flex-row items-center justify-between px-4 py-3"
            onPress={handleSOSPreferences}
          >
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-full bg-orange-100 items-center justify-center mr-3">
                <Text className="text-orange-600">🆘</Text>
              </View>
              <View>
                <Text className="text-gray-900 font-medium">SOS Preferences</Text>
                <Text className="text-gray-500 text-sm">Configure emergency alerts</Text>
              </View>
            </View>
            <Text className="text-gray-400">›</Text>
          </Pressable>
        </View>

        {/* App Preferences */}
        <View className="bg-white mx-6 mt-6 rounded-xl shadow-sm">
          <Text className="text-lg font-semibold text-gray-900 p-4 pb-2">App Preferences</Text>
          
          <Pressable 
            className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100"
            onPress={handleLanguage}
          >
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-full bg-blue-100 items-center justify-center mr-3">
                <Text className="text-blue-600">🌐</Text>
              </View>
              <View>
                <Text className="text-gray-900 font-medium">Language</Text>
                <Text className="text-gray-500 text-sm">English</Text>
              </View>
            </View>
            <Text className="text-gray-400">›</Text>
          </Pressable>

          <Pressable 
            className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100"
            onPress={handleNotifications}
          >
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-full bg-purple-100 items-center justify-center mr-3">
                <Text className="text-purple-600">🔔</Text>
              </View>
              <View>
                <Text className="text-gray-900 font-medium">Notifications</Text>
                <Text className="text-gray-500 text-sm">Safety alerts & updates</Text>
              </View>
            </View>
            <Text className="text-gray-400">›</Text>
          </Pressable>

          <Pressable 
            className="flex-row items-center justify-between px-4 py-3"
            onPress={handleSound}
          >
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-full bg-yellow-100 items-center justify-center mr-3">
                <Text className="text-yellow-600">🔊</Text>
              </View>
              <View>
                <Text className="text-gray-900 font-medium">Sound</Text>
                <Text className="text-gray-500 text-sm">Alert sounds</Text>
              </View>
            </View>
            <Text className="text-gray-400">›</Text>
          </Pressable>
        </View>

        {/* Sign Out */}
        <View className="mx-6 mt-6 mb-8">
          <Pressable 
            className={`bg-white rounded-xl py-4 items-center shadow-sm border ${isSigningOut ? 'border-gray-200 opacity-50' : 'border-red-200'}`}
            onPress={handleSignOut}
            disabled={isSigningOut}
          >
            {isSigningOut ? (
              <View className="flex-row items-center">
                <ActivityIndicator color="#DC2626" size="small" />
                <Text className="text-red-600 font-semibold text-base ml-2">Signing Out...</Text>
              </View>
            ) : (
              <Text className="text-red-600 font-semibold text-base">🚪 Sign Out</Text>
            )}
          </Pressable>
        </View>

        {/* Emergency Contacts Modal */}
        <Modal
          visible={showEmergencyModal}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <View className="flex-1 bg-gray-50">
            <View className="pt-16 px-6 pb-4 bg-white border-b border-gray-100">
              <View className="flex-row items-center justify-between">
                <Text className="text-2xl font-bold text-gray-900">Emergency Contacts</Text>
                <Pressable 
                  className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
                  onPress={() => setShowEmergencyModal(false)}
                >
                  <Text className="text-gray-600">✕</Text>
                </Pressable>
              </View>
            </View>

            <ScrollView className="flex-1 px-6 py-4">
              {emergencyContacts.map((contact) => (
                <View key={contact.id} className="bg-white rounded-xl p-4 mb-3 shadow-sm">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <Text className="text-lg font-bold text-gray-900">{contact.name}</Text>
                      <Text className="text-gray-600">{contact.phone}</Text>
                      <Text className="text-sm text-gray-500">{contact.relation}</Text>
                    </View>
                    <View className="flex-row">
                      <Pressable 
                        className="bg-blue-500 rounded-lg px-4 py-2 mr-2"
                        onPress={() => makeCall(contact.phone, contact.name)}
                      >
                        <Text className="text-white font-semibold">Call</Text>
                      </Pressable>
                      <Pressable 
                        className="bg-green-500 rounded-lg px-4 py-2 mr-2"
                        onPress={() => sendSMS(contact.phone, contact.name)}
                      >
                        <Text className="text-white font-semibold">SMS</Text>
                      </Pressable>
                      <Pressable 
                        className="bg-purple-500 rounded-lg px-3 py-2 mr-2"
                        onPress={() => testSMS(contact.phone, contact.name)}
                      >
                        <Text className="text-white font-semibold">Test</Text>
                      </Pressable>
                      {contact.id !== 3 && ( // Don't allow removing default emergency services
                        <Pressable 
                          className="bg-red-500 rounded-lg px-3 py-2"
                          onPress={() => removeEmergencyContact(contact.id)}
                        >
                          <Text className="text-white font-semibold">✕</Text>
                        </Pressable>
                      )}
                    </View>
                  </View>
                </View>
              ))}

              <Pressable 
                className="bg-blue-500 rounded-xl py-4 items-center mt-4"
                onPress={() => setShowAddContactModal(true)}
              >
                <Text className="text-white font-semibold text-base">+ Add New Contact</Text>
              </Pressable>
            </ScrollView>
          </View>
        </Modal>

        {/* Add Contact Modal */}
        <Modal
          visible={showAddContactModal}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <View className="flex-1 bg-gray-50">
            <View className="pt-16 px-6 pb-4 bg-white border-b border-gray-100">
              <View className="flex-row items-center justify-between">
                <Text className="text-2xl font-bold text-gray-900">Add Emergency Contact</Text>
                <Pressable 
                  className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
                  onPress={() => {
                    setShowAddContactModal(false);
                    setNewContactName('');
                    setNewContactPhone('');
                    setNewContactRelation('');
                  }}
                >
                  <Text className="text-gray-600">✕</Text>
                </Pressable>
              </View>
            </View>

            <ScrollView className="flex-1 px-6 py-6">
              <View className="bg-white rounded-xl p-6 shadow-sm">
                <Text className="text-lg font-semibold text-gray-900 mb-4">Contact Information</Text>
                
                <View className="mb-4">
                  <Text className="text-sm font-medium text-gray-700 mb-2">Full Name *</Text>
                  <TextInput
                    className="w-full h-12 border border-gray-300 rounded-lg px-4 text-sm bg-white text-gray-900"
                    placeholder="Enter contact name"
                    value={newContactName}
                    onChangeText={setNewContactName}
                    placeholderTextColor="#9ca3af"
                  />
                </View>

                <View className="mb-4">
                  <Text className="text-sm font-medium text-gray-700 mb-2">Phone Number *</Text>
                  <TextInput
                    className="w-full h-12 border border-gray-300 rounded-lg px-4 text-sm bg-white text-gray-900"
                    placeholder="+91-9876543210"
                    keyboardType="phone-pad"
                    value={newContactPhone}
                    onChangeText={setNewContactPhone}
                    placeholderTextColor="#9ca3af"
                  />
                </View>

                <View className="mb-6">
                  <Text className="text-sm font-medium text-gray-700 mb-2">Relationship</Text>
                  <TextInput
                    className="w-full h-12 border border-gray-300 rounded-lg px-4 text-sm bg-white text-gray-900"
                    placeholder="e.g., Father, Mother, Friend"
                    value={newContactRelation}
                    onChangeText={setNewContactRelation}
                    placeholderTextColor="#9ca3af"
                  />
                </View>

                <View className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-200">
                  <View className="flex-row items-start">
                    <View className="w-8 h-8 rounded-full bg-white justify-center items-center mr-3">
                      <Text className="text-lg">ℹ️</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-blue-900 mb-1">Emergency Contact</Text>
                      <Text className="text-xs text-blue-700 leading-4">
                        This contact will be notified when you use the SOS feature. Make sure the number is active and belongs to someone who can help in emergencies.
                      </Text>
                    </View>
                  </View>
                </View>

                <View className="flex-row">
                  <Pressable
                    className="flex-1 rounded-xl py-4 items-center mr-2 bg-gray-200"
                    onPress={() => {
                      setShowAddContactModal(false);
                      setNewContactName('');
                      setNewContactPhone('');
                      setNewContactRelation('');
                    }}
                  >
                    <Text className="text-gray-700 text-base font-semibold">Cancel</Text>
                  </Pressable>
                  
                  <Pressable
                    className={`flex-1 rounded-xl py-4 items-center ml-2 ${
                      newContactName.trim() && newContactPhone.trim() ? 'bg-blue-600' : 'bg-gray-400'
                    }`}
                    onPress={addEmergencyContact}
                    disabled={!newContactName.trim() || !newContactPhone.trim()}
                  >
                    <Text className="text-white text-base font-semibold">Add Contact</Text>
                  </Pressable>
                </View>
              </View>
            </ScrollView>
          </View>
        </Modal>
      </ScrollView>
    </View>
  );
};

export default Profile;