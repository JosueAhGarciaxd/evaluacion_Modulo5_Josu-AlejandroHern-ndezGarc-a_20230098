import React, { useEffect } from "react";
import { View, ActivityIndicator, StyleSheet, Text } from "react-native";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../config/firebase";

export default function Splash({ navigation }) {
  useEffect(() => {
    const sub = onAuthStateChanged(auth, (user) => {
      // ⏳ Delay mínimo para ver el splash
      setTimeout(() => {
        if (user) {
          navigation.reset({ index: 0, routes: [{ name: "MainTabs" }] });
        } else {
          navigation.reset({ index: 0, routes: [{ name: "Login" }] });
        }
      }, 1500);
    });
    return sub;
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>Mi App</Text>
      <ActivityIndicator
        size="large"
        color="#0288d1"
        style={{ marginTop: 20 }}
      />
      <Text style={styles.loadingText}>Cargando...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  logo: { fontSize: 28, fontWeight: "800", color: "#0288d1" },
  loadingText: { marginTop: 10, fontSize: 14, color: "#6B7280" },
});
