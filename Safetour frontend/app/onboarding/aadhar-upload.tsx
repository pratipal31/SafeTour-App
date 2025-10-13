import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import { supabase } from "@/lib/supabase";
import { useUser } from "@clerk/clerk-expo";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function AadharUpload() {
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState("");
  const [fileUri, setFileUri] = useState("");
  const [fileType, setFileType] = useState("");
  const [checkingUser, setCheckingUser] = useState(true);
  const { user } = useUser();

  useEffect(() => {
    // Check if user already has aadhar uploaded
    const checkAadharStatus = async () => {
      if (!user?.id) {
        setCheckingUser(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("users")
          .select("aadhar_url")
          .eq("id", user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error("Error checking aadhar status:", error);
        }

        // If user already has aadhar, redirect to home
        if (data?.aadhar_url) {
          router.replace("/(tabs)/home");
        }
      } catch (error) {
        console.error("Error in checkAadharStatus:", error);
      } finally {
        setCheckingUser(false);
      }
    };

    checkAadharStatus();
  }, [user?.id]);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["image/*", "application/pdf"],
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const file = result.assets[0];
      
      // Validate file size (max 5MB)
      if (file.size && file.size > 5 * 1024 * 1024) {
        Alert.alert("Error", "File size must be less than 5MB");
        return;
      }

      setFileName(file.name);
      setFileUri(file.uri);
      setFileType(file.mimeType || "");
    } catch (error) {
      console.error("Error picking document:", error);
      Alert.alert("Error", "Failed to pick document");
    }
  };

  const uploadFile = async () => {
    if (!fileUri) {
      Alert.alert("Error", "Please select a file first");
      return;
    }

    if (!user?.id) {
      Alert.alert("Error", "User not authenticated");
      return;
    }

    try {
      setUploading(true);

      const fileExt = fileName.split(".").pop()?.toLowerCase();
      const timestamp = Date.now();
      const path = `${user.id}/aadhar_${timestamp}.${fileExt}`;

      // Step 1: Read file as base64
      const base64 = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Step 2: Convert base64 to Uint8Array
      const binaryString = atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Step 3: Upload to Supabase Storage
      console.log('📤 Uploading file to storage...');
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("aadhar-documents")
        .upload(path, bytes, {
          contentType: fileType || "application/octet-stream",
          upsert: true,
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw new Error(uploadError.message);
      }

      console.log('✅ File uploaded successfully');

      // Step 4: Get public URL
      const { data: publicUrlData } = supabase.storage
        .from("aadhar-documents")
        .getPublicUrl(path);

      const publicUrl = publicUrlData.publicUrl;
      console.log('🔗 Public URL:', publicUrl);

      // Step 5: Update database with aadhar URL
      console.log('💾 Updating user record...');
      
      const { error: updateError } = await supabase
        .from("users")
        .update({
          aadhar_url: publicUrl,
          aadhar_verified: false,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (updateError) {
        console.error("Update error:", updateError);
        throw new Error(updateError.message);
      }

      console.log('✅ User record updated successfully');

      // Success!
      Alert.alert(
        "Success",
        "Aadhaar uploaded successfully!",
        [
          {
            text: "Continue",
            onPress: () => router.replace("/(tabs)/home"),
          },
        ]
      );
    } catch (error: any) {
      console.error("❌ Upload error:", error);
      Alert.alert(
        "Upload Failed",
        error.message || "Something went wrong. Please try again."
      );
    } finally {
      setUploading(false);
    }
  };

  const removeFile = () => {
    setFileName("");
    setFileUri("");
    setFileType("");
  };

  const skipUpload = () => {
    Alert.alert(
      "Skip Verification",
      "You can upload your Aadhaar later from settings. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Skip",
          onPress: () => router.replace("/(tabs)/home"),
        },
      ]
    );
  };

  if (checkingUser) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#7c3aed" />
        <Text className="mt-4 text-gray-600">Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gradient-to-b from-purple-50 to-white">
      <View className="flex-1 px-6 pt-16 pb-8">
        {/* Header */}
        <View className="items-center mb-8">
          <View className="w-20 h-20 bg-purple-100 rounded-full items-center justify-center mb-4">
            <Ionicons name="card-outline" size={40} color="#7c3aed" />
          </View>
          <Text className="text-3xl font-bold text-gray-900 text-center mb-2">
            Verify Your Identity
          </Text>
          <Text className="text-base text-gray-600 text-center">
            Upload your Aadhaar card to complete your profile
          </Text>
        </View>

        {/* Info Card */}
        <View className="bg-blue-50 rounded-xl p-4 mb-6 border border-blue-100">
          <View className="flex-row items-start">
            <Ionicons name="information-circle" size={20} color="#3b82f6" />
            <View className="flex-1 ml-3">
              <Text className="text-sm font-semibold text-blue-900 mb-1">
                Why do we need this?
              </Text>
              <Text className="text-xs text-blue-800">
                We use your Aadhaar for identity verification to ensure security
                and comply with regulations.
              </Text>
            </View>
          </View>
        </View>

        {/* File Preview or Upload Button */}
        {fileName ? (
          <View className="bg-white rounded-xl p-4 mb-6 border border-gray-200 shadow-sm">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <View className="w-12 h-12 bg-purple-100 rounded-lg items-center justify-center mr-3">
                  <Ionicons
                    name={fileType.includes("pdf") ? "document" : "image"}
                    size={24}
                    color="#7c3aed"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-gray-900" numberOfLines={1}>
                    {fileName}
                  </Text>
                  <Text className="text-xs text-gray-500 mt-1">
                    {fileType.includes("pdf") ? "PDF Document" : "Image File"}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={removeFile}
                className="w-8 h-8 bg-red-50 rounded-full items-center justify-center"
                disabled={uploading}
              >
                <Ionicons name="close" size={18} color="#ef4444" />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            onPress={pickDocument}
            disabled={uploading}
            className="bg-white rounded-xl p-8 mb-6 border-2 border-dashed border-gray-300 items-center"
          >
            <View className="w-16 h-16 bg-purple-50 rounded-full items-center justify-center mb-4">
              <Ionicons name="cloud-upload-outline" size={32} color="#7c3aed" />
            </View>
            <Text className="text-base font-semibold text-gray-900 mb-1">
              Select Document
            </Text>
            <Text className="text-sm text-gray-500 text-center">
              Upload image or PDF (Max 5MB)
            </Text>
          </TouchableOpacity>
        )}

        {/* Upload Button */}
        {fileName && (
          <TouchableOpacity
            onPress={uploadFile}
            disabled={uploading}
            className={`rounded-xl py-4 mb-4 ${
              uploading ? "bg-purple-300" : "bg-purple-600"
            } shadow-lg`}
          >
            {uploading ? (
              <View className="flex-row items-center justify-center">
                <ActivityIndicator size="small" color="#ffffff" />
                <Text className="text-white text-base font-semibold ml-2">
                  Uploading...
                </Text>
              </View>
            ) : (
              <Text className="text-white text-base font-semibold text-center">
                Upload & Continue
              </Text>
            )}
          </TouchableOpacity>
        )}

        {/* Skip Button */}
        {!uploading && (
          <TouchableOpacity
            onPress={skipUpload}
            className="py-3 items-center"
          >
            <Text className="text-gray-600 text-sm font-medium">
              Skip for now
            </Text>
          </TouchableOpacity>
        )}

        {/* Security Note */}
        <View className="mt-8 items-center">
          <View className="flex-row items-center">
            <Ionicons name="shield-checkmark" size={16} color="#10b981" />
            <Text className="text-xs text-gray-500 ml-2">
              Your data is encrypted and secure
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}