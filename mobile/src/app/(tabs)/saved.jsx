import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/utils/auth/useAuth';
import { Heart, MapPin, Clock, Search } from 'lucide-react-native';
import { router } from 'expo-router';

export default function SavedScreen() {
  const insets = useSafeAreaInsets();
  const { auth, signIn } = useAuth();
  const [savedItems] = useState([]); // Placeholder for saved items

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
        <Heart size={64} color="#6B7280" />
        <Text style={{ 
          fontSize: 24, 
          fontWeight: 'bold', 
          color: '#1F2937',
          marginTop: 16,
          marginBottom: 8,
          textAlign: 'center'
        }}>
          Saved Items
        </Text>
        <Text style={{ 
          fontSize: 16, 
          color: '#6B7280',
          textAlign: 'center',
          marginBottom: 32,
          lineHeight: 24
        }}>
          Sign in to save food items{'\n'}you're interested in
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
      
      {/* Header */}
      <View style={{ 
        paddingTop: insets.top + 20,
        paddingHorizontal: 20,
        paddingBottom: 20,
        backgroundColor: 'white'
      }}>
        <Text style={{ 
          fontSize: 24, 
          fontWeight: 'bold', 
          color: '#1F2937',
          marginBottom: 8
        }}>
          Saved Items
        </Text>
        <Text style={{ 
          fontSize: 16, 
          color: '#6B7280'
        }}>
          Food you've saved for later
        </Text>
      </View>

      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        {savedItems.length > 0 ? (
          <View style={{ gap: 16 }}>
            {savedItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => router.push(`/(tabs)/listing/${item.id}`)}
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
                      {item.title}
                    </Text>
                    {item.description && (
                      <Text style={{ 
                        fontSize: 14, 
                        color: '#6B7280',
                        lineHeight: 20
                      }}>
                        {item.description}
                      </Text>
                    )}
                  </View>
                  <TouchableOpacity
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: '#FEF2F2',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Heart size={20} color="#EF4444" fill="#EF4444" />
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
                      {item.quantity} {item.unit}
                    </Text>
                  </View>
                  {item.category_name && (
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
                        {item.category_name}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={{ gap: 8 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <MapPin size={16} color="#6B7280" />
                    <Text style={{ fontSize: 14, color: '#6B7280', flex: 1 }}>
                      {item.pickup_location}
                    </Text>
                  </View>
                  
                  {item.expiry_date && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Clock size={16} color="#6B7280" />
                      <Text style={{ fontSize: 14, color: '#6B7280' }}>
                        Expires {new Date(item.expiry_date).toLocaleDateString()}
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
            borderRadius: 16,
            padding: 32,
            alignItems: 'center'
          }}>
            <Heart size={48} color="#6B7280" />
            <Text style={{ 
              fontSize: 18, 
              fontWeight: '600', 
              color: '#1F2937',
              marginTop: 16,
              marginBottom: 8
            }}>
              No saved items yet
            </Text>
            <Text style={{ 
              fontSize: 14, 
              color: '#6B7280',
              textAlign: 'center',
              marginBottom: 24,
              lineHeight: 20
            }}>
              Save food items you're interested in{'\n'}to easily find them later
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/discover')}
              style={{
                backgroundColor: '#16A34A',
                paddingVertical: 12,
                paddingHorizontal: 24,
                borderRadius: 12,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8
              }}
            >
              <Search size={16} color="white" />
              <Text style={{ color: 'white', fontSize: 14, fontWeight: '600' }}>
                Discover Food
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}