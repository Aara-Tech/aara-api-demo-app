import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator, // Import ActivityIndicator for loading
} from "react-native";
import { useLocalSearchParams, useNavigation } from "expo-router";

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
const AARA_API_KEY = process.env.EXPO_PUBLIC_AARA_API_KEY;
const UNIQUE_USER_ID = process.env.EXPO_PUBLIC_UNIQUE_USER_ID;

const screenWidth = Dimensions.get("window").width;
const imageWidth = screenWidth - 80; // Width of the screen minus 30px

interface OpeningHours {
  name: string;
  open: boolean;
  index: number;
  opening: { to: string; from: string }[];
}

interface Spot {
  id: string;
  name: string;
  shortDescription: string | null;
  description: string | null;
  phone: string | null;
  fullAddress: string | null;
  lat: number | null;
  lng: number | null;
  isActive: boolean;
  isBookmarked: boolean;
  category: {
    name: string | null;
    id: string | null;
  };
  medias: {
    url: string;
    id: string;
  }[];
  openingHours: OpeningHours[];
}

export default function SpotScreen() {
  const { id } = useLocalSearchParams();
  const navigation = useNavigation(); // Access navigation object
  const [spot, setSpot] = useState<Spot | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Loading state

  useEffect(() => {
    fetchSpotDetails();
  }, [id]);

  async function fetchSpotDetails() {
    try {
      const response = await fetch(`${BACKEND_URL}/spots/${id}`, {
        method: "GET",
        headers: {
          aara_api_key: AARA_API_KEY || "",
          unique_user_id: UNIQUE_USER_ID || "",
        },
      });
      if (response.ok) {
        const data = await response.json();
        setSpot(data);

        // Set the top bar title dynamically based on the spot's name
        if (data && data.name) {
          navigation.setOptions({ title: data.name });
        }
      } else {
        console.error("Error fetching spot details:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching spot details:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function toggleBookmark() {
    if (!spot) return;

    try {
      const response = await fetch(
        `${BACKEND_URL}/spots/${spot.id}/toggleBookmark`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            aara_api_key: AARA_API_KEY || "",
            unique_user_id: UNIQUE_USER_ID || "",
          },
        }
      );
      if (response.ok) {
        const updatedSpot = await response.json();
        setSpot(updatedSpot);
      } else {
        console.error("Error toggling bookmark:", response.statusText);
      }
    } catch (error) {
      console.error("Error toggling bookmark:", error);
    }
  }

  // Show loading spinner while data is fetching
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!spot) {
    return <Text>No details found</Text>;
  }

  return (
    <ScrollView style={styles.container}>
      {spot.medias.length > 0 ? (
        spot.medias.length === 1 ? (
          <Image
            source={{ uri: spot.medias[0].url }}
            style={styles.singleImage}
            resizeMode="cover"
          />
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            pagingEnabled
            style={styles.imageScroll}
          >
            {spot.medias.map((media) => (
              <View key={media.id} style={styles.imageContainer}>
                <Image
                  source={{ uri: media.url }}
                  style={styles.image}
                  resizeMode="cover"
                />
              </View>
            ))}
          </ScrollView>
        )
      ) : (
        <Text>No images available</Text>
      )}
      <View style={styles.details}>
        <Text style={styles.title}>{spot.name}</Text>

        <View style={styles.section}>
          <View style={styles.bookmarkContainer}>
            <Text style={styles.bookmarkStatus}>
              {spot.isBookmarked ? "Bookmarked" : "Not bookmarked"}
            </Text>
            <TouchableOpacity
              onPress={toggleBookmark}
              style={styles.bookmarkButton}
            >
              <Text style={styles.bookmarkButtonText}>
                {spot.isBookmarked ? "Remove Bookmark" : "Add Bookmark"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.shortDescription}>{spot.shortDescription}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Address:</Text>
          <Text style={styles.address}>{spot.fullAddress}</Text>
        </View>
        {!!spot.phone && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Phone:</Text>
            <Text style={styles.phone}>{spot.phone}</Text>
          </View>
        )}

        {spot.openingHours && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Opening Hours:</Text>
            {spot.openingHours.map((day) => (
              <Text key={day.name} style={styles.openingHoursDay}>
                {day.name}:{" "}
                {day.open
                  ? day.opening.map((hours, index) => (
                      <React.Fragment key={index}>
                        {hours.from} - {hours.to}
                        {index < day.opening.length - 1 ? ", " : ""}
                      </React.Fragment>
                    ))
                  : "Closed"}
              </Text>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  imageScroll: {
    height: 450,
  },
  imageContainer: {
    width: imageWidth,
    height: 450,
    marginRight: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  singleImage: {
    width: "100%",
    height: 450,
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
  details: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  bookmarkContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 10,
  },
  bookmarkStatus: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#555",
  },
  bookmarkButton: {
    backgroundColor: "#007BFF", // Unified blue color
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 5,
  },
  bookmarkButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  shortDescription: {
    fontSize: 18,
    color: "#555",
    marginVertical: 8,
  },
  description: {
    fontSize: 16,
    color: "#333",
  },
  address: {
    fontSize: 16,
    color: "#666",
    marginVertical: 8,
  },
  phone: {
    fontSize: 16,
    color: "#666",
  },
  openingHoursDay: {
    fontSize: 16,
    color: "#333",
    marginVertical: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
});
