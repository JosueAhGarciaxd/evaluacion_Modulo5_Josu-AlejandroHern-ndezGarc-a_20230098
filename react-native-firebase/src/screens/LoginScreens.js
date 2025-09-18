import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../config/firebase";

export default function Login({ navigation }) {
  // Estados para manejar los inputs del formulario
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Estados para la funcionalidad de la interfaz
  const [secure, setSecure] = useState(true); // Controla si la contraseña está oculta
  const [loading, setLoading] = useState(false); // Indica si está procesando el login

  // Validación: el formulario solo se puede enviar si el email no está vacío y la contraseña tiene al menos 6 caracteres
  const canSubmit = email.trim().length > 0 && password.length >= 6;

  /**
   * Maneja el proceso de inicio de sesión
   * Utiliza Firebase Auth para autenticar al usuario
   */
  const onLogin = async () => {
    try {
      if (!canSubmit) return;

      setLoading(true);
      // Intenta autenticar con Firebase
      await signInWithEmailAndPassword(auth, email.trim(), password);

      // Si el login es exitoso, navega a las pestañas principales
      navigation.reset({ index: 0, routes: [{ name: "MainTabs" }] });
    } catch (e) {
      // Muestra el error en caso de fallo en la autenticación
      Alert.alert("Error", e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* KeyboardAvoidingView previene que el teclado tape los campos de entrada */}
      <KeyboardAvoidingView
        style={styles.kav}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {/* Tarjeta principal del formulario */}
          <View style={styles.card}>
            {/* Header de la tarjeta */}
            <View style={styles.header}>
              <Text style={styles.title}>Iniciar Sesión</Text>
              <Text style={styles.subtitle}>
                Accede a tu cuenta profesional
              </Text>
            </View>

            {/* Campo de correo electrónico */}
            <View style={styles.inputBlock}>
              <Text style={styles.label}>Correo Electrónico</Text>
              <TextInput
                style={styles.input}
                placeholder="correo@empresa.com"
                placeholderTextColor="#8B9A46"
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                returnKeyType="next"
              />
            </View>

            {/* Campo de contraseña con botón mostrar/ocultar */}
            <View style={styles.inputBlock}>
              <Text style={styles.label}>Contraseña</Text>
              <View style={styles.passwordWrap}>
                <TextInput
                  style={[styles.input, { paddingRight: 90 }]}
                  placeholder="Mínimo 6 caracteres"
                  placeholderTextColor="#8B9A46"
                  secureTextEntry={secure}
                  value={password}
                  onChangeText={setPassword}
                  returnKeyType="done"
                />
                {/* Botón para alternar visibilidad de la contraseña */}
                <TouchableOpacity
                  style={styles.showBtn}
                  onPress={() => setSecure((s) => !s)}
                >
                  <Text style={styles.showBtnText}>
                    {secure ? "Mostrar" : "Ocultar"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Botón principal de inicio de sesión */}
            <TouchableOpacity
              style={[
                styles.primaryBtn,
                !canSubmit && styles.primaryBtnDisabled,
              ]}
              activeOpacity={0.8}
              disabled={!canSubmit || loading}
              onPress={onLogin}
            >
              {loading ? (
                <ActivityIndicator color="#EEEEEE" />
              ) : (
                <Text style={styles.primaryBtnText}>Iniciar Sesión</Text>
              )}
            </TouchableOpacity>

            {/* Separador visual */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>o</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Botón secundario para navegar al registro */}
            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => navigation.navigate("Register")}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryBtnText}>Crear Nueva Cuenta</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Contenedor principal con fondo oscuro profesional
  safe: {
    flex: 1,
    backgroundColor: "#0F0E0E",
  },

  // Contenedor del KeyboardAvoidingView
  kav: {
    flex: 1,
  },

  // Configuración del ScrollView para centrar el contenido
  scroll: {
    flexGrow: 1,
    padding: 24,
    justifyContent: "center",
  },

  // Tarjeta principal del formulario con diseño formal
  card: {
    backgroundColor: "#EEEEEE",
    borderRadius: 12,
    padding: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: "#8B9A46",
  },

  // Contenedor del header
  header: {
    marginBottom: 32,
    alignItems: "center",
  },

  // Título principal con tipografía formal
  title: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
    color: "#0F0E0E",
    letterSpacing: 0.5,
  },

  // Subtítulo con descripción profesional
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#541212",
    fontWeight: "400",
    lineHeight: 22,
  },

  // Contenedor de cada campo de entrada
  inputBlock: {
    marginBottom: 20,
  },

  // Etiquetas de los campos con estilo formal
  label: {
    fontSize: 14,
    color: "#0F0E0E",
    marginBottom: 8,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  // Estilos para los campos de entrada
  input: {
    height: 52,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#8B9A46",
    backgroundColor: "#EEEEEE",
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#0F0E0E",
    fontWeight: "500",
  },

  // Contenedor del campo de contraseña
  passwordWrap: {
    position: "relative",
    justifyContent: "center",
  },

  // Botón para mostrar/ocultar contraseña
  showBtn: {
    position: "absolute",
    right: 12,
    height: 32,
    paddingHorizontal: 12,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#8B9A46",
  },

  // Texto del botón mostrar/ocultar
  showBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#EEEEEE",
    textTransform: "uppercase",
  },

  // Botón principal de inicio de sesión
  primaryBtn: {
    height: 56,
    borderRadius: 8,
    backgroundColor: "#541212",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    shadowColor: "#541212",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },

  // Estado deshabilitado del botón principal
  primaryBtnDisabled: {
    backgroundColor: "#8B9A46",
    opacity: 0.6,
  },

  // Texto del botón principal
  primaryBtnText: {
    color: "#EEEEEE",
    fontSize: 16,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
  },

  // Contenedor del separador
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },

  // Líneas del separador
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#8B9A46",
  },

  // Texto del separador
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: "#541212",
    fontWeight: "500",
  },

  // Botón secundario para crear cuenta
  secondaryBtn: {
    height: 52,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#541212",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },

  // Texto del botón secundario
  secondaryBtnText: {
    color: "#541212",
    fontSize: 15,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});
