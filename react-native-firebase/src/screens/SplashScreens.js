import React, { useEffect, useState } from "react";
import {
  View,
  ActivityIndicator,
  StyleSheet,
  Text,
  Animated,
} from "react-native";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../config/firebase";

export default function Splash({ navigation }) {
  // Estado para controlar las animaciones
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));

  useEffect(() => {
    // Iniciar animaciones de entrada
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Verificar estado de autenticación del usuario
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // Delay mínimo para mostrar el splash screen
      setTimeout(() => {
        if (user) {
          // Usuario autenticado: navegar a las pestañas principales
          navigation.reset({ index: 0, routes: [{ name: "MainTabs" }] });
        } else {
          // Usuario no autenticado: navegar al login
          navigation.reset({ index: 0, routes: [{ name: "Login" }] });
        }
      }, 5000); 
    });

    // Cleanup: desuscribir del listener al desmontar el componente
    return unsubscribe;
  }, [navigation, fadeAnim, scaleAnim]);

  return (
    <View style={styles.container}>
      {/* Contenedor principal con animación */}
      <Animated.View
        style={[
          styles.contentContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Logo principal de la aplicación */}
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>PROFESSIONAL</Text>
          <View style={styles.logoAccent} />
          <Text style={styles.logoSubtext}>NETWORK</Text>
        </View>

        {/* Indicador de carga con estilo personalizado */}
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color="#541212"
            style={styles.spinner}
          />
          <Text style={styles.loadingText}>Iniciando aplicación...</Text>
        </View>

        {/* Texto de copyright/versión */}
        <Text style={styles.footerText}>Versión 1.0 • © 2025</Text>
      </Animated.View>

      {/* Elementos decorativos de fondo */}
      <View style={styles.backgroundDecor}>
        <View style={[styles.decorCircle, styles.decorCircle1]} />
        <View style={[styles.decorCircle, styles.decorCircle2]} />
        <View style={[styles.decorRect, styles.decorRect1]} />
        <View style={[styles.decorRect, styles.decorRect2]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Contenedor principal con fondo oscuro profesional
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0F0E0E",
    position: "relative",
  },

  // Contenedor del contenido principal
  contentContainer: {
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2, // Asegurar que esté sobre los elementos decorativos
  },

  // Contenedor del logo principal
  logoContainer: {
    alignItems: "center",
    marginBottom: 60,
  },

  // Texto principal del logo
  logoText: {
    fontSize: 32,
    fontWeight: "800",
    color: "#EEEEEE",
    letterSpacing: 4,
    textAlign: "center",
    marginBottom: 8,
  },

  // Línea decorativa del logo
  logoAccent: {
    width: 80,
    height: 3,
    backgroundColor: "#541212",
    borderRadius: 2,
    marginVertical: 8,
  },

  // Subtexto del logo
  logoSubtext: {
    fontSize: 16,
    fontWeight: "400",
    color: "#8B9A46",
    letterSpacing: 2,
    textAlign: "center",
  },

  // Contenedor del indicador de carga
  loadingContainer: {
    alignItems: "center",
    marginBottom: 80,
  },

  // Estilo del spinner de carga
  spinner: {
    marginBottom: 20,
    transform: [{ scale: 1.2 }], // Hacer el spinner un poco más grande
  },

  // Texto de carga
  loadingText: {
    fontSize: 16,
    color: "#8B9A46",
    fontWeight: "500",
    letterSpacing: 0.5,
  },

  // Texto del pie de página
  footerText: {
    fontSize: 12,
    color: "#541212",
    fontWeight: "400",
    textAlign: "center",
    opacity: 0.8,
  },

  // Contenedor de elementos decorativos de fondo
  backgroundDecor: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },

  // Base para círculos decorativos
  decorCircle: {
    position: "absolute",
    borderRadius: 999,
    opacity: 0.1,
  },

  // Primer círculo decorativo
  decorCircle1: {
    width: 200,
    height: 200,
    backgroundColor: "#541212",
    top: -100,
    right: -100,
  },

  // Segundo círculo decorativo
  decorCircle2: {
    width: 150,
    height: 150,
    backgroundColor: "#8B9A46",
    bottom: -75,
    left: -75,
  },

  // Base para rectángulos decorativos
  decorRect: {
    position: "absolute",
    opacity: 0.05,
    transform: [{ rotate: "45deg" }],
  },

  // Primer rectángulo decorativo
  decorRect1: {
    width: 120,
    height: 120,
    backgroundColor: "#EEEEEE",
    top: 100,
    left: -60,
  },

  // Segundo rectángulo decorativo
  decorRect2: {
    width: 80,
    height: 80,
    backgroundColor: "#541212",
    bottom: 150,
    right: -40,
  },
});
