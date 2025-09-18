// Importación de bibliotecas y componentes necesarios
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { database, auth } from "../config/firebase";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  doc,
  getDoc,
  where, // ✅ importa where
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import CardProductos from "../components/CardProductos";

const Home = ({ navigation }) => {
  const [productos, setProductos] = useState([]);
  const [profile, setProfile] = useState(null);

  // Carga perfil del usuario autenticado
  useEffect(() => {
    const user = auth.currentUser;
    const load = async () => {
      if (!user) return;
      try {
        const snap = await getDoc(doc(database, "users", user.uid));
        if (snap.exists()) setProfile(snap.data());
        else
          setProfile({
            name: user.displayName || user.email,
            email: user.email,
          });
      } catch (e) {
        console.log("Error leyendo perfil:", e);
      }
    };
    load();
  }, []);

  // ✅ Consulta de productos SOLO del usuario logueado (tiempo real)
  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return; // aún no hay sesión

    // ⚠️ where + orderBy puede pedir un índice compuesto. Si Firebase te muestra un link "Create index", dale clic.
    const q = query(
      collection(database, "productos"),
      where("uid", "==", uid), // ✅ solo mis productos
      orderBy("creado", "desc") // ✅ más recientes primero
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const docs = [];
      querySnapshot.forEach((docu) =>
        docs.push({ id: docu.id, ...docu.data() })
      );
      setProductos(docs);
    });

    return () => unsubscribe();
  }, []);

  const goToEdit = () => navigation.navigate("EditProfile");

  const onLogout = async () => {
    try {
      await signOut(auth);
      navigation.reset({ index: 0, routes: [{ name: "Login" }] });
    } catch (e) {
      Alert.alert("Error", e.message);
    }
  };

  const renderItem = ({ item }) => (
    <CardProductos
      id={item.id}
      nombre={item.nombre}
      precio={item.precio}
      vendido={item.vendido}
      imagen={item.imagen}
    />
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" />
      {/* HEADER */}
      <View style={styles.headerCard}>
        <View style={{ flex: 1 }}>
          <Text style={styles.hello}>
            {profile
              ? `Hola, ${profile.name || profile.email || "usuario"}`
              : "Cargando..."}
          </Text>
          <Text style={styles.subtitle}>Gestiona tus productos fácilmente</Text>
        </View>

        <View style={styles.headerBtns}>
          <TouchableOpacity
            style={[styles.smallBtn, styles.editBtn]}
            onPress={goToEdit}
            activeOpacity={0.85}
          >
            <Text style={styles.smallBtnText}>Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.smallBtn, styles.logoutBtn]}
            onPress={onLogout}
            activeOpacity={0.85}
          >
            <Text style={styles.smallBtnText}>Salir</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* TÍTULO */}
      <Text style={styles.sectionTitle}>Productos disponibles</Text>

      {/* LISTA */}
      <FlatList
        data={productos}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>Aún no hay productos</Text>
            <Text style={styles.emptyText}>
              Toca “+” para agregar tu primer producto.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

export default Home;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F6F8FA",
  },

  // Header card
  headerCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginTop: 8,
    padding: 16,
    borderRadius: 16,
    // sombra
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 5,
  },
  hello: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
  },
  subtitle: {
    marginTop: 4,
    fontSize: 13,
    color: "#6B7280",
  },
  headerBtns: {
    flexDirection: "row",
    gap: 8,
  },
  smallBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  smallBtnText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 12,
  },
  editBtn: { backgroundColor: "#0288d1" },
  logoutBtn: { backgroundColor: "#e53935" },

  // Sección
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
    marginTop: 16,
    marginBottom: 8,
    marginHorizontal: 16,
  },

  // Lista y vacío
  listContent: {
    paddingHorizontal: 12,
    paddingBottom: 100, // espacio para el FAB (aunque ya no está)
  },
  emptyBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginHorizontal: 4,
    marginTop: 12,
    padding: 24,
    alignItems: "center",
    // sombra
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
  },

  // FAB (eliminado)
  fab: {
    position: "absolute",
    right: 20,
    bottom: 26,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#0288d1",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0288d1",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  fabText: {
    color: "#fff",
    fontSize: 30,
    lineHeight: 30,
    fontWeight: "900",
  },
});
