import React, { useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { TextInput, Button, Picker } from "react-native-paper";  // Import from react-native-paper
import { auth, db, storage, analytics } from './firebaseConfig';
import { doc, setDoc } from "firebase/firestore";

export default function ProfileSetupScreen({ navigation }) {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [place, setPlace] = useState("");
  const [contact1, setContact1] = useState("");
  const [contact2, setContact2] = useState("");

  const handleSaveProfile = async () => {
    // Validate required fields
    if (!name || !age || !gender || !place || !contact1) {
      Alert.alert("Missing Fields", "Please fill in all required fields (Contact 1 is mandatory)");
      return;
    }

    // Validate numeric age
    if (isNaN(age) || age <= 0) {
      Alert.alert("Invalid Age", "Please enter a valid positive number for age.");
      return;
    }

    // Validate phone numbers (only numeric)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(contact1)) {
      Alert.alert("Invalid Phone Number", "Please enter a valid 10-digit phone number for Contact 1.");
      return;
    }
    if (contact2 && !phoneRegex.test(contact2)) {
      Alert.alert("Invalid Phone Number", "Please enter a valid 10-digit phone number for Contact 2.");
      return;
    }

    try {
      const uid = auth.currentUser?.uid;
      if (!uid) {
        Alert.alert("Error", "User not signed in");
        return;
      }

      const profileData = {
        name,
        age,
        gender,
        place,
        emergencyContacts: [contact1, contact2].filter(Boolean),
      };

      await setDoc(doc(db, "users", uid), profileData);

      Alert.alert("Success", "Profile Saved Successfully!");
      navigation.navigate("Safety"); // Navigate to the Safety screen after saving profile
    } catch (error) {
      Alert.alert("Firestore Error", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile Setup</Text>

      <TextInput
        label="Name"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
      <TextInput
        label="Age"
        value={age}
        onChangeText={setAge}
        style={styles.input}
        keyboardType="numeric"
      />
      <Text style={styles.label}>Gender</Text>
      <Picker
        selectedValue={gender}
        onValueChange={(itemValue) => setGender(itemValue)}
        style={styles.input}
      >
        <Picker.Item label="Select Gender" value="" />
        <Picker.Item label="Male" value="Male" />
        <Picker.Item label="Female" value="Female" />
        <Picker.Item label="Other" value="Other" />
      </Picker>
      <TextInput
        label="Place"
        value={place}
        onChangeText={setPlace}
        style={styles.input}
      />
      <TextInput
        label="Emergency Contact 1"
        value={contact1}
        onChangeText={setContact1}
        style={styles.input}
        keyboardType="phone-pad"
      />
      <TextInput
        label="Emergency Contact 2 (optional)"
        value={contact2}
        onChangeText={setContact2}
        style={styles.input}
        keyboardType="phone-pad"
      />

      <Button mode="contained" onPress={handleSaveProfile} style={styles.button}>
        Save and Continue
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center" },
  title: { fontSize: 24, textAlign: "center", marginBottom: 20 },
  input: { marginBottom: 10 },
  button: { marginTop: 20 },
  label: { marginBottom: 5, fontSize: 16, fontWeight: "bold" },
});
