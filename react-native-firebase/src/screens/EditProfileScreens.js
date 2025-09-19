import React, { useEffect, useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth, database } from "../config/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export default function EditProfile({ navigation }) {
  // Estados para los campos del perfil
  const [name, setName] = useState("");
  const [degree, setDegree] = useState("");
  const [gradYear, setGradYear] = useState("");
  
  // Estados para la funcionalidad de la interfaz
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  /**
   * Efecto para cargar los datos del perfil del usuario al montar el componente
   * Obtiene la información desde Firestore y actualiza los estados locales
   */
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const currentUserId = auth.currentUser?.uid;
        if (!currentUserId) {
          Alert.alert("Error de Sesión", "No se pudo identificar al usuario actual.");
          navigation.goBack();
          return;
        }

        // Obtener documento del usuario desde Firestore
        const userDocRef = doc(database, "users", currentUserId);
        const userSnapshot = await getDoc(userDocRef);
        
        if (userSnapshot.exists()) {
          const userData = userSnapshot.data();
          // Cargar datos en los estados locales
          setName(userData.name || "");
          setDegree(userData.degree || "");
          setGradYear(String(userData.gradYear || ""));
        } else {
          console.warn("Documento de usuario no encontrado en Firestore");
          Alert.alert("Perfil no encontrado", "No se pudo cargar la información del perfil.");
        }
      } catch (error) {
        console.error("Error cargando perfil del usuario:", error);
        Alert.alert("Error de Carga", "No se pudo cargar la información del perfil.");
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, [navigation]);

  /**
   * Guarda los cambios del perfil en Firestore
   * Incluye validaciones y manejo de errores
   */
  const saveProfileChanges = async () => {
    try {
      // Validaciones básicas
      if (!name.trim()) {
        Alert.alert("Campo Requerido", "El nombre no puede estar vacío.");
        return;
      }

      if (!degree.trim()) {
        Alert.alert("Campo Requerido", "El título universitario es obligatorio.");
        return;
      }

      const yearNumber = Number(gradYear);
      if (!gradYear || isNaN(yearNumber) || yearNumber < 1950 || yearNumber > 2100) {
        Alert.alert("Año Inválido", "Ingrese un año de graduación válido entre 1950 y 2100.");
        return;
      }

      setSaving(true);

      const currentUserId = auth.currentUser?.uid;
      if (!currentUserId) {
        Alert.alert("Error de Sesión", "Sesión expirada. Inicie sesión nuevamente.");
        return;
      }

      // Actualizar documento en Firestore
      const userDocRef = doc(database, "users", currentUserId);
      await updateDoc(userDocRef, {
        name: name.trim(),
        degree: degree.trim(),
        gradYear: yearNumber,
      });

      Alert.alert(
        "Perfil Actualizado", 
        "Sus datos profesionales han sido actualizados exitosamente.",
        [{ text: "Continuar", onPress: () => navigation.goBack() }]
      );

    } catch (error) {
      console.error("Error actualizando perfil:", error);
      Alert.alert(
        "Error de Actualización", 
        "No se pudieron guardar los cambios. Verifique su conexión e intente nuevamente."
      );
    } finally {
      setSaving(false);
    }
  };

  /**
   * Cancela la edición y regresa a la pantalla anterior
   */
  const cancelEditing = () => {
    navigation.goBack();
  };

  // Validación para habilitar el botón de guardar
  const canSaveChanges = name.trim().length > 0 && degree.trim().length > 0 && gradYear.length > 0 && !saving;

  // Mostrar indicador de carga mientras se cargan los datos
  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#541212" />
        <Text style={styles.loadingText}>Cargando información del perfil...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Tarjeta principal del formulario */}
          <View style={styles.formCard}>
            
            {/* Header del formulario */}
            <View style={styles.headerSection}>
              <Text style={styles.title}>Editar Perfil Profesional</Text>
              <Text style={styles.subtitle}>Actualice su información personal y académica</Text>
            </View>

            {/* Campo: Nombre completo */}
            <View style={styles.inputSection}>
              <Text style={styles.fieldLabel}>Nombre Completo</Text>
              <TextInput
                placeholder="Ej: Dr. María González López"
                placeholderTextColor="#8B9A46"
                value={name}
                onChangeText={setName}
                style={styles.textInput}
                returnKeyType="next"
                maxLength={100}
              />
            </View>

            {/* Campo: Título universitario */}
            <View style={styles.inputSection}>
              <Text style={styles.fieldLabel}>Título Universitario</Text>
              <TextInput
                placeholder="Ej: Maestría en Administración de Empresas"
                placeholderTextColor="#8B9A46"
                value={degree}
                onChangeText={setDegree}
                style={styles.textInput}
                returnKeyType="next"
                maxLength={150}
              />
            </View>

            {/* Campo: Año de graduación */}
            <View style={styles.inputSection}>
              <Text style={styles.fieldLabel}>Año de Graduación</Text>
              <TextInput
                placeholder="Ej: 2020"
                placeholderTextColor="#8B9A46"
                value={gradYear}
                onChangeText={setGradYear}
                keyboardType="numeric"
                style={styles.textInput}
                returnKeyType="done"
                maxLength={4}
              />
            </View>

            {/* Botones de acción */}
            <View style={styles.actionsSection}>
              
              {/* Botón principal: Guardar cambios */}
              <TouchableOpacity
                style={[styles.primaryButton, !canSaveChanges && styles.disabledButton]}
                onPress={saveProfileChanges}
                disabled={!canSaveChanges}
                activeOpacity={0.9}
              >
                {saving ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator color="#EEEEEE" size="small" />
                    <Text style={styles.buttonText}>Guardando...</Text>
                  </View>
                ) : (
                  <Text style={styles.buttonText}>Actualizar Perfil</Text>
                )}
              </TouchableOpacity>

              {/* Botón secundario: Cancelar */}
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={cancelEditing}
                activeOpacity={0.9}
                disabled={saving}
              >
                <Text style={styles.secondaryButtonText}>Cancelar Cambios</Text>
              </TouchableOpacity>
            </View>
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

  // Contenedor para el estado de carga
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0F0E0E",
    gap: 16,
  },

  // Texto del estado de carga
  loadingText: {
    color: "#EEEEEE",
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
  },

  // Contenedor del KeyboardAvoidingView
  keyboardContainer: {
    flex: 1,
  },

  // Configuración del ScrollView
  scrollContainer: {
    flexGrow: 1,
    padding: 24,
    justifyContent: "center",
  },

  // Tarjeta principal del formulario
  formCard: {
    backgroundColor: "#EEEEEE",
    borderRadius: 12,
    padding: 32,
    borderWidth: 1,
    borderColor: "#8B9A46",
    // Sombras profesionales
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },

  // Sección del header
  headerSection: {
    marginBottom: 32,
    alignItems: "center",
  },

  // Título principal
  title: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
    color: "#0F0E0E",
    letterSpacing: 0.5,
  },

  // Subtítulo descriptivo
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#541212",
    fontWeight: "400",
    lineHeight: 22,
  },

  // Sección de cada campo de entrada
  inputSection: {
    marginBottom: 20,
  },

  // Etiquetas de los campos
  fieldLabel: {
    fontSize: 14,
    color: "#0F0E0E",
    marginBottom: 8,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  // Campos de texto de entrada
  textInput: {
    height: 52,
    borderColor: "#8B9A46",
    borderWidth: 2,
    borderRadius: 8,
    backgroundColor: "#EEEEEE",
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#0F0E0E",
    fontWeight: "500",
  },

  // Sección de botones de acción
  actionsSection: {
    marginTop: 12,
    gap: 12,
  },

  // Botón principal
  primaryButton: {
    backgroundColor: "#541212",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    shadowColor: "#541212",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },

  // Estado deshabilitado del botón principal
  disabledButton: {
    backgroundColor: "#8B9A46",
    opacity: 0.6,
  },

  // Contenedor de loading en botones
  loadingButtonContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  // Texto de los botones principales
  buttonText: {
    color: "#EEEEEE",
    fontWeight: "700",
    fontSize: 16,
    textTransform: "uppercase",
    letterSpacing: 1,
  },

  // Botón secundario
  secondaryButton: {
    backgroundColor: "transparent",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#541212",
  },

  // Texto del botón secundario
  secondaryButtonText: {
    color: "#541212",
    fontWeight: "600",
    fontSize: 15,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});