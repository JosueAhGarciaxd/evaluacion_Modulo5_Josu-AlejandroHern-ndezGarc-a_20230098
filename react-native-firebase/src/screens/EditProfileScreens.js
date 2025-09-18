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
} from "react-native";
import { auth, database } from "../config/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export default function EditProfile({ navigation }) {
  const [name, setName] = useState("");
  const [degree, setDegree] = useState("");
  const [gradYear, setGradYear] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const uid = auth.currentUser?.uid;
        if (!uid) return;
        const snap = await getDoc(doc(database, "users", uid));
        const d = snap.data();
        if (d) {
          setName(d.name);
          setDegree(d.degree);
          setGradYear(String(d.gradYear));
        }
      } catch (e) {
        console.log("Error cargando perfil:", e);
      }
    };
    load();
  }, []);

  const save = async () => {
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) return;
      await updateDoc(doc(database, "users", uid), {
        name,
        degree,
        gradYear: Number(gradYear),
      });
      Alert.alert("✅ Actualizado", "Tus datos se guardaron con éxito");
      navigation.goBack();
    } catch (e) {
      Alert.alert("Error", e.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Editar perfil</Text>

        <TextInput
          placeholder="Nombre"
          value={name}
          onChangeText={setName}
          style={styles.input}
        />
        <TextInput
          placeholder="Título universitario"
          value={degree}
          onChangeText={setDegree}
          style={styles.input}
        />
        <TextInput
          placeholder="Año de graduación"
          value={gradYear}
          onChangeText={setGradYear}
          keyboardType="numeric"
          style={styles.input}
        />

        <TouchableOpacity
          style={styles.button}
          onPress={save}
          activeOpacity={0.9}
        >
          <Text style={styles.buttonText}>Guardar cambios</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.cancelBtn]}
          onPress={() => navigation.goBack()}
          activeOpacity={0.9}
        >
          <Text style={styles.buttonText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F8FA",
    justifyContent: "center",
    padding: 20,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 20,
    color: "#111827",
  },
  input: {
    height: 48,
    borderColor: "#E5E7EB",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 14,
    backgroundColor: "#F9FAFB",
  },
  button: {
    backgroundColor: "#0288d1",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  cancelBtn: {
    backgroundColor: "#9CA3AF",
  },
  buttonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 15,
  },
});
