import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage

const firebaseConfig = {
  apiKey: "AIzaSyAfqEUTS3ZaIdxlQMDeGFgDV2ZFPi1zYr4",
  authDomain: "my-guardian-58485.firebaseapp.com",
  projectId: "my-guardian-58485",
  storageBucket: "my-guardian-58485.firebasestorage.app",
  messagingSenderId: "984824841547",
  appId: "1:984824841547:web:9efd8a2e924e36f32f54ce",
  measurementId: "G-MCJQF0F7SD"
};

const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth with persistence using AsyncStorage
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

const db = getFirestore(app);
const storage = getStorage(app); // Initialize Firestore and Storage
const analytics = getAnalytics(app);

export { auth, db, storage, analytics }; // Export all initialized services
