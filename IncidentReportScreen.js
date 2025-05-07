import React, { useState } from "react";
import { View, Text, StyleSheet, Alert, Image } from "react-native";
import * as Location from "expo-location";
import * as ImagePicker from "expo-image-picker";
import { auth, db, storage, analytics } from './firebaseConfig';
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import uuid from "react-native-uuid";
import { TextInput, Button } from "react-native-paper";  // Import components from react-native-paper

export default function IncidentReportScreen({ navigation }) {
  const [description, setDescription] = useState("");
  const [cause, setCause] = useState("");
  const [image, setImage] = useState(null);
  const [location, setLocation] = useState(null);

  // ✅ Upload image to Firebase Storage
  const uploadImageAsync = async (uri) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const imageId = uuid.v4();
    const imageRef = ref(storage, `incident_images/${imageId}.jpg`);
    await uploadBytes(imageRef, blob);
    const downloadURL = await getDownloadURL(imageRef);
    return downloadURL;
  };

  // ✅ Pick image from library
  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission required", "Please allow media access to pick an image.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  // ✅ Get current GPS location
  const getLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission denied", "Location access is needed for reporting.");
      return;
    }

    const loc = await Location.getCurrentPositionAsync({});
    setLocation({
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
    });
  };

  // ✅ Submit report to Firestore
  const handleSubmit = async () => {
    if (!description || !cause || !location) {
      Alert.alert("Please complete all required fields and get location");
      return;
    }

    try {
      let imageUrl = null;
      if (image) {
        imageUrl = await uploadImageAsync(image);
      }

      await addDoc(collection(db, "incidents"), {
        userId: auth.currentUser.uid,
        description,
        cause,
        imageUri: imageUrl,
        location,
        timestamp: serverTimestamp(),
      });

      Alert.alert("Incident Reported", "Your report has been submitted.");
      setDescription("");
      setCause("");
      setImage(null);
      setLocation(null);
      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>📍 Report an Incident</Text>
      
      <TextInput
        label="Description"
        value={description}
        onChangeText={setDescription}
        style={styles.input}
        multiline
        numberOfLines={4}
        mode="outlined"
      />

      <TextInput
        label="Cause"
        value={cause}
        onChangeText={setCause}
        style={styles.input}
        mode="outlined"
      />

      <Button mode="outlined" onPress={pickImage} style={styles.button}>
        Pick Image (optional)
      </Button>
      {image && <Image source={{ uri: image }} style={styles.image} />}

      <Button mode="outlined" onPress={getLocation} style={styles.button}>
        Get Location
      </Button>
      {location && (
        <Text style={styles.locationText}>
          Location: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
        </Text>
      )}

      <Button mode="contained" onPress={handleSubmit} style={styles.submitButton}>
        Submit Report
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
    color: "#007FFF",
  },
  input: {
    marginBottom: 15,
  },
  button: {
    marginVertical: 10,
    width: "100%",
  },
  image: {
    width: "100%",
    height: 200,
    marginVertical: 10,
    borderRadius: 8,
  },
  locationText: {
    marginTop: 10,
    marginBottom: 15,
    fontStyle: "italic",
    color: "#333",
  },
  submitButton: {
    marginTop: 20,
  },
});
