import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth, database } from "../config/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import * as ImagePicker from "expo-image-picker";

const Add = ({ navigation }) => {
  // Estados para manejar los datos del formulario
  const [nombre, setNombre] = useState("");
  const [precioStr, setPrecioStr] = useState(""); // Precio como string para compatibilidad con TextInput
  const [imagen, setImagen] = useState("");
  const [saving, setSaving] = useState(false);

  /**
   * Navega de regreso a la pantalla principal
   */
  const navigateToHome = () => {
    navigation.goBack();
  };

  /**
   * Abre la galería del dispositivo para seleccionar una imagen
   * Utiliza expo-image-picker con configuración optimizada
   */
  const openImageGallery = async () => {
    try {
      // Solicitar permisos si es necesario
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert("Permisos requeridos", "Se necesitan permisos para acceder a la galería de imágenes.");
        return;
      }

      // Lanzar selector de imágenes con configuración profesional
      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1], // Relación cuadrada para productos
        quality: 0.8, // Calidad optimizada para rendimiento
        exif: false, // No incluir metadatos EXIF por privacidad
      });

      if (!pickerResult.canceled && pickerResult.assets?.length > 0) {
        setImagen(pickerResult.assets[0].uri);
      }
    } catch (error) {
      console.error("Error al acceder a la galería:", error);
      Alert.alert("Error", "No se pudo acceder a la galería de imágenes.");
    }
  };

  /**
   * Elimina la imagen seleccionada del formulario
   */
  const removeSelectedImage = () => {
    setImagen("");
  };

  /**
   * Procesa y guarda el nuevo producto en Firestore
   * Incluye validaciones completas y manejo de errores
   */
  const saveProduct = async () => {
    try {
      // Verificar que el usuario esté autenticado
      const currentUserId = auth.currentUser?.uid;
      if (!currentUserId) {
        Alert.alert("Sesión Expirada", "Debe iniciar sesión para agregar productos.");
        return;
      }

      // Validación del nombre del producto
      if (!nombre.trim()) {
        Alert.alert("Campo Requerido", "Ingrese un nombre para el producto.");
        return;
      }

      // Validación y conversión del precio
      const precioNumber = Number(precioStr.replace(",", "."));
      if (!precioStr || isNaN(precioNumber) || precioNumber < 0) {
        Alert.alert("Precio Inválido", "Ingrese un precio válido (ejemplo: 25.99).");
        return;
      }

      setSaving(true);

      // URL de imagen placeholder (mientras no se implemente Storage)
      const imageUrl = imagen || "https://via.placeholder.com/400x400/8B9A46/EEEEEE?text=Sin+Imagen";

      // Crear documento del producto en Firestore
      await addDoc(collection(database, "productos"), {
        nombre: nombre.trim(),
        precio: precioNumber,
        vendido: false,
        creado: serverTimestamp(),
        imagen: imageUrl,
        uid: currentUserId, // Asociar producto al usuario actual
      });

      // Limpiar formulario después del guardado exitoso
      setNombre("");
      setPrecioStr("");
      setImagen("");

      Alert.alert(
        "Producto Registrado", 
        "El producto ha sido agregado exitosamente al inventario.",
        [{ text: "Continuar", onPress: navigateToHome }]
      );

    } catch (error) {
      console.error("Error al guardar producto:", error);
      Alert.alert(
        "Error de Sistema",
        "No se pudo guardar el producto. Verifique su conexión e intente nuevamente."
      );
    } finally {
      setSaving(false);
    }
  };

  // Validación para habilitar el botón de guardar
  const canSubmitForm = nombre.trim().length > 0 && precioStr.length > 0 && !saving;

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
              <Text style={styles.title}>Registro de Producto</Text>
              <Text style={styles.subtitle}>Complete la información del nuevo producto</Text>
            </View>

            {/* Campo: Nombre del producto */}
            <View style={styles.inputSection}>
              <Text style={styles.fieldLabel}>Nombre del Producto</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Ej: Laptop Dell Inspiron 15"
                placeholderTextColor="#8B9A46"
                value={nombre}
                onChangeText={setNombre}
                returnKeyType="next"
                maxLength={100}
              />
            </View>

            {/* Campo: Precio */}
            <View style={styles.inputSection}>
              <Text style={styles.fieldLabel}>Precio (USD)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Ej: 599.99"
                placeholderTextColor="#8B9A46"
                value={precioStr}
                onChangeText={setPrecioStr}
                keyboardType="decimal-pad"
                returnKeyType="done"
                maxLength={10}
              />
            </View>

            {/* Sección de imagen */}
            <View style={styles.imageSection}>
              <Text style={styles.fieldLabel}>Imagen del Producto</Text>
              
              {/* Botón para seleccionar imagen */}
              <TouchableOpacity
                onPress={openImageGallery}
                style={styles.imagePickerButton}
                activeOpacity={0.85}
                disabled={saving}
              >
                <Text style={styles.imagePickerText}>Seleccionar desde Galería</Text>
              </TouchableOpacity>

              {/* Preview de imagen o estado vacío */}
              {imagen ? (
                <View style={styles.imagePreviewContainer}>
                  <Image source={{ uri: imagen }} style={styles.imagePreview} />
                  <TouchableOpacity
                    onPress={removeSelectedImage}
                    style={styles.removeImageButton}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.removeImageText}>Remover Imagen</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <Text style={styles.noImageText}>
                  No se ha seleccionado ninguna imagen
                </Text>
              )}
            </View>

            {/* Botones de acción */}
            <View style={styles.actionsSection}>
              
              {/* Botón principal: Guardar producto */}
              <TouchableOpacity
                style={[styles.primaryButton, !canSubmitForm && styles.disabledButton]}
                onPress={saveProduct}
                disabled={!canSubmitForm}
                activeOpacity={0.9}
              >
                {saving ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator color="#EEEEEE" size="small" />
                    <Text style={styles.buttonText}>Guardando...</Text>
                  </View>
                ) : (
                  <Text style={styles.buttonText}>Registrar Producto</Text>
                )}
              </TouchableOpacity>

              {/* Botón secundario: Volver */}
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={navigateToHome}
                activeOpacity={0.9}
                disabled={saving}
              >
                <Text style={styles.secondaryButtonText}>Volver al Inicio</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Add;

const styles = StyleSheet.create({
  // Contenedor principal con fondo oscuro profesional
  safe: {
    flex: 1,
    backgroundColor: "#0F0E0E",
  },

  // Contenedor del KeyboardAvoidingView
  keyboardContainer: { 
    flex: 1 
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
    marginBottom: 20 
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

  // Sección de imagen
  imageSection: {
    marginBottom: 24,
  },

  // Botón para seleccionar imagen
  imagePickerButton: {
    backgroundColor: "#8B9A46",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 16,
  },

  // Texto del botón de seleccionar imagen
  imagePickerText: {
    color: "#EEEEEE",
    fontWeight: "700",
    fontSize: 14,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  // Contenedor del preview de imagen
  imagePreviewContainer: {
    alignItems: "center",
  },

  // Preview de la imagen seleccionada
  imagePreview: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "#8B9A46",
  },

  // Botón para remover imagen
  removeImageButton: {
    backgroundColor: "#541212",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },

  // Texto del botón remover imagen
  removeImageText: {
    color: "#EEEEEE",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
  },

  // Texto cuando no hay imagen
  noImageText: {
    fontSize: 14,
    color: "#8B9A46",
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 8,
  },

  // Sección de botones de acción
  actionsSection: {
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

  // Contenedor de loading
  loadingContainer: {
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