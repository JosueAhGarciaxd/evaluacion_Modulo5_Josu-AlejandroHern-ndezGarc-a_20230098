// src/navigation/Navigation.js
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "@expo/vector-icons/Ionicons";

// Screens
import Splash from "../screens/SplashScreens";
import Home from "../screens/HomeSrceens";
import Add from "../screens/KeepScreens";
import EditProfile from "../screens/EditProfile";
import Login from "../screens/Login";
import Register from "../screens/Register";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// --- Tabs privadas (después de iniciar sesión) ---
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerTitleAlign: "center",
        tabBarActiveTintColor: "#0288d1",
        tabBarInactiveTintColor: "#94a3b8",
        tabBarLabelStyle: { fontSize: 12, fontWeight: "700" },
        tabBarStyle: { height: 58, paddingBottom: 6 },
        tabBarIcon: ({ focused, color, size }) => {
          let icon = "home";
          if (route.name === "Home") icon = focused ? "home" : "home-outline";
          if (route.name === "Agregar")
            icon = focused ? "add-circle" : "add-circle-outline";
          if (route.name === "Perfil")
            icon = focused ? "person" : "person-outline";
          return <Ionicons name={icon} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={Home} options={{ title: "Inicio" }} />
      <Tab.Screen
        name="Agregar"
        component={Add}
        options={{ title: "Agregar" }}
      />
      <Tab.Screen
        name="Perfil"
        component={EditProfile}
        options={{ title: "Mi perfil" }}
      />
    </Tab.Navigator>
  );
}

// --- Navegación raíz ---
export default function Navigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash" // 👈 Splash primero
        screenOptions={{ headerShown: false }} // 👈 sin header en el stack raíz
      >
        {/* Splash decide si ir a MainTabs o Login */}
        <Stack.Screen name="Splash" component={Splash} />

        {/* Auth */}
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Register" component={Register} />

        {/* App privada con tabs */}
        <Stack.Screen name="MainTabs" component={MainTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
