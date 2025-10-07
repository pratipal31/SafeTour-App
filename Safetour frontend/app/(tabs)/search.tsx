import { View, Text, Pressable, ScrollView, TextInput, Image, Alert } from 'react-native'
import React, { useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

const ExploreSafePlaces = () => {
  const [searchText, setSearchText] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('All')
  const [savedPlaces, setSavedPlaces] = useState<number[]>([])
  const [userLocation, setUserLocation] = useState('Current Location')

  const places = [
    {
      id: 1,
      name: 'Mall road',
      description: 'Famous shopping street with cultural architecture',
      rating: 4.5,
      safetyScore: '95% Safe',
      distance: '2.5 km',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=200&fit=crop',
      tags: ['Shopping', 'Cultural', 'Tourist']
    },
    {
      id: 2,
      name: 'The Ridge',
      description: 'Open space in the heart of Shimla, great for evening walks',
      rating: 4.7,
      safetyScore: '98% Safe',
      distance: '1.2 km',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=200&fit=crop',
      tags: ['Nature', 'Walking', 'Evening']
    },
    {
      id: 3,
      name: 'Cafe Sol',
      description: 'Cozy cafe with mountain views and local cuisine',
      rating: 4.1,
      safetyScore: '92% Safe',
      distance: '800 m',
      image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&h=200&fit=crop',
      tags: ['Food', 'Cafe', 'Mountain View']
    },
    {
      id: 4,
      name: 'Tibetan Market',
      description: 'Traditional market with handicrafts and souvenirs',
      rating: 4.3,
      safetyScore: '90% Safe',
      distance: '1.8 km',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=200&fit=crop',
      tags: ['Shopping', 'Traditional', 'Handicrafts']
    }
  ]

  const filters = ['All', 'Food', 'Sights', 'Shopping', 'Stay']

  useEffect(() => {
    loadSavedPlaces();
    loadUserLocation();
  }, []);

  const loadSavedPlaces = async () => {
    try {
      const saved = await AsyncStorage.getItem('savedPlaces');
      if (saved) {
        setSavedPlaces(JSON.parse(saved));
      }
    } catch (error) {
      console.log('Error loading saved places:', error);
    }
  };

  const loadUserLocation = async () => {
    try {
      const location = await AsyncStorage.getItem('currentLocation');
      if (location) {
        setUserLocation(location);
      }
    } catch (error) {
      console.log('Error loading location:', error);
    }
  };

  // Interactive handlers
  const handleSearch = () => {
    if (searchText.trim()) {
      Alert.alert(
        'Search Results',
        `Searching for "${searchText}" in safe places...`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'View Results', onPress: () => Alert.alert('Results', `Found 3 safe places matching "${searchText}"`) }
        ]
      );
    } else {
      Alert.alert('Search', 'Please enter a search term');
    }
  };

  const handleDirections = (place: any) => {
    Alert.alert(
      'Navigation',
      `Getting directions to ${place.name}...`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Open Maps', 
          onPress: () => Alert.alert(
            'Route Calculated',
            `Safe route to ${place.name}\nDistance: ${place.distance}\nEstimated time: ${Math.ceil(parseFloat(place.distance) * 15)} minutes\nSafety Score: ${place.safetyScore}`
          )
        }
      ]
    );
  };

  const handleAddToPlan = (place: any) => {
    const isAlreadySaved = savedPlaces.includes(place.id);
    
    if (isAlreadySaved) {
      Alert.alert(
        'Already Added',
        `${place.name} is already in your itinerary`,
        [
          { text: 'OK', style: 'cancel' },
          { text: 'Remove', onPress: () => removePlaceFromPlan(place) }
        ]
      );
    } else {
      Alert.alert(
        'Add to Itinerary',
        `Add ${place.name} to your travel plan?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Add', onPress: () => addPlaceToPlan(place) }
        ]
      );
    }
  };

  const addPlaceToPlan = async (place: any) => {
    try {
      const newSavedPlaces = [...savedPlaces, place.id];
      setSavedPlaces(newSavedPlaces);
      await AsyncStorage.setItem('savedPlaces', JSON.stringify(newSavedPlaces));
      Alert.alert('Added!', `${place.name} has been added to your itinerary`);
    } catch (error) {
      Alert.alert('Error', 'Failed to add place to itinerary');
    }
  };

  const removePlaceFromPlan = async (place: any) => {
    try {
      const newSavedPlaces = savedPlaces.filter(id => id !== place.id);
      setSavedPlaces(newSavedPlaces);
      await AsyncStorage.setItem('savedPlaces', JSON.stringify(newSavedPlaces));
      Alert.alert('Removed', `${place.name} has been removed from your itinerary`);
    } catch (error) {
      Alert.alert('Error', 'Failed to remove place from itinerary');
    }
  };

  const handlePlacePress = (place: any) => {
    Alert.alert(
      place.name,
      `${place.description}\n\nRating: ⭐ ${place.rating}\nSafety Score: ${place.safetyScore}\nDistance: ${place.distance}\n\nTags: ${place.tags.join(', ')}`,
      [
        { text: 'Close', style: 'cancel' },
        { text: 'Get Directions', onPress: () => handleDirections(place) },
        { text: 'Add to Plan', onPress: () => handleAddToPlan(place) }
      ]
    );
  };

  const filteredPlaces = places.filter(place => {
    const matchesSearch = place.name.toLowerCase().includes(searchText.toLowerCase()) ||
                         place.description.toLowerCase().includes(searchText.toLowerCase()) ||
                         place.tags.some(tag => tag.toLowerCase().includes(searchText.toLowerCase()));
    
    const matchesFilter = selectedFilter === 'All' || 
                         place.tags.some(tag => tag.toLowerCase().includes(selectedFilter.toLowerCase()));
    
    return matchesSearch && matchesFilter;
  });

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="pt-16 px-6 pb-4 bg-white">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-2xl font-bold text-gray-900">Explore Safe Places</Text>
          <Pressable className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center">
            <Text className="text-gray-600">🔍</Text>
          </Pressable>
        </View>

        {/* Search Bar */}
        <View className="bg-gray-100 rounded-xl px-4 py-3 mb-4 flex-row items-center">
          <TextInput
            placeholder="Search safe places..."
            value={searchText}
            onChangeText={setSearchText}
            className="text-gray-900 text-base flex-1"
            onSubmitEditing={handleSearch}
          />
          <Pressable onPress={handleSearch} className="ml-2">
            <Text className="text-blue-500">🔍</Text>
          </Pressable>
        </View>

        {/* Filter Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
          <View className="flex-row">
            {filters.map((filter) => (
              <Pressable
                key={filter}
                onPress={() => setSelectedFilter(filter)}
                className={`px-4 py-2 rounded-full mr-3 ${
                  selectedFilter === filter 
                    ? 'bg-blue-500' 
                    : 'bg-gray-200'
                }`}
              >
                <Text className={`font-medium ${
                  selectedFilter === filter 
                    ? 'text-white' 
                    : 'text-gray-700'
                }`}>
                  {filter}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 py-4">
          {filteredPlaces.length === 0 && searchText.trim() !== '' && (
            <View className="items-center py-20">
              <Text className="text-4xl mb-4">🔍</Text>
              <Text className="text-xl font-bold text-gray-900 mb-2">No Results Found</Text>
              <Text className="text-gray-600 text-center">Try adjusting your search or filter criteria</Text>
            </View>
          )}
          
          {filteredPlaces.map((place) => (
            <Pressable 
              key={place.id} 
              className="bg-white rounded-2xl mb-4 overflow-hidden shadow-sm"
              onPress={() => handlePlacePress(place)}
            >
              {/* Place Image */}
              <View className="h-48 bg-gradient-to-br from-pink-200 to-orange-200 relative">
                <Pressable 
                  className="absolute top-4 right-4 bg-white rounded-full p-2"
                  onPress={() => handleAddToPlan(place)}
                >
                  <Text className={savedPlaces.includes(place.id) ? "text-red-500" : "text-gray-400"}>
                    {savedPlaces.includes(place.id) ? "❤️" : "🤍"}
                  </Text>
                </Pressable>
                <View className="absolute top-4 left-4 bg-white rounded-full px-3 py-1">
                  <Text className="text-sm font-semibold text-gray-900">⭐ {place.rating}</Text>
                </View>
              </View>

              {/* Place Info */}
              <View className="p-4">
                <Text className="text-xl font-bold text-gray-900 mb-1">{place.name}</Text>
                <Text className="text-gray-600 text-sm mb-3 leading-5">{place.description}</Text>

                {/* Safety Score */}
                <View className="flex-row items-center mb-3">
                  <Text className="text-sm font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    Safety Score: {place.safetyScore}
                  </Text>
                  {savedPlaces.includes(place.id) && (
                    <Text className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full ml-2">
                      ✓ In Itinerary
                    </Text>
                  )}
                </View>

                {/* Distance and Tags */}
                <View className="flex-row items-center justify-between mb-4">
                  <Text className="text-sm text-gray-500">📍 {place.distance} from {userLocation}</Text>
                  <View className="flex-row">
                    {place.tags.slice(0, 3).map((tag, index) => (
                      <Text key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full ml-1">
                        {tag}
                      </Text>
                    ))}
                  </View>
                </View>

                {/* Action Buttons */}
                <View className="flex-row">
                  <Pressable 
                    className="flex-1 bg-blue-500 rounded-lg py-3 mr-2"
                    onPress={() => handleDirections(place)}
                  >
                    <Text className="text-white font-semibold text-center text-sm">🧭 Directions</Text>
                  </Pressable>
                  <Pressable 
                    className={`flex-1 rounded-lg py-3 ml-2 ${
                      savedPlaces.includes(place.id) ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                    onPress={() => handleAddToPlan(place)}
                  >
                    <Text className={`font-semibold text-center text-sm ${
                      savedPlaces.includes(place.id) ? 'text-white' : 'text-gray-700'
                    }`}>
                      {savedPlaces.includes(place.id) ? '✓ Added' : '+ Add to Plan'}
                    </Text>
                  </Pressable>
                </View>
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  )
}

export default ExploreSafePlaces