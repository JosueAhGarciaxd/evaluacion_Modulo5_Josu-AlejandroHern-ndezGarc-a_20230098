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
import {
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, database } from "../config/firebase";

export default function Register({ navigation }) {
  // Estados para los campos del formulario de registro
  const [name, setName] = useState("");
  const [degree, setDegree] = useState("");
  const [gradYear, setGradYear] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Estados para la funcionalidad de la interfaz
  const [secure, setSecure] = useState(true); // Controla visibilidad de la contraseña
  const [loading, setLoading] = useState(false); // Estado de carga durante el registro

  // Validaciones de campos
  const isEmailValid = /\S+@\S+\.\S+/.test(email.trim()); // Valida formato de email
  const isYearValid =
    /^\d{4}$/.test(String(gradYear)) &&
    Number(gradYear) >= 1950 &&
    Number(gradYear) <= 2100; // Valida año entre 1950-2100

  // Validación general: todos los campos deben estar completos y ser válidos
  const canSubmit =
    name.trim() &&
    degree.trim() &&
    isYearValid &&
    isEmailValid &&
    password.length >= 6;

  /**
   * Maneja el proceso de registro de usuario
   * 1. Crea cuenta en Firebase Auth
   * 2. Actualiza el perfil del usuario
   * 3. Guarda información adicional en Firestore
   * 4. Cierra sesión para forzar login manual
   */
  const onRegister = async () => {
    try {
      if (!canSubmit) {
        Alert.alert(
          "Campos Incompletos",
          "Complete todos los campos correctamente."
        );
        return;
      }

      setLoading(true);

      // Crear cuenta en Firebase Authentication
      const { user } = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      // Actualizar el nombre de perfil en Firebase Auth
      await updateProfile(user, { displayName: name.trim() });

      // Guardar información completa del usuario en Firestore
      await setDoc(doc(database, "users", user.uid), {
        name: name.trim(),
        email: user.email,
        degree: degree.trim(),
        gradYear: Number(gradYear),
        createdAt: serverTimestamp(),
      });

      // Cerrar sesión automáticamente para forzar login manual
      await signOut(auth);
      Alert.alert(
        "Registro Exitoso",
        "Su cuenta ha sido creada. Inicie sesión con sus credenciales."
      );
      navigation.reset({ index: 0, routes: [{ name: "Login" }] });
    } catch (e) {
      Alert.alert("Error de Registro", e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* KeyboardAvoidingView evita que el teclado oculte los campos */}
      <KeyboardAvoidingView
        style={styles.kav}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {/* Tarjeta principal del formulario de registro */}
          <View style={styles.card}>
            {/* Header de la tarjeta */}
            <View style={styles.header}>
              <Text style={styles.title}>Crear Nueva Cuenta</Text>
              <Text style={styles.subtitle}>
                Complete su información profesional
              </Text>
            </View>

            {/* Campo: Nombre completo */}
            <View style={styles.inputBlock}>
              <Text style={styles.label}>Nombre Completo</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: Dr. Juan Pérez López"
                placeholderTextColor="#8B9A46"
                value={name}
                onChangeText={setName}
                returnKeyType="next"
              />
            </View>

            {/* Campo: Correo electrónico con validación */}
            <View style={styles.inputBlock}>
              <Text style={styles.label}>Correo Electrónico</Text>
              <TextInput
                style={[
                  styles.input,
                  !isEmailValid && email ? styles.inputError : null,
                ]}
                placeholder="correo@institucion.edu"
                placeholderTextColor="#8B9A46"
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                returnKeyType="next"
              />
              {!isEmailValid && email ? (
                <Text style={styles.helpText}>
                  Ingrese un correo electrónico válido
                </Text>
              ) : null}
            </View>

            {/* Campo: Contraseña con visibilidad toggle */}
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
                  returnKeyType="next"
                />
                {/* Botón para mostrar/ocultar contraseña */}
                <TouchableOpacity
                  style={styles.showBtn}
                  onPress={() => setSecure((s) => !s)}
                >
                  <Text style={styles.showBtnText}>
                    {secure ? "Mostrar" : "Ocultar"}
                  </Text>
                </TouchableOpacity>
              </View>
              {password && password.length < 6 ? (
                <Text style={styles.helpText}>
                  La contraseña debe tener al menos 6 caracteres
                </Text>
              ) : null}
            </View>

            {/* Campo: Título universitario */}
            <View style={styles.inputBlock}>
              <Text style={styles.label}>Título Universitario</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: Licenciatura en Administración"
                placeholderTextColor="#8B9A46"
                value={degree}
                onChangeText={setDegree}
                returnKeyType="next"
              />
            </View>

            {/* Campo: Año de graduación con validación */}
            <View style={styles.inputBlock}>
              <Text style={styles.label}>Año de Graduación</Text>
              <TextInput
                style={[
                  styles.input,
                  !isYearValid && gradYear ? styles.inputError : null,
                ]}
                placeholder="Ej: 2024"
                placeholderTextColor="#8B9A46"
                keyboardType="numeric"
                value={String(gradYear)}
                onChangeText={setGradYear}
                maxLength={4}
                returnKeyType="done"
              />
              {!isYearValid && gradYear ? (
                <Text style={styles.helpText}>
                  Ingrese un año válido entre 1950 y 2100
                </Text>
              ) : null}
            </View>

            {/* Botón principal de registro */}
            <TouchableOpacity
              style={[
                styles.primaryBtn,
                !canSubmit && styles.primaryBtnDisabled,
              ]}
              activeOpacity={0.8}
              disabled={!canSubmit || loading}
              onPress={onRegister}
            >
              {loading ? (
                <ActivityIndicator color="#EEEEEE" />
              ) : (
                <Text style={styles.primaryBtnText}>Crear Cuenta</Text>
              )}
            </TouchableOpacity>

            {/* Separador visual */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>o</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Botón secundario para navegar al login */}
            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => navigation.navigate("Login")}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryBtnText}>Ya Tengo Una Cuenta</Text>
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

  // Configuración del ScrollView con centrado vertical
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
    fontSize: 26,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
    color: "#0F0E0E",
    letterSpacing: 0.5,
  },

  // Subtítulo descriptivo profesional
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#541212",
    fontWeight: "400",
    lineHeight: 22,
  },

  // Contenedor de cada campo de entrada
  inputBlock: {
    marginBottom: 18,
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

  // Estilo para campos con error de validación
  inputError: {
    borderColor: "#541212",
    borderWidth: 2,
  },

  // Texto de ayuda para validaciones
  helpText: {
    marginTop: 6,
    color: "#541212",
    fontSize: 12,
    fontWeight: "500",
    fontStyle: "italic",
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

  // Botón principal de registro
  primaryBtn: {
    height: 56,
    borderRadius: 8,
    backgroundColor: "#541212",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
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

  // Botón secundario para ir al login
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
