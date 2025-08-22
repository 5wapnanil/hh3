import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/utils/auth/useAuth';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Clock, Users, Leaf, Bell } from 'lucide-react-native';
import { router } from 'expo-router';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { auth, isReady } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  // Fetch recent listings
  const { data: recentListings, isLoading, refetch } = useQuery({
    queryKey: ['recentListings'],
    queryFn: async () => {
      const response = await fetch('/api/listings/recent');
      if (!response.ok) throw new Error('Failed to fetch listings');
      return response.json();
    },
    enabled: !!auth,
  });

  // Fetch user stats
  const { data: userStats } = useQuery({
    queryKey: ['userStats'],
    queryFn: async () => {
      const response = await fetch('/api/users/stats');
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    },
    enabled: !!auth,
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  if (!isReady) {
    return (
      <View style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
        <StatusBar style="dark" />
      </View>
    );
  }

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
        <View style={{ alignItems: 'center', marginBottom: 40 }}>
          <Leaf size={64} color="#16A34A" />
          <Text style={{ 
            fontSize: 32, 
            fontWeight: 'bold', 
            color: '#1F2937',
            marginTop: 16,
            marginBottom: 8
          }}>
            Welcome to Trophos
          </Text>
          <Text style={{ 
            fontSize: 16, 
            color: '#6B7280',
            textAlign: 'center',
            lineHeight: 24
          }}>
            Join the community fighting food waste{'\n'}and helping those in need
          </Text>
        </View>
        
        <View style={{ width: '100%', gap: 16 }}>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/discover')}
            style={{
              backgroundColor: '#16A34A',
              paddingVertical: 16,
              paddingHorizontal: 24,
              borderRadius: 12,
              alignItems: 'center'
            }}
          >
            <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
              Explore Available Food
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/donate')}
            style={{
              backgroundColor: 'white',
              paddingVertical: 16,
              paddingHorizontal: 24,
              borderRadius: 12,
              alignItems: 'center',
              borderWidth: 2,
              borderColor: '#16A34A'
            }}
          >
            <Text style={{ color: '#16A34A', fontSize: 16, fontWeight: '600' }}>
              Donate Food
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      <StatusBar style="dark" />
      
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ 
          paddingTop: insets.top + 20,
          paddingHorizontal: 20,
          paddingBottom: 20,
          backgroundColor: 'white'
        }}>
          <View style={{ 
            flexDirection: 'row', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: 16
          }}>
            <View>
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1F2937' }}>
                Good morning! 👋
              </Text>
              <Text style={{ fontSize: 16, color: '#6B7280', marginTop: 4 }}>
                Ready to make a difference today?
              </Text>
            </View>
            <TouchableOpacity
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: '#F3F4F6',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Bell size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Impact Stats */}
        {userStats && (
          <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
            <Text style={{ 
              fontSize: 18, 
              fontWeight: '600', 
              color: '#1F2937',
              marginBottom: 12
            }}>
              Your Impact
            </Text>
            <View style={{ 
              flexDirection: 'row', 
              backgroundColor: 'white',
              borderRadius: 16,
              padding: 16,
              gap: 16
            }}>
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#16A34A' }}>
                  {userStats.itemsDonated || 0}
                </Text>
                <Text style={{ fontSize: 12, color: '#6B7280', textAlign: 'center' }}>
                  Items{'\n'}Donated
                </Text>
              </View>
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#16A34A' }}>
                  {userStats.itemsReceived || 0}
                </Text>
                <Text style={{ fontSize: 12, color: '#6B7280', textAlign: 'center' }}>
                  Items{'\n'}Received
                </Text>
              </View>
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#16A34A' }}>
                  {userStats.co2Saved || 0}kg
                </Text>
                <Text style={{ fontSize: 12, color: '#6B7280', textAlign: 'center' }}>
                  CO₂{'\n'}Saved
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Quick Actions */}
        <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
          <Text style={{ 
            fontSize: 18, 
            fontWeight: '600', 
            color: '#1F2937',
            marginBottom: 12
          }}>
            Quick Actions
          </Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/donate')}
              style={{
                flex: 1,
                backgroundColor: '#16A34A',
                paddingVertical: 16,
                paddingHorizontal: 16,
                borderRadius: 12,
                alignItems: 'center'
              }}
            >
              <Text style={{ color: 'white', fontSize: 14, fontWeight: '600' }}>
                Donate Food
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/discover')}
              style={{
                flex: 1,
                backgroundColor: 'white',
                paddingVertical: 16,
                paddingHorizontal: 16,
                borderRadius: 12,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: '#E5E7EB'
              }}
            >
              <Text style={{ color: '#1F2937', fontSize: 14, fontWeight: '600' }}>
                Find Food
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Listings */}
        <View style={{ paddingHorizontal: 20 }}>
          <View style={{ 
            flexDirection: 'row', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: 12
          }}>
            <Text style={{ 
              fontSize: 18, 
              fontWeight: '600', 
              color: '#1F2937'
            }}>
              Recent Listings
            </Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/discover')}>
              <Text style={{ color: '#16A34A', fontSize: 14, fontWeight: '500' }}>
                See All
              </Text>
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <View style={{ 
              backgroundColor: 'white',
              borderRadius: 12,
              padding: 20,
              alignItems: 'center'
            }}>
              <Text style={{ color: '#6B7280' }}>Loading...</Text>
            </View>
          ) : recentListings?.length > 0 ? (
            <View style={{ gap: 12 }}>
              {recentListings.slice(0, 3).map((listing) => (
                <TouchableOpacity
                  key={listing.id}
                  onPress={() => router.push(`/(tabs)/listing/${listing.id}`)}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: 12,
                    padding: 16,
                    borderWidth: 1,
                    borderColor: '#E5E7EB'
                  }}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text style={{ 
                      fontSize: 16, 
                      fontWeight: '600', 
                      color: '#1F2937',
                      flex: 1
                    }}>
                      {listing.title}
                    </Text>
                    <Text style={{ 
                      fontSize: 14, 
                      fontWeight: '500', 
                      color: '#16A34A'
                    }}>
                      {listing.quantity} {listing.unit}
                    </Text>
                  </View>
                  
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <MapPin size={14} color="#6B7280" />
                      <Text style={{ fontSize: 12, color: '#6B7280' }}>
                        {listing.pickup_location}
                      </Text>
                    </View>
                    {listing.expiry_date && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Clock size={14} color="#6B7280" />
                        <Text style={{ fontSize: 12, color: '#6B7280' }}>
                          Expires {new Date(listing.expiry_date).toLocaleDateString()}
                        </Text>
                      </View>
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
              <Users size={32} color="#6B7280" />
              <Text style={{ 
                fontSize: 16, 
                fontWeight: '500', 
                color: '#1F2937',
                marginTop: 8,
                marginBottom: 4
              }}>
                No listings yet
              </Text>
              <Text style={{ 
                fontSize: 14, 
                color: '#6B7280',
                textAlign: 'center'
              }}>
                Be the first to share food in your community
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}