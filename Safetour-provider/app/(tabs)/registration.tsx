import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TextInputProps,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

interface InputFieldProps extends TextInputProps {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
}

interface DocumentUploadProps {
  label: string;
  imageUri: string | null;
  onPress: () => void;
  icon: keyof typeof Ionicons.glyphMap;
}

export default function Registration() {
  const [formData, setFormData] = useState({
    ownerName: '',
    hotelName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    gstNumber: '',
    numberOfRooms: '',
    hotelType: '',
    website: '',
  });

  const [documents, setDocuments] = useState<{
    aadhaar: string | null;
    pan: string | null;
  }>({
    aadhaar: null,
    pan: null,
  });

  const updateFormData = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const pickDocument = async (type: 'aadhaar' | 'pan') => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert(
        'Permission Required',
        'Please grant camera roll permissions to upload documents.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 1,
      aspect: [16, 9],
    });

    if (!result.canceled) {
      setDocuments((prev) => ({ ...prev, [type]: result.assets[0].uri }));
    }
  };

  const handleSubmit = () => {
    Alert.alert('Registration', 'Form submitted successfully!', [
      { text: 'OK', onPress: () => console.log('Form Data:', formData, documents) },
    ]);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-slate-50">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <View className="mb-8 mt-5">
          <Text className="mb-2 text-3xl font-bold text-slate-800">Hotel Registration</Text>
          <Text className="text-base text-slate-500">Complete your profile to get started</Text>
        </View>

        <View className="mb-5 rounded-2xl bg-white p-5 shadow-sm">
          <Text className="mb-5 text-lg font-semibold text-slate-800">Personal Information</Text>

          <InputField
            label="Owner Name"
            placeholder="Enter your full name"
            value={formData.ownerName}
            onChangeText={(text) => updateFormData('ownerName', text)}
            icon="person-outline"
          />

          <InputField
            label="Email Address"
            placeholder="your.email@example.com"
            value={formData.email}
            onChangeText={(text) => updateFormData('email', text)}
            keyboardType="email-address"
            icon="mail-outline"
          />

          <InputField
            label="Phone Number"
            placeholder="+91 XXXXX XXXXX"
            value={formData.phone}
            onChangeText={(text) => updateFormData('phone', text)}
            keyboardType="phone-pad"
            icon="call-outline"
          />
        </View>

        <View className="mb-5 rounded-2xl bg-white p-5 shadow-sm">
          <Text className="mb-5 text-lg font-semibold text-slate-800">Hotel Details</Text>

          <InputField
            label="Hotel Name"
            placeholder="Enter hotel name"
            value={formData.hotelName}
            onChangeText={(text) => updateFormData('hotelName', text)}
            icon="business-outline"
          />

          <InputField
            label="Hotel Type"
            placeholder="e.g., Budget, Luxury, Resort"
            value={formData.hotelType}
            onChangeText={(text) => updateFormData('hotelType', text)}
            icon="star-outline"
          />

          <InputField
            label="Number of Rooms"
            placeholder="Total rooms available"
            value={formData.numberOfRooms}
            onChangeText={(text) => updateFormData('numberOfRooms', text)}
            keyboardType="numeric"
            icon="bed-outline"
          />

          <InputField
            label="GST Number"
            placeholder="Enter GST number"
            value={formData.gstNumber}
            onChangeText={(text) => updateFormData('gstNumber', text)}
            icon="document-text-outline"
          />

          <InputField
            label="Website"
            placeholder="www.yourhotel.com"
            value={formData.website}
            onChangeText={(text) => updateFormData('website', text)}
            icon="globe-outline"
          />
        </View>

        <View className="mb-5 rounded-2xl bg-white p-5 shadow-sm">
          <Text className="mb-5 text-lg font-semibold text-slate-800">Location Details</Text>

          <InputField
            label="Address"
            placeholder="Street address"
            value={formData.address}
            onChangeText={(text) => updateFormData('address', text)}
            icon="location-outline"
            multiline
          />

          <View className="flex-row gap-3">
            <View className="flex-1">
              <InputField
                label="City"
                placeholder="City"
                value={formData.city}
                onChangeText={(text) => updateFormData('city', text)}
              />
            </View>
            <View className="flex-1">
              <InputField
                label="State"
                placeholder="State"
                value={formData.state}
                onChangeText={(text) => updateFormData('state', text)}
              />
            </View>
          </View>

          <InputField
            label="Pincode"
            placeholder="6-digit pincode"
            value={formData.pincode}
            onChangeText={(text) => updateFormData('pincode', text)}
            keyboardType="numeric"
            maxLength={6}
            icon="pin-outline"
          />
        </View>

        <View className="mb-5 rounded-2xl bg-white p-5 shadow-sm">
          <Text className="mb-5 text-lg font-semibold text-slate-800">Document Upload</Text>

          <DocumentUpload
            label="Aadhaar Card"
            imageUri={documents.aadhaar}
            onPress={() => pickDocument('aadhaar')}
            icon="card-outline"
          />

          <DocumentUpload
            label="PAN Card"
            imageUri={documents.pan}
            onPress={() => pickDocument('pan')}
            icon="card-outline"
          />
        </View>

        <TouchableOpacity
          onPress={handleSubmit}
          className="mt-3 rounded-xl bg-blue-500 py-5 shadow-lg shadow-blue-500/50"
          activeOpacity={0.8}>
          <Text className="text-center text-lg font-semibold text-white">
            Complete Registration
          </Text>
        </TouchableOpacity>

        <Text className="mt-5 text-center text-sm text-slate-500">
          By registering, you agree to our Terms & Conditions
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function InputField({ label, icon, multiline = false, ...props }: InputFieldProps) {
  return (
    <View className="mb-5">
      <Text className="mb-2 text-sm font-medium text-slate-600">{label}</Text>
      <View
        className={`flex-row ${multiline ? 'items-start' : 'items-center'} rounded-lg border border-slate-200 bg-slate-50 px-4 py-3.5`}>
        {icon && (
          <Ionicons
            name={icon}
            size={20}
            color="#94a3b8"
            style={{ marginRight: 12, marginTop: multiline ? 2 : 0 }}
          />
        )}
        <TextInput
          className={`flex-1 text-base text-slate-800 ${multiline ? 'min-h-[80px]' : ''}`}
          placeholderTextColor="#94a3b8"
          multiline={multiline}
          {...props}
        />
      </View>
    </View>
  );
}

function DocumentUpload({ label, imageUri, onPress, icon }: DocumentUploadProps) {
  return (
    <View className="mb-4">
      <Text className="mb-2 text-sm font-medium text-slate-600">{label}</Text>
      <TouchableOpacity
        onPress={onPress}
        className={`items-center rounded-xl border-2 border-dashed p-5 ${
          imageUri ? 'border-green-500 bg-green-50' : 'border-slate-200 bg-slate-50'
        }`}
        activeOpacity={0.7}>
        {imageUri ? (
          <View className="w-full items-center">
            <Image
              source={{ uri: imageUri }}
              className="mb-3 h-48 w-full rounded-lg"
              resizeMode="cover"
            />
            <View className="flex-row items-center">
              <Ionicons name="checkmark-circle" size={20} color="#10b981" />
              <Text className="ml-2 font-medium text-green-600">Uploaded Successfully</Text>
            </View>
          </View>
        ) : (
          <View className="items-center">
            <Ionicons name={icon} size={40} color="#94a3b8" style={{ marginBottom: 12 }} />
            <Text className="mb-1 text-base font-medium text-slate-600">Tap to Upload {label}</Text>
            <Text className="text-xs text-slate-400">PNG, JPG or PDF (Max 5MB)</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}
