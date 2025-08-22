import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/utils/auth/useAuth';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { User, MapPin, Building, Phone, ArrowLeft } from 'lucide-react-native';
import { router } from 'expo-router';
import * as Location from 'expo-location';
import KeyboardAvoidingAnimatedView from '@/components/KeyboardAvoidingAnimatedView';

export default function ProfileSetupScreen() {
  const insets = useSafeAreaInsets();
  const { auth } = useAuth();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    user_type: '',
    full_name: '',
    phone: '',
    address: '',
    organization_name: '',
    organization_type: ''
  });
  const [location, setLocation] = useState(null);

  // Create/update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (profileData) => {
      const response = await fetch('/api/users/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update profile');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['userProfile']);
      Alert.alert('Success', 'Profile updated successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    },
    onError: (error) => {
      Alert.alert('Error', error.message);
    },
  });

  const getUserLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is needed to set your address');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location.coords);
      
      let address = await Location.reverseGeocodeAsync(location.coords);
      if (address[0]) {
        const addr = address[0];
        const fullAddress = `${addr.street || ''} ${addr.city || ''}, ${addr.region || ''}`.trim();
        setFormData(prev => ({ ...prev, address: fullAddress }));
      }
    } catch (error) {
      Alert.alert('Error', 'Could not get your location');
    }
  };

  const handleSubmit = () => {
    if (!formData.user_type) {
      Alert.alert('Error', 'Please select whether you want to donate or receive food');
      return;
    }

    if (!formData.full_name) {
      Alert.alert('Error', 'Please enter your full name');
      return;
    }

    const profileData = {
      ...formData,
      latitude: location?.latitude,
      longitude: location?.longitude,
    };

    updateProfileMutation.mutate(profileData);
  };

  return (
    <KeyboardAvoidingAnimatedView style={{ flex: 1, backgroundColor: '#F9FAFB' }} behavior="padding">
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={{ 
        paddingTop: insets.top + 20,
        paddingHorizontal: 20,
        paddingBottom: 20,
        backgroundColor: 'white',
        flexDirection: 'row',
        alignItems: 'center'
      }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: '#F3F4F6',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12
          }}
        >
          <ArrowLeft size={20} color="#6B7280" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={{ 
            fontSize: 24, 
            fontWeight: 'bold', 
            color: '#1F2937'
          }}>
            Complete Profile
          </Text>
          <Text style={{ 
            fontSize: 16, 
            color: '#6B7280'
          }}>
            Help us personalize your experience
          </Text>
        </View>
      </View>

      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* User Type Selection */}
        <View style={{ backgroundColor: 'white', borderRadius: 16, padding: 16, marginBottom: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#1F2937', marginBottom: 16 }}>
            How do you want to use Trophos?
          </Text>
          
          <View style={{ gap: 12 }}>
            <TouchableOpacity
              onPress={() => setFormData(prev => ({ ...prev, user_type: 'donor' }))}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 16,
                borderRadius: 12,
                borderWidth: 2,
                borderColor: formData.user_type === 'donor' ? '#16A34A' : '#E5E7EB',
                backgroundColor: formData.user_type === 'donor' ? '#F0FDF4' : 'white'
              }}
            >
              <View style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: formData.user_type === 'donor' ? '#16A34A' : '#F3F4F6',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12
              }}>
                <Text style={{ fontSize: 24 }}>🥬</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ 
                  fontSize: 16, 
                  fontWeight: '600', 
                  color: formData.user_type === 'donor' ? '#16A34A' : '#1F2937',
                  marginBottom: 4
                }}>
                  I want to donate food
                </Text>
                <Text style={{ fontSize: 14, color: '#6B7280' }}>
                  Share surplus food with your community
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setFormData(prev => ({ ...prev, user_type: 'recipient' }))}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 16,
                borderRadius: 12,
                borderWidth: 2,
                borderColor: formData.user_type === 'recipient' ? '#16A34A' : '#E5E7EB',
                backgroundColor: formData.user_type === 'recipient' ? '#F0FDF4' : 'white'
              }}
            >
              <View style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: formData.user_type === 'recipient' ? '#16A34A' : '#F3F4F6',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12
              }}>
                <Text style={{ fontSize: 24 }}>🤝</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ 
                  fontSize: 16, 
                  fontWeight: '600', 
                  color: formData.user_type === 'recipient' ? '#16A34A' : '#1F2937',
                  marginBottom: 4
                }}>
                  I want to receive food
                </Text>
                <Text style={{ fontSize: 14, color: '#6B7280' }}>
                  Find available food in your area
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Basic Information */}
        <View style={{ backgroundColor: 'white', borderRadius: 16, padding: 16, marginBottom: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#1F2937', marginBottom: 16 }}>
            Basic Information
          </Text>
          
          <View style={{ gap: 16 }}>
            <View>
              <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8 }}>
                Full Name *
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <User size={20} color="#6B7280" style={{ marginRight: 12 }} />
                <TextInput
                  style={{
                    flex: 1,
                    borderWidth: 1,
                    borderColor: '#E5E7EB',
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    fontSize: 16,
                    color: '#1F2937'
                  }}
                  placeholder="Enter your full name"
                  value={formData.full_name}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, full_name: text }))}
                />
              </View>
            </View>

            <View>
              <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8 }}>
                Phone Number
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Phone size={20} color="#6B7280" style={{ marginRight: 12 }} />
                <TextInput
                  style={{
                    flex: 1,
                    borderWidth: 1,
                    borderColor: '#E5E7EB',
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    fontSize: 16,
                    color: '#1F2937'
                  }}
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, phone: text }))}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            <View>
              <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8 }}>
                Address
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                <MapPin size={20} color="#6B7280" style={{ marginRight: 12, marginTop: 12 }} />
                <View style={{ flex: 1 }}>
                  <TextInput
                    style={{
                      borderWidth: 1,
                      borderColor: '#E5E7EB',
                      borderRadius: 12,
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      fontSize: 16,
                      color: '#1F2937',
                      marginBottom: 8,
                      textAlignVertical: 'top'
                    }}
                    placeholder="Enter your address"
                    value={formData.address}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, address: text }))}
                    multiline={true}
                    numberOfLines={2}
                  />
                  <TouchableOpacity
                    onPress={getUserLocation}
                    style={{
                      backgroundColor: '#F3F4F6',
                      paddingVertical: 8,
                      paddingHorizontal: 12,
                      borderRadius: 8,
                      alignSelf: 'flex-start'
                    }}
                  >
                    <Text style={{ color: '#6B7280', fontSize: 12 }}>
                      Use Current Location
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Organization Information (Optional) */}
        <View style={{ backgroundColor: 'white', borderRadius: 16, padding: 16, marginBottom: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#1F2937', marginBottom: 8 }}>
            Organization Information
          </Text>
          <Text style={{ fontSize: 14, color: '#6B7280', marginBottom: 16 }}>
            Optional - for businesses, restaurants, or organizations
          </Text>
          
          <View style={{ gap: 16 }}>
            <View>
              <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8 }}>
                Organization Name
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Building size={20} color="#6B7280" style={{ marginRight: 12 }} />
                <TextInput
                  style={{
                    flex: 1,
                    borderWidth: 1,
                    borderColor: '#E5E7EB',
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    fontSize: 16,
                    color: '#1F2937'
                  }}
                  placeholder="e.g., ABC Restaurant, Community Center"
                  value={formData.organization_name}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, organization_name: text }))}
                />
              </View>
            </View>

            <View>
              <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8 }}>
                Organization Type
              </Text>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: '#E5E7EB',
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  fontSize: 16,
                  color: '#1F2937'
                }}
                placeholder="e.g., Restaurant, Grocery Store, Non-profit"
                value={formData.organization_type}
                onChangeText={(text) => setFormData(prev => ({ ...prev, organization_type: text }))}
              />
            </View>
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={updateProfileMutation.isLoading}
          style={{
            backgroundColor: updateProfileMutation.isLoading ? '#9CA3AF' : '#16A34A',
            paddingVertical: 16,
            borderRadius: 12,
            alignItems: 'center'
          }}
        >
          <Text style={{ 
            color: 'white', 
            fontSize: 16, 
            fontWeight: '600' 
          }}>
            {updateProfileMutation.isLoading ? 'Saving...' : 'Complete Profile'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingAnimatedView>
  );
}