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
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons"; // For the refresh icon
import CreateJourneyForm, { FormData } from "@/components/CreateJourneyForm";

const AARA_API_KEY = process.env.EXPO_PUBLIC_AARA_API_KEY;
const UNIQUE_USER_ID = process.env.EXPO_PUBLIC_UNIQUE_USER_ID;
const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

interface SpotCompact {
  id: string;
  lat: number;
  lng: number;
  shortDescription: string;
  name: string;
  description: string | null;
  category: {
    id: string;
    name: string | null;
  };
  medias: { id: string; url: string }[];
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
  directionData: { latitude: number; longitude: number }[];
  city: { id: string; name: string };
  spots: SpotCompact[];
}

export default function AaraScreen() {
  const [spots, setSpots] = useState<SpotCompact[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasJourney, setHasJourney] = useState<boolean | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    cityName: "Paris",
    categoryNames: [],
    from: 8,
    to: 23,
    price: [],
  });
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

  const handleNewPathSubmit = (submittedFormData: FormData) => {
    setFormData(submittedFormData);
    setIsLoading(true);
    setModalVisible(false);

    fetch(`${BACKEND_URL}/journeys`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        aara_api_key: AARA_API_KEY || "",
        unique_user_id: UNIQUE_USER_ID || "",
      },
      body: JSON.stringify(submittedFormData),
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
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleRefreshSubmit = () => {
    handleNewPathSubmit(formData);
  };

  const toggleModal = () => {
    setModalVisible(!modalVisible);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007BFF" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        style={styles.scrollview}
        showsVerticalScrollIndicator={false}
      >
        {hasJourney ? (
          <>
            <Text style={styles.pageTitle}>Your last journey</Text>
            {spots.map((spotItem) => (
              <TouchableOpacity
                key={spotItem.id}
                style={styles.spotContainer}
                onPress={() => router.push(`/spot/${spotItem.id}`)}
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
          </>
        ) : (
          <CreateJourneyForm
            initialData={formData}
            onSubmit={handleNewPathSubmit}
          />
        )}
      </ScrollView>

      {/* Floating action buttons */}
      <View style={styles.fabContainer}>
        {/* New Path Button */}
        <TouchableOpacity style={styles.newPathButton} onPress={toggleModal}>
          <Text style={styles.newPathButtonText}>New Path</Text>
        </TouchableOpacity>

        {/* Refresh Button */}
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={handleRefreshSubmit}
        >
          <MaterialIcons name="refresh" size={24} color="white" />
        </TouchableOpacity>
      </View>

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
                    initialData={formData}
                    onSubmit={handleNewPathSubmit}
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
    paddingHorizontal: 20,
  },
  scrollview: {
    flex: 1,
    paddingTop: 32,
    paddingBottom: 80,
  },
  pageTitle: {
    fontSize: 24,
    marginBottom: 32,
  },
  spotContainer: {
    flexDirection: "row",
    marginBottom: 32,
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
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  spotDescription: {
    fontSize: 14,
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
  // Floating action buttons styles
  fabContainer: {
    position: "absolute",
    bottom: 20, // Distance from bottom for both buttons
    left: 20,
    right: 20,
    flexDirection: "row", // Arrange buttons in a row
    justifyContent: "space-between",
    alignItems: "center",
  },
  newPathButton: {
    backgroundColor: "#007BFF",
    paddingVertical: 10,
    paddingHorizontal: 32,
    borderRadius: 30,
    alignSelf: "center",
    flex: 1, // Make this button take more space
    marginRight: 10, // Space between buttons
  },
  newPathButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  refreshButton: {
    backgroundColor: "#007BFF",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 30,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  centeredView: {
    justifyContent: "center",
    alignItems: "center",
  },
  modalView: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    width: "90%",
    maxWidth: 400,
  },
});
