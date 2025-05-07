import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Image, StyleSheet } from "react-native";
import { ActivityIndicator, Card } from "react-native-paper";  // Import components from react-native-paper
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { auth, db, storage, analytics } from './firebaseConfig';

export default function IncidentListScreen() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "incidents"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reports = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setIncidents(reports);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#007FFF" />
        <Text>Loading reports...</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={incidents}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.title}>📝 {item.description}</Text>
            <Text style={styles.text}>Cause: {item.cause}</Text>
            {item.imageUri && (
              <Image source={{ uri: item.imageUri }} style={styles.image} />
            )}
            <Text style={styles.text}>
              📍 {item.location?.latitude?.toFixed(4)}, {item.location?.longitude?.toFixed(4)}
            </Text>
            <Text style={styles.timestamp}>
              {item.timestamp?.toDate?.().toLocaleString() ?? "Pending timestamp"}
            </Text>
          </Card.Content>
        </Card>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: 15 },
  card: {
    marginBottom: 15,
    elevation: 3,
  },
  title: { fontSize: 16, fontWeight: "bold", color: "#007FFF" },
  text: { marginTop: 5, fontSize: 14, color: "#333" },
  image: { width: "100%", height: 200, marginTop: 10, borderRadius: 8 },
  timestamp: { marginTop: 8, fontSize: 12, color: "#888", fontStyle: "italic" },
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
});
