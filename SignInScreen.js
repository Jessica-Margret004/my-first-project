import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { TextInput, Button } from "react-native-paper";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db, storage, analytics } from './firebaseConfig';
import { onAuthStateChanged } from "firebase/auth";  // Import onAuthStateChanged

export default function SignInScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);  // User is signed in
        console.log("User signed in:", user);
        navigation.navigate("ProfileSetup");  // Redirect to Profile Setup if signed in
      } else {
        setUser(null);  // No user is signed in
      }
    });

    // Cleanup listener
    return () => unsubscribe();
  }, [navigation]);

  const handleSignIn = () => {
    if (!email || !password) {
      Alert.alert("Please enter email and password");
      return;
    }

    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        Alert.alert("Sign In Successful");
        // The user will be redirected based on the onAuthStateChanged listener
      })
      .catch((error) => {
        Alert.alert("Error", error.message);
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>MyGuardian - Sign In</Text>
      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        mode="outlined"  // Adds an outlined style to the input field
      />
      <TextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
        mode="outlined"  // Adds an outlined style to the input field
      />
      <Button mode="contained" onPress={handleSignIn} style={styles.button}>
        Sign In
      </Button>
      <Text style={styles.link} onPress={() => navigation.navigate("SignUp")}>
        Don't have an account? Sign Up
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 24, marginBottom: 20, textAlign: "center" },
  input: { marginBottom: 10 },
  button: { marginTop: 20 },
  link: { marginTop: 10, color: "blue", textAlign: "center" },
});
