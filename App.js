import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Provider as PaperProvider } from "react-native-paper";
import { auth, db, storage, analytics } from './firebaseConfig';

// Importing the screens
import SignUpScreen from "./SignUpScreen";
import SignInScreen from "./SignInScreen";
import ProfileSetupScreen from "./ProfileSetupScreen";
import SafetyScreen from "./SafetyScreen";
import IncidentReportScreen from "./IncidentReportScreen";
import IncidentListScreen from "./IncidentListScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <PaperProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="SignUp">
          <Stack.Screen name="SignUp" component={SignUpScreen} />
          <Stack.Screen name="SignIn" component={SignInScreen} />
          <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
          <Stack.Screen name="Safety" component={SafetyScreen} />
          <Stack.Screen name="IncidentReport" component={IncidentReportScreen} />
          <Stack.Screen name="IncidentList" component={IncidentListScreen} options={{ title: "All Reports" }} />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}
