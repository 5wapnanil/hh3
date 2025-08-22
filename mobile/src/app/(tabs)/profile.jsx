import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/utils/auth/useAuth';
import { useQuery } from '@tanstack/react-query';
import { User, Settings, Heart, Gift, BarChart3, Shield, HelpCircle, LogOut, Edit } from 'lucide-react-native';
import { router } from 'expo-router';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { auth, signIn, signOut } = useAuth();

  // Fetch user profile
  const { data: userProfile, isLoading } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const response = await fetch('/api/users/profile');
      if (!response.ok) throw new Error('Failed to fetch profile');
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

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: () => signOut()
        }
      ]
    );
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
        <User size={64} color="#6B7280" />
        <Text style={{ 
          fontSize: 24, 
          fontWeight: 'bold', 
          color: '#1F2937',
          marginTop: 16,
          marginBottom: 8,
          textAlign: 'center'
        }}>
          Your Profile
        </Text>
        <Text style={{ 
          fontSize: 16, 
          color: '#6B7280',
          textAlign: 'center',
          marginBottom: 32,
          lineHeight: 24
        }}>
          Sign in to view your profile{'\n'}and track your impact
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
      
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
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
            <Text style={{ 
              fontSize: 24, 
              fontWeight: 'bold', 
              color: '#1F2937'
            }}>
              Profile
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/profile-setup')}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: '#F3F4F6',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Edit size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* User Info */}
          <View style={{ 
            flexDirection: 'row', 
            alignItems: 'center',
            backgroundColor: '#F9FAFB',
            borderRadius: 16,
            padding: 16
          }}>
            <View style={{
              width: 60,
              height: 60,
              borderRadius: 30,
              backgroundColor: '#16A34A',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 16
            }}>
              <Text style={{ 
                color: 'white', 
                fontSize: 24, 
                fontWeight: 'bold' 
              }}>
                {userProfile?.full_name?.charAt(0) || auth.user.email?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ 
                fontSize: 18, 
                fontWeight: '600', 
                color: '#1F2937',
                marginBottom: 4
              }}>
                {userProfile?.full_name || 'User'}
              </Text>
              <Text style={{ 
                fontSize: 14, 
                color: '#6B7280',
                marginBottom: 4
              }}>
                {auth.user.email}
              </Text>
              {userProfile?.user_type && (
                <View style={{
                  backgroundColor: userProfile.user_type === 'donor' ? '#DCFCE7' : '#DBEAFE',
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 12,
                  alignSelf: 'flex-start'
                }}>
                  <Text style={{ 
                    color: userProfile.user_type === 'donor' ? '#16A34A' : '#2563EB',
                    fontSize: 12, 
                    fontWeight: '500',
                    textTransform: 'capitalize'
                  }}>
                    {userProfile.user_type}
                  </Text>
                </View>
              )}
            </View>
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
              backgroundColor: 'white',
              borderRadius: 16,
              padding: 16
            }}>
              <View style={{ 
                flexDirection: 'row', 
                justifyContent: 'space-between',
                marginBottom: 16
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
              
              <View style={{
                backgroundColor: '#F0FDF4',
                borderRadius: 12,
                padding: 12,
                alignItems: 'center'
              }}>
                <Text style={{ 
                  fontSize: 14, 
                  color: '#16A34A',
                  fontWeight: '500'
                }}>
                  🌱 You've helped save ${(userStats.valueSaved || 0).toFixed(0)} worth of food!
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Menu Items */}
        <View style={{ paddingHorizontal: 20 }}>
          <View style={{ 
            backgroundColor: 'white',
            borderRadius: 16,
            overflow: 'hidden'
          }}>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/saved')}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 16,
                paddingVertical: 16,
                borderBottomWidth: 1,
                borderBottomColor: '#F3F4F6'
              }}
            >
              <Heart size={20} color="#6B7280" />
              <Text style={{ 
                fontSize: 16, 
                color: '#1F2937',
                marginLeft: 12,
                flex: 1
              }}>
                Saved Items
              </Text>
              <Text style={{ fontSize: 14, color: '#6B7280' }}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 16,
                paddingVertical: 16,
                borderBottomWidth: 1,
                borderBottomColor: '#F3F4F6'
              }}
            >
              <Gift size={20} color="#6B7280" />
              <Text style={{ 
                fontSize: 16, 
                color: '#1F2937',
                marginLeft: 12,
                flex: 1
              }}>
                My Donations
              </Text>
              <Text style={{ fontSize: 14, color: '#6B7280' }}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 16,
                paddingVertical: 16,
                borderBottomWidth: 1,
                borderBottomColor: '#F3F4F6'
              }}
            >
              <BarChart3 size={20} color="#6B7280" />
              <Text style={{ 
                fontSize: 16, 
                color: '#1F2937',
                marginLeft: 12,
                flex: 1
              }}>
                Impact Analytics
              </Text>
              <Text style={{ fontSize: 14, color: '#6B7280' }}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 16,
                paddingVertical: 16,
                borderBottomWidth: 1,
                borderBottomColor: '#F3F4F6'
              }}
            >
              <Shield size={20} color="#6B7280" />
              <Text style={{ 
                fontSize: 16, 
                color: '#1F2937',
                marginLeft: 12,
                flex: 1
              }}>
                Safety Guidelines
              </Text>
              <Text style={{ fontSize: 14, color: '#6B7280' }}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 16,
                paddingVertical: 16,
                borderBottomWidth: 1,
                borderBottomColor: '#F3F4F6'
              }}
            >
              <Settings size={20} color="#6B7280" />
              <Text style={{ 
                fontSize: 16, 
                color: '#1F2937',
                marginLeft: 12,
                flex: 1
              }}>
                Settings
              </Text>
              <Text style={{ fontSize: 14, color: '#6B7280' }}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 16,
                paddingVertical: 16
              }}
            >
              <HelpCircle size={20} color="#6B7280" />
              <Text style={{ 
                fontSize: 16, 
                color: '#1F2937',
                marginLeft: 12,
                flex: 1
              }}>
                Help & Support
              </Text>
              <Text style={{ fontSize: 14, color: '#6B7280' }}>›</Text>
            </TouchableOpacity>
          </View>

          {/* Sign Out */}
          <TouchableOpacity
            onPress={handleSignOut}
            style={{
              backgroundColor: 'white',
              borderRadius: 16,
              marginTop: 16,
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 16,
              paddingVertical: 16
            }}
          >
            <LogOut size={20} color="#EF4444" />
            <Text style={{ 
              fontSize: 16, 
              color: '#EF4444',
              marginLeft: 12,
              fontWeight: '500'
            }}>
              Sign Out
            </Text>
          </TouchableOpacity>

          {/* App Info */}
          <View style={{ 
            alignItems: 'center',
            marginTop: 24,
            paddingHorizontal: 20
          }}>
            <Text style={{ 
              fontSize: 12, 
              color: '#9CA3AF',
              textAlign: 'center',
              lineHeight: 18
            }}>
              Trophos v1.0{'\n'}
              Building a zero-waste community
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}