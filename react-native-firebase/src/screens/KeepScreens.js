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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth, database } from "../config/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import * as ImagePicker from "expo-image-picker";

const Add = ({ navigation }) => {
  // Guardamos el precio como string para no pelear con el TextInput
  const [nombre, setNombre] = useState("");
  const [precioStr, setPrecioStr] = useState("");
  const [imagen, setImagen] = useState("");
  const [saving, setSaving] = useState(false);

  const goToHome = () => navigation.goBack();

  const openGalery = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [8, 8],
        quality: 1,
      });

      if (!result.canceled && result.assets?.length > 0) {
        setImagen(result.assets[0].uri);
      }
    } catch (error) {
      console.log("Error al abrir la galería", error);
    }
  };

  const agregarProducto = async () => {
    try {
      // ✅ verificar sesión
      const uid = auth.currentUser?.uid;
      if (!uid) {
        Alert.alert("Sesión", "Debes iniciar sesión para agregar productos.");
        return;
      }

      // Validación simple
      const precioNum = Number(precioStr.replace(",", "."));
      if (!nombre.trim()) {
        Alert.alert("Falta el nombre", "Ingresa un nombre para el producto.");
        return;
      }
      if (!precioStr || isNaN(precioNum) || precioNum < 0) {
        Alert.alert(
          "Precio inválido",
          "Ingresa un precio válido (por ejemplo 9.99)."
        );
        return;
      }

      setSaving(true);

      // Placeholder mientras no subimos a Storage
      const imageUrl = imagen || "Storage ya no es gratuito";

      await addDoc(collection(database, "productos"), {
        nombre: nombre.trim(),
        precio: precioNum,
        vendido: false,
        creado: serverTimestamp(),
        imagen: imageUrl,
        uid, // ✅ dueño del producto
      });

      // (opcional) limpiar formulario
      setNombre("");
      setPrecioStr("");
      setImagen("");

      Alert.alert("Producto agregado", "El producto se agregó correctamente", [
        { text: "Ok", onPress: goToHome },
      ]);
    } catch (error) {
      console.error("Error al agregar el producto", error);
      Alert.alert(
        "Error",
        "Ocurrió un error al agregar el producto. Intenta nuevamente."
      );
    } finally {
      setSaving(false);
    }
  };

  const canSubmit = nombre.trim().length > 0 && precioStr.length > 0;

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            <Text style={styles.title}>Agregar producto</Text>

            <View style={styles.inputBlock}>
              <Text style={styles.label}>Nombre</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: Camiseta azul"
                value={nombre}
                onChangeText={setNombre}
                returnKeyType="next"
              />
            </View>

            <View style={styles.inputBlock}>
              <Text style={styles.label}>Precio</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: 9.99"
                value={precioStr}
                onChangeText={setPrecioStr}
                keyboardType="decimal-pad"
                returnKeyType="done"
              />
            </View>

            <Text style={[styles.label, { marginTop: 6 }]}>Imagen</Text>
            <TouchableOpacity
              onPress={openGalery}
              style={styles.imagePicker}
              activeOpacity={0.85}
            >
              <Text style={styles.imagePickerText}>Seleccionar imagen</Text>
            </TouchableOpacity>

            {imagen ? (
              <Image source={{ uri: imagen }} style={styles.imagePreview} />
            ) : (
              <Text style={styles.helper}>No has seleccionado imagen.</Text>
            )}

            <TouchableOpacity
              style={[styles.button, !canSubmit && { opacity: 0.5 }]}
              onPress={agregarProducto}
              disabled={!canSubmit || saving}
              activeOpacity={0.9}
            >
              <Text style={styles.buttonText}>
                {saving ? "Guardando..." : "Agregar producto"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.secondary]}
              onPress={goToHome}
              activeOpacity={0.9}
            >
              <Text style={styles.buttonText}>Volver a Home</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Add;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F6F8FA",
  },
  scroll: {
    flexGrow: 1,
    padding: 20,
    justifyContent: "center", // Centrado vertical
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    // sombra
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 16,
    color: "#111827",
  },
  inputBlock: { marginBottom: 14 },
  label: {
    fontSize: 13,
    color: "#374151",
    marginBottom: 6,
    fontWeight: "600",
  },
  input: {
    height: 48,
    borderColor: "#E5E7EB",
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    fontSize: 16,
  },
  imagePicker: {
    backgroundColor: "#0288d1",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 6,
    marginBottom: 12,
  },
  imagePickerText: {
    color: "white",
    fontWeight: "800",
  },
  imagePreview: {
    width: "100%",
    height: 180,
    borderRadius: 12,
    marginBottom: 10,
  },
  helper: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#0288d1",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  secondary: {
    backgroundColor: "#9CA3AF",
  },
  buttonText: {
    color: "white",
    fontWeight: "800",
    fontSize: 15,
  },
});
