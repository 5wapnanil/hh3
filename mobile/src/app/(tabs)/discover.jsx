import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, RefreshControl } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/utils/auth/useAuth';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter, MapPin, Clock, Heart } from 'lucide-react-native';
import { router } from 'expo-router';
import * as Location from 'expo-location';

export default function DiscoverScreen() {
  const insets = useSafeAreaInsets();
  const { auth, signIn } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [location, setLocation] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Get location permission and current location
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        let location = await Location.getCurrentPositionAsync({});
        setLocation(location.coords);
      }
    })();
  }, []);

  // Fetch food categories
  const { data: categories } = useQuery({
    queryKey: ['foodCategories'],
    queryFn: async () => {
      const response = await fetch('/api/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      return response.json();
    },
  });

  // Fetch listings with search and filters
  const { data: listings, isLoading, refetch } = useQuery({
    queryKey: ['listings', searchQuery, selectedCategory, location],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (selectedCategory) params.append('category', selectedCategory);
      if (location) {
        params.append('latitude', location.latitude.toString());
        params.append('longitude', location.longitude.toString());
      }
      
      const response = await fetch(`/api/listings?${params}`);
      if (!response.ok) throw new Error('Failed to fetch listings');
      return response.json();
    },
    enabled: true,
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  if (!auth) {
    return (
      <View style={{ 
        flex: 1, 
        backgroundColor: '#F9FAFB',
        paddingTop: insets.top,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
      }}>
        <StatusBar style="dark" />
        <Text style={{ 
          fontSize: 24, 
          fontWeight: 'bold', 
          color: '#1F2937',
          marginBottom: 16,
          textAlign: 'center'
        }}>
          Discover Available Food
        </Text>
        <Text style={{ 
          fontSize: 16, 
          color: '#6B7280',
          textAlign: 'center',
          marginBottom: 32,
          lineHeight: 24
        }}>
          Sign in to find food donations{'\n'}in your community
        </Text>
        <TouchableOpacity
          onPress={() => signIn()}
          style={{
            backgroundColor: '#16A34A',
            paddingVertical: 16,
            paddingHorizontal: 32,
            borderRadius: 12,
            alignItems: 'center'
          }}
        >
          <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
            Sign In
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      <StatusBar style="dark" />
      
      {/* Header with Search */}
      <View style={{ 
        paddingTop: insets.top + 20,
        paddingHorizontal: 20,
        paddingBottom: 16,
        backgroundColor: 'white'
      }}>
        <Text style={{ 
          fontSize: 24, 
          fontWeight: 'bold', 
          color: '#1F2937',
          marginBottom: 16
        }}>
          Discover Food
        </Text>
        
        <View style={{
          flexDirection: 'row',
          backgroundColor: '#F3F4F6',
          borderRadius: 12,
          paddingHorizontal: 16,
          paddingVertical: 12,
          alignItems: 'center',
          marginBottom: 16
        }}>
          <Search size={20} color="#6B7280" />
          <TextInput
            style={{
              flex: 1,
              marginLeft: 12,
              fontSize: 16,
              color: '#1F2937'
            }}
            placeholder="Search for food..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#6B7280"
          />
        </View>

        {/* Category Filter */}
        {categories && (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
          >
            <TouchableOpacity
              onPress={() => setSelectedCategory('')}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                backgroundColor: selectedCategory === '' ? '#16A34A' : '#F3F4F6',
                borderWidth: selectedCategory === '' ? 0 : 1,
                borderColor: '#E5E7EB'
              }}
            >
              <Text style={{
                color: selectedCategory === '' ? 'white' : '#6B7280',
                fontSize: 14,
                fontWeight: '500'
              }}>
                All
              </Text>
            </TouchableOpacity>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                onPress={() => setSelectedCategory(category.name)}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 20,
                  backgroundColor: selectedCategory === category.name ? '#16A34A' : '#F3F4F6',
                  borderWidth: selectedCategory === category.name ? 0 : 1,
                  borderColor: '#E5E7EB'
                }}
              >
                <Text style={{
                  color: selectedCategory === category.name ? 'white' : '#6B7280',
                  fontSize: 14,
                  fontWeight: '500'
                }}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Listings */}
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 20 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={{ 
            backgroundColor: 'white',
            borderRadius: 12,
            padding: 20,
            alignItems: 'center'
          }}>
            <Text style={{ color: '#6B7280' }}>Loading...</Text>
          </View>
        ) : listings?.length > 0 ? (
          <View style={{ gap: 16 }}>
            {listings.map((listing) => (
              <TouchableOpacity
                key={listing.id}
                onPress={() => router.push(`/(tabs)/listing/${listing.id}`)}
                style={{
                  backgroundColor: 'white',
                  borderRadius: 16,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: '#E5E7EB'
                }}
              >
                <View style={{ 
                  flexDirection: 'row', 
                  justifyContent: 'space-between', 
                  alignItems: 'flex-start',
                  marginBottom: 12
                }}>
                  <View style={{ flex: 1, marginRight: 12 }}>
                    <Text style={{ 
                      fontSize: 18, 
                      fontWeight: '600', 
                      color: '#1F2937',
                      marginBottom: 4
                    }}>
                      {listing.title}
                    </Text>
                    {listing.description && (
                      <Text style={{ 
                        fontSize: 14, 
                        color: '#6B7280',
                        lineHeight: 20
                      }}>
                        {listing.description}
                      </Text>
                    )}
                  </View>
                  <TouchableOpacity
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: '#F3F4F6',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Heart size={20} color="#6B7280" />
                  </TouchableOpacity>
                </View>

                <View style={{ 
                  flexDirection: 'row', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 12
                }}>
                  <View style={{
                    backgroundColor: '#F0FDF4',
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 16
                  }}>
                    <Text style={{ 
                      color: '#16A34A', 
                      fontSize: 14, 
                      fontWeight: '600'
                    }}>
                      {listing.quantity} {listing.unit}
                    </Text>
                  </View>
                  {listing.category_name && (
                    <View style={{
                      backgroundColor: '#F3F4F6',
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 16
                    }}>
                      <Text style={{ 
                        color: '#6B7280', 
                        fontSize: 12, 
                        fontWeight: '500'
                      }}>
                        {listing.category_name}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={{ gap: 8 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <MapPin size={16} color="#6B7280" />
                    <Text style={{ fontSize: 14, color: '#6B7280', flex: 1 }}>
                      {listing.pickup_location}
                      {listing.distance_km && ` • ${listing.distance_km.toFixed(1)}km away`}
                    </Text>
                  </View>
                  
                  {listing.expiry_date && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Clock size={16} color="#6B7280" />
                      <Text style={{ fontSize: 14, color: '#6B7280' }}>
                        Expires {new Date(listing.expiry_date).toLocaleDateString()}
                      </Text>
                    </View>
                  )}

                  {listing.donor_name && (
                    <Text style={{ fontSize: 12, color: '#9CA3AF', marginTop: 4 }}>
                      Donated by {listing.donor_name}
                      {listing.organization_name && ` • ${listing.organization_name}`}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={{ 
            backgroundColor: 'white',
            borderRadius: 12,
            padding: 20,
            alignItems: 'center'
          }}>
            <Search size={32} color="#6B7280" />
            <Text style={{ 
              fontSize: 16, 
              fontWeight: '500', 
              color: '#1F2937',
              marginTop: 8,
              marginBottom: 4
            }}>
              No food found
            </Text>
            <Text style={{ 
              fontSize: 14, 
              color: '#6B7280',
              textAlign: 'center'
            }}>
              Try adjusting your search or check back later
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}