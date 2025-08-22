import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/utils/auth/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Camera,
  MapPin,
  Calendar,
  Clock,
  Plus,
  Image as ImageIcon,
} from "lucide-react-native";
import { router } from "expo-router";
import * as Location from "expo-location";
import * as ImagePicker from "expo-image-picker";
import useUpload from "@/utils/useUpload";
import KeyboardAvoidingAnimatedView from "@/components/KeyboardAvoidingAnimatedView";

export default function DonateScreen() {
  const insets = useSafeAreaInsets();
  const { auth, signIn } = useAuth();
  const queryClient = useQueryClient();
  const [upload, { loading: uploadLoading }] = useUpload();

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category_id: "",
    quantity: "",
    unit: "",
    expiry_date: "",
    pickup_location: "",
    pickup_instructions: "",
    safety_notes: "",
    dietary_info: "",
    image_urls: [],
  });
  const [location, setLocation] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);

  // Get location permission and current location
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        let location = await Location.getCurrentPositionAsync({});
        setLocation(location.coords);
        // Auto-fill location if available
        if (!formData.pickup_location) {
          let address = await Location.reverseGeocodeAsync(location.coords);
          if (address[0]) {
            const addr = address[0];
            setFormData((prev) => ({
              ...prev,
              pickup_location:
                `${addr.street || ""} ${addr.city || ""}, ${addr.region || ""}`.trim(),
            }));
          }
        }
      }
    })();
  }, []);

  // Fetch food categories
  const { data: categories } = useQuery({
    queryKey: ["foodCategories"],
    queryFn: async () => {
      const response = await fetch("/api/categories");
      if (!response.ok) throw new Error("Failed to fetch categories");
      return response.json();
    },
  });

  // Fetch user profile
  const { data: userProfile, isLoading: profileLoading } = useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      const response = await fetch("/api/users/profile");
      if (!response.ok) {
        if (response.status === 404) {
          return null; // User profile doesn't exist yet
        }
        throw new Error("Failed to fetch profile");
      }
      return response.json();
    },
    enabled: !!auth,
  });

  // Create listing mutation
  const createListingMutation = useMutation({
    mutationFn: async (listingData) => {
      const response = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(listingData),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create listing");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["listings"]);
      queryClient.invalidateQueries(["recentListings"]);
      queryClient.invalidateQueries(["userStats"]);
      Alert.alert("Success", "Your food donation has been listed!", [
        { text: "OK", onPress: () => router.push("/(tabs)") },
      ]);
    },
    onError: (error) => {
      Alert.alert("Error", error.message);
    },
  });

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
      allowsMultipleSelection: true,
    });

    if (!result.canceled) {
      setSelectedImages((prev) => [...prev, ...result.assets]);
    }
  };

  const uploadImages = async () => {
    const uploadedUrls = [];
    for (const image of selectedImages) {
      try {
        const { url, error } = await upload({ reactNativeAsset: image });
        if (error) throw new Error(error);
        uploadedUrls.push(url);
      } catch (error) {
        console.error("Image upload failed:", error);
      }
    }
    return uploadedUrls;
  };

  const handleSubmit = async () => {
    if (
      !formData.title ||
      !formData.quantity ||
      !formData.unit ||
      !formData.pickup_location
    ) {
      Alert.alert(
        "Error",
        "Please fill in all required fields (Title, Quantity, Unit, and Pickup Location)",
      );
      return;
    }

    try {
      // Upload images if any
      let imageUrls = [];
      if (selectedImages.length > 0) {
        console.log("Uploading images...");
        imageUrls = await uploadImages();
        console.log("Images uploaded:", imageUrls);
      }

      const listingData = {
        ...formData,
        quantity: parseInt(formData.quantity),
        pickup_latitude: location?.latitude,
        pickup_longitude: location?.longitude,
        image_urls: imageUrls.length > 0 ? imageUrls : null,
        expiry_date: formData.expiry_date
          ? new Date(formData.expiry_date).toISOString()
          : null,
      };

      console.log("Creating listing with data:", listingData);
      createListingMutation.mutate(listingData);
    } catch (error) {
      console.error("Submit error:", error);
      Alert.alert("Error", "Failed to create listing: " + error.message);
    }
  };

  if (!auth) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#F9FAFB",
          paddingTop: insets.top,
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}
      >
        <StatusBar style="dark" />
        <Text
          style={{
            fontSize: 24,
            fontWeight: "bold",
            color: "#1F2937",
            marginBottom: 16,
            textAlign: "center",
          }}
        >
          Donate Food
        </Text>
        <Text
          style={{
            fontSize: 16,
            color: "#6B7280",
            textAlign: "center",
            marginBottom: 32,
            lineHeight: 24,
          }}
        >
          Sign in to share food{"\n"}with your community
        </Text>
        <TouchableOpacity
          onPress={() => signIn()}
          style={{
            backgroundColor: "#16A34A",
            paddingVertical: 16,
            paddingHorizontal: 32,
            borderRadius: 12,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "white", fontSize: 16, fontWeight: "600" }}>
            Sign In
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (profileLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#F9FAFB",
          paddingTop: insets.top,
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}
      >
        <StatusBar style="dark" />
        <Text
          style={{
            fontSize: 24,
            fontWeight: "bold",
            color: "#1F2937",
            marginBottom: 16,
            textAlign: "center",
          }}
        >
          Donate Food
        </Text>
        <Text
          style={{
            fontSize: 16,
            color: "#6B7280",
            textAlign: "center",
            marginBottom: 32,
            lineHeight: 24,
          }}
        >
          Loading profile...
        </Text>
      </View>
    );
  }

  if (!userProfile) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#F9FAFB",
          paddingTop: insets.top,
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}
      >
        <StatusBar style="dark" />
        <Text
          style={{
            fontSize: 24,
            fontWeight: "bold",
            color: "#1F2937",
            marginBottom: 16,
            textAlign: "center",
          }}
        >
          Complete Your Profile
        </Text>
        <Text
          style={{
            fontSize: 16,
            color: "#6B7280",
            textAlign: "center",
            marginBottom: 32,
            lineHeight: 24,
          }}
        >
          Please complete your profile{"\n"}before donating food
        </Text>
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/profile-setup")}
          style={{
            backgroundColor: "#16A34A",
            paddingVertical: 16,
            paddingHorizontal: 32,
            borderRadius: 12,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "white", fontSize: 16, fontWeight: "600" }}>
            Complete Profile
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingAnimatedView
      style={{ flex: 1, backgroundColor: "#F9FAFB" }}
      behavior="padding"
    >
      <StatusBar style="dark" />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View
          style={{
            paddingTop: insets.top + 20,
            paddingHorizontal: 20,
            paddingBottom: 20,
            backgroundColor: "white",
          }}
        >
          <Text
            style={{
              fontSize: 24,
              fontWeight: "bold",
              color: "#1F2937",
              marginBottom: 8,
            }}
          >
            Donate Food
          </Text>
          <Text
            style={{
              fontSize: 16,
              color: "#6B7280",
            }}
          >
            Share surplus food with those who need it
          </Text>
        </View>

        <View style={{ padding: 20, gap: 20 }}>
          {/* Basic Information */}
          <View
            style={{ backgroundColor: "white", borderRadius: 16, padding: 16 }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "600",
                color: "#1F2937",
                marginBottom: 16,
              }}
            >
              Basic Information
            </Text>

            <View style={{ gap: 16 }}>
              <View>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "500",
                    color: "#374151",
                    marginBottom: 8,
                  }}
                >
                  Food Title *
                </Text>
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: "#E5E7EB",
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    fontSize: 16,
                    color: "#1F2937",
                  }}
                  placeholder="e.g., Fresh vegetables, Homemade bread"
                  value={formData.title}
                  onChangeText={(text) =>
                    setFormData((prev) => ({ ...prev, title: text }))
                  }
                />
              </View>

              <View>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "500",
                    color: "#374151",
                    marginBottom: 8,
                  }}
                >
                  Description
                </Text>
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: "#E5E7EB",
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    fontSize: 16,
                    color: "#1F2937",
                    height: 80,
                    textAlignVertical: "top",
                  }}
                  placeholder="Describe the food, condition, etc."
                  value={formData.description}
                  onChangeText={(text) =>
                    setFormData((prev) => ({ ...prev, description: text }))
                  }
                  multiline
                />
              </View>

              <View>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "500",
                    color: "#374151",
                    marginBottom: 8,
                  }}
                >
                  Category
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    {categories?.map((category) => (
                      <TouchableOpacity
                        key={category.id}
                        onPress={() =>
                          setFormData((prev) => ({
                            ...prev,
                            category_id: category.id,
                          }))
                        }
                        style={{
                          paddingHorizontal: 16,
                          paddingVertical: 8,
                          borderRadius: 20,
                          backgroundColor:
                            formData.category_id === category.id
                              ? "#16A34A"
                              : "#F3F4F6",
                          borderWidth:
                            formData.category_id === category.id ? 0 : 1,
                          borderColor: "#E5E7EB",
                        }}
                      >
                        <Text
                          style={{
                            color:
                              formData.category_id === category.id
                                ? "white"
                                : "#6B7280",
                            fontSize: 14,
                            fontWeight: "500",
                          }}
                        >
                          {category.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>

              <View style={{ flexDirection: "row", gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "500",
                      color: "#374151",
                      marginBottom: 8,
                    }}
                  >
                    Quantity *
                  </Text>
                  <TextInput
                    style={{
                      borderWidth: 1,
                      borderColor: "#E5E7EB",
                      borderRadius: 12,
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      fontSize: 16,
                      color: "#1F2937",
                    }}
                    placeholder="5"
                    value={formData.quantity}
                    onChangeText={(text) =>
                      setFormData((prev) => ({ ...prev, quantity: text }))
                    }
                    keyboardType="numeric"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "500",
                      color: "#374151",
                      marginBottom: 8,
                    }}
                  >
                    Unit *
                  </Text>
                  <TextInput
                    style={{
                      borderWidth: 1,
                      borderColor: "#E5E7EB",
                      borderRadius: 12,
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      fontSize: 16,
                      color: "#1F2937",
                    }}
                    placeholder="kg, pieces, bags"
                    value={formData.unit}
                    onChangeText={(text) =>
                      setFormData((prev) => ({ ...prev, unit: text }))
                    }
                  />
                </View>
              </View>
            </View>
          </View>

          {/* Photos */}
          <View
            style={{ backgroundColor: "white", borderRadius: 16, padding: 16 }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "600",
                color: "#1F2937",
                marginBottom: 16,
              }}
            >
              Photos
            </Text>

            <TouchableOpacity
              onPress={pickImage}
              style={{
                borderWidth: 2,
                borderColor: "#E5E7EB",
                borderStyle: "dashed",
                borderRadius: 12,
                paddingVertical: 24,
                alignItems: "center",
                backgroundColor: "#F9FAFB",
              }}
            >
              <ImageIcon size={32} color="#6B7280" />
              <Text style={{ fontSize: 16, color: "#6B7280", marginTop: 8 }}>
                Add Photos
              </Text>
              <Text style={{ fontSize: 12, color: "#9CA3AF", marginTop: 4 }}>
                Help recipients see what you're offering
              </Text>
            </TouchableOpacity>

            {selectedImages.length > 0 && (
              <View style={{ marginTop: 12 }}>
                <Text style={{ fontSize: 14, color: "#6B7280" }}>
                  {selectedImages.length} photo(s) selected
                </Text>
              </View>
            )}
          </View>

          {/* Pickup Details */}
          <View
            style={{ backgroundColor: "white", borderRadius: 16, padding: 16 }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "600",
                color: "#1F2937",
                marginBottom: 16,
              }}
            >
              Pickup Details
            </Text>

            <View style={{ gap: 16 }}>
              <View>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "500",
                    color: "#374151",
                    marginBottom: 8,
                  }}
                >
                  Pickup Location *
                </Text>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <MapPin
                    size={20}
                    color="#6B7280"
                    style={{ marginRight: 8 }}
                  />
                  <TextInput
                    style={{
                      flex: 1,
                      borderWidth: 1,
                      borderColor: "#E5E7EB",
                      borderRadius: 12,
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      fontSize: 16,
                      color: "#1F2937",
                    }}
                    placeholder="Enter pickup address"
                    value={formData.pickup_location}
                    onChangeText={(text) =>
                      setFormData((prev) => ({
                        ...prev,
                        pickup_location: text,
                      }))
                    }
                  />
                </View>
              </View>

              <View>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "500",
                    color: "#374151",
                    marginBottom: 8,
                  }}
                >
                  Pickup Instructions
                </Text>
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: "#E5E7EB",
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    fontSize: 16,
                    color: "#1F2937",
                    height: 60,
                    textAlignVertical: "top",
                  }}
                  placeholder="e.g., Ring doorbell, available after 6pm"
                  value={formData.pickup_instructions}
                  onChangeText={(text) =>
                    setFormData((prev) => ({
                      ...prev,
                      pickup_instructions: text,
                    }))
                  }
                  multiline
                />
              </View>

              <View>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "500",
                    color: "#374151",
                    marginBottom: 8,
                  }}
                >
                  Expiry Date
                </Text>
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: "#E5E7EB",
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    fontSize: 16,
                    color: "#1F2937",
                  }}
                  placeholder="YYYY-MM-DD (optional)"
                  value={formData.expiry_date}
                  onChangeText={(text) =>
                    setFormData((prev) => ({ ...prev, expiry_date: text }))
                  }
                />
              </View>
            </View>
          </View>

          {/* Additional Information */}
          <View
            style={{ backgroundColor: "white", borderRadius: 16, padding: 16 }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "600",
                color: "#1F2937",
                marginBottom: 16,
              }}
            >
              Additional Information
            </Text>

            <View style={{ gap: 16 }}>
              <View>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "500",
                    color: "#374151",
                    marginBottom: 8,
                  }}
                >
                  Safety Notes
                </Text>
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: "#E5E7EB",
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    fontSize: 16,
                    color: "#1F2937",
                    height: 60,
                    textAlignVertical: "top",
                  }}
                  placeholder="Any safety considerations"
                  value={formData.safety_notes}
                  onChangeText={(text) =>
                    setFormData((prev) => ({ ...prev, safety_notes: text }))
                  }
                  multiline
                />
              </View>

              <View>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "500",
                    color: "#374151",
                    marginBottom: 8,
                  }}
                >
                  Dietary Information
                </Text>
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: "#E5E7EB",
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    fontSize: 16,
                    color: "#1F2937",
                    height: 60,
                    textAlignVertical: "top",
                  }}
                  placeholder="Allergens, dietary restrictions, etc."
                  value={formData.dietary_info}
                  onChangeText={(text) =>
                    setFormData((prev) => ({ ...prev, dietary_info: text }))
                  }
                  multiline
                />
              </View>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={createListingMutation.isLoading || uploadLoading}
            style={{
              backgroundColor:
                createListingMutation.isLoading || uploadLoading
                  ? "#9CA3AF"
                  : "#16A34A",
              paddingVertical: 16,
              borderRadius: 12,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: "white",
                fontSize: 16,
                fontWeight: "600",
              }}
            >
              {createListingMutation.isLoading || uploadLoading
                ? "Creating..."
                : "Create Listing"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingAnimatedView>
  );
}
