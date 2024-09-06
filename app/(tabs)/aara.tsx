import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  ScrollView,
  View,
  Image,
  Text,
  TouchableOpacity,
  Button,
  ActivityIndicator,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import CreateJourneyForm from "@/components/CreateJourneyForm";

const AARA_API_KEY = process.env.EXPO_PUBLIC_AARA_API_KEY;
const UNIQUE_USER_ID = process.env.EXPO_PUBLIC_UNIQUE_USER_ID;
const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

interface City {
  id: string;
  name: string;
}

interface DirectionData {
  latitude: number;
  longitude: number;
}

interface Media {
  id: string;
  url: string;
}

interface Category {
  id: string;
  name: string | null;
}

interface SpotCompact {
  id: string;
  lat: number;
  lng: number;
  shortDescription: string;
  name: string;
  description: string | null;
  category: Category;
  medias: Media[];
  isActive: boolean;
  phone: string | null;
  fullAddress: string;
}

interface Journey {
  id: string;
  name: string | null;
  createdAt: string;
  isBookmarked: boolean;
  distance: number | null;
  duration: number | null;
  directionData: DirectionData[];
  city: City;
  spots: SpotCompact[];
}

export default function AaraScreen() {
  const [spots, setSpots] = useState<SpotCompact[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasJourney, setHasJourney] = useState<boolean | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    fetchLastJourney();
  }, []);

  const fetchLastJourney = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/journeys/last`, {
        method: "GET",
        headers: {
          aara_api_key: AARA_API_KEY || "",
          unique_user_id: UNIQUE_USER_ID || "",
        },
      });
      if (response.ok) {
        const data: Journey = await response.json();
        setSpots(data.spots);
        setHasJourney(true);
      } else if (response.status === 404) {
        setSpots([]);
        setHasJourney(false);
      } else {
        console.error("Error fetching journey:", response.statusText);
        setHasJourney(null);
      }
    } catch (error) {
      console.error("Error fetching journey:", error);
      setHasJourney(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewPathSubmit = (formData) => {
    setIsLoading(true);
    setModalVisible(false);

    fetch(`${BACKEND_URL}/journeys`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        aara_api_key: AARA_API_KEY || "",
        unique_user_id: UNIQUE_USER_ID || "",
      },
      body: JSON.stringify(formData),
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        throw new Error("Error creating new path: " + response.statusText);
      })
      .then((data: Journey) => {
        setSpots(data.spots);
        setHasJourney(true);
      })
      .catch((error) => {
        console.error(error);
        // You might want to show an error message to the user here
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  // New function to handle the "Paris" API call
  const fetchJourneyByCity = async (city: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/journeys`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          aara_api_key: AARA_API_KEY || "",
          unique_user_id: UNIQUE_USER_ID || "",
        },
        body: JSON.stringify({ city }),
      });
      if (response.ok) {
        const data: Journey = await response.json();
        setSpots(data.spots);
        setHasJourney(true);
      } else {
        console.error("Error fetching journey by city:", response.statusText);
        setHasJourney(null);
      }
    } catch (error) {
      console.error("Error fetching journey by city:", error);
      setHasJourney(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpotClick = (spotId: string) => {
    router.push(`/spot/${spotId}`);
  };

  const toggleModal = () => {
    setModalVisible(!modalVisible);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.headerContainer}>
        <ThemedText type="title">
          {hasJourney ? "Your last path" : "Create a new path"}
        </ThemedText>
        {hasJourney && (
          <View style={styles.buttonGroup}>
            <Button title="New Path" onPress={toggleModal} />
            <Button
              title="Journey in Paris"
              onPress={() => fetchJourneyByCity("Paris")}
            />
          </View>
        )}
      </View>
      {hasJourney === false ? (
        <ScrollView
          style={styles.scrollview}
          showsVerticalScrollIndicator={false}
        >
          <CreateJourneyForm onSubmit={handleNewPathSubmit} />
        </ScrollView>
      ) : hasJourney ? (
        <ScrollView
          style={styles.scrollview}
          showsVerticalScrollIndicator={false}
        >
          {spots.map((spotItem) => (
            <TouchableOpacity
              key={spotItem.id}
              style={styles.spotContainer}
              onPress={() => handleSpotClick(spotItem.id)}
            >
              {spotItem.medias.length > 0 && (
                <Image
                  source={{ uri: spotItem.medias[0].url }}
                  style={styles.spotImage}
                />
              )}
              <View style={styles.textContainer}>
                <Text style={styles.spotName}>{spotItem.name}</Text>
                <Text style={styles.spotDescription}>
                  {spotItem.shortDescription}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <Text>An error occurred. Please try again.</Text>
      )}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={toggleModal}
      >
        <TouchableWithoutFeedback onPress={toggleModal}>
          <View style={styles.modalBackdrop}>
            <TouchableWithoutFeedback>
              <View style={styles.centeredView}>
                <View style={styles.modalView}>
                  <CreateJourneyForm
                    onSubmit={handleNewPathSubmit}
                    onClose={toggleModal}
                  />
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 16,
    paddingTop: 16,
  },
  scrollview: {
    flex: 1,
    paddingTop: 24,
  },
  spotContainer: {
    flexDirection: "row",
    marginBottom: 16,
    alignItems: "flex-start",
  },
  spotImage: {
    width: 140,
    height: 200,
    borderRadius: 15,
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  spotName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  spotDescription: {
    fontSize: 16,
    color: "#333",
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalView: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: "90%",
    maxWidth: 400,
  },
});
