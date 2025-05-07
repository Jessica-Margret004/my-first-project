import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Linking, Alert } from "react-native";
import * as Location from "expo-location";
import { useNavigation } from "@react-navigation/native";
import { auth, db, storage, analytics } from './firebaseConfig';
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import MapView, { Marker } from "react-native-maps";
import { Button } from "react-native-paper";  // Import Button from react-native-paper

export default function SafetyScreen() {
  const [incidents, setIncidents] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          const loc = await Location.getCurrentPositionAsync({});
          setUserLocation({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          });
        }

        const snapshot = await getDocs(collection(db, "incidents"));
        const list = snapshot.docs.map(doc => doc.data());
        setIncidents(list);
      } catch (error) {
        Alert.alert("Error", error.message);
      }
    };

    fetchData();
  }, []);

  const sendSOS = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "We need location access to send an SOS.");
      return;
    }

    const loc = await Location.getCurrentPositionAsync({});
    const user = auth.currentUser;
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      Alert.alert("Error", "User profile not found.");
      return;
    }

    const data = userSnap.data();
    const contacts = data.emergencyContacts || [];

    if (contacts.length === 0) {
      Alert.alert("No Contacts", "You haven't added emergency contacts yet.");
      return;
    }

    const message = `🚨 SOS from ${data.name}!\nLocation: https://maps.google.com/?q=${loc.coords.latitude},${loc.coords.longitude}`;

    contacts.forEach(contact => {
      const smsURL = `sms:${contact}?body=${encodeURIComponent(message)}`;
      Linking.openURL(smsURL).catch(() => {
        console.warn("SMS could not be sent to", contact);
      });
    });

    Alert.alert("SOS Sent", "Your emergency contacts have been notified.");
  };

  const callPolice = () => {
    Linking.openURL("tel:100").catch(() => Alert.alert("Error", "Unable to open dialer."));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>🚨 Safety Dashboard</Text>
      <Text style={styles.info}>Live safety alerts based on your location</Text>

      <MapView
        style={styles.map}
        initialRegion={{
          latitude: userLocation?.latitude || 12.9174,
          longitude: userLocation?.longitude || 80.2200,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {incidents.map((incident, index) => (
          <Marker
            key={index}
            coordinate={{ latitude: incident.latitude, longitude: incident.longitude }}
            title={`Incident ${index + 1}`}
            description={incident.description}
            pinColor="red"
          />
        ))}
      </MapView>

      <View style={styles.buttonContainer}>
        <Button mode="contained" onPress={sendSOS} style={styles.btnSOS}>
          Send SOS
        </Button>
        <Button mode="contained" onPress={callPolice} style={styles.btnPolice}>
          Call Police
        </Button>
        <Button
          mode="contained"
          onPress={() => navigation.navigate("IncidentReport")}
          style={styles.incidentBtn}
        >
          Report Incident
        </Button>
      </View>

      <TouchableOpacity
        style={styles.chatbotButton}
        onPress={() => Alert.alert("GuardianAI", "Chatbot launching soon!")}
      >
        <Text style={styles.chatbotText}>🤖 GuardianAI</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { fontSize: 26, fontWeight: "bold", marginVertical: 20, color: "#007FFF", textAlign: "center" },
  info: { fontSize: 16, marginBottom: 20, textAlign: "center", color: "#444" },
  map: { width: "100%", height: 300, marginBottom: 20 },
  buttonContainer: { alignItems: "center", gap: 20 },
  btnSOS: { backgroundColor: "#FF4C4C", padding: 15, borderRadius: 10, width: "80%", alignItems: "center" },
  btnPolice: { backgroundColor: "#007FFF", padding: 15, borderRadius: 10, width: "80%", alignItems: "center" },
  incidentBtn: { backgroundColor: "#FFA500", padding: 15, borderRadius: 10, width: "80%", alignItems: "center" },
  chatbotButton: { position: "absolute", bottom: 30, right: 20, backgroundColor: "#007FFF", paddingVertical: 12, paddingHorizontal: 16, borderRadius: 25 },
  chatbotText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
});
