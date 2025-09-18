// Importación de bibliotecas y componentes necesarios
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { database, auth } from '../config/firebase';
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  doc,
  getDoc,
  where,
} from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import CardProductos from '../components/CardProductos';

const Home = ({ navigation }) => {
  // Estados para manejar los productos y perfil del usuario
  const [productos, setProductos] = useState([]);
  const [profile, setProfile] = useState(null);

  /**
   * Efecto para cargar el perfil del usuario autenticado
   * Obtiene la información del usuario desde Firestore o usa datos básicos de Auth
   */
  useEffect(() => {
    const user = auth.currentUser;
    const loadUserProfile = async () => {
      if (!user) return;
      
      try {
        // Intentar obtener perfil completo desde Firestore
        const userDocRef = doc(database, 'users', user.uid);
        const userSnapshot = await getDoc(userDocRef);
        
        if (userSnapshot.exists()) {
          setProfile(userSnapshot.data());
        } else {
          // Fallback: usar datos básicos de Firebase Auth
          setProfile({ 
            name: user.displayName || user.email, 
            email: user.email 
          });
        }
      } catch (error) {
        console.error('Error cargando perfil del usuario:', error);
        // Establecer perfil básico en caso de error
        setProfile({ 
          name: user.displayName || user.email, 
          email: user.email 
        });
      }
    };
    
    loadUserProfile();
  }, []);

  /**
   * Efecto para obtener productos en tiempo real
   * Solo muestra productos del usuario autenticado actual
   * Nota: La combinación de where + orderBy puede requerir un índice compuesto en Firestore
   */
  useEffect(() => {
    const currentUserId = auth.currentUser?.uid;
    if (!currentUserId) return; // Salir si no hay usuario autenticado

    // Crear consulta para productos del usuario actual, ordenados por fecha
    const productsQuery = query(
      collection(database, 'productos'),
      where('uid', '==', currentUserId), // Filtrar solo productos del usuario
      orderBy('creado', 'desc') // Ordenar por más recientes primero
    );

    // Suscribirse a cambios en tiempo real
    const unsubscribe = onSnapshot(productsQuery, (querySnapshot) => {
      const productsList = [];
      querySnapshot.forEach((document) => {
        productsList.push({ 
          id: document.id, 
          ...document.data() 
        });
      });
      setProductos(productsList);
    }, (error) => {
      console.error('Error obteniendo productos:', error);
      Alert.alert('Error', 'No se pudieron cargar los productos');
    });

    // Cleanup: desuscribirse al desmontar el componente
    return () => unsubscribe();
  }, []);

  /**
   * Navega a la pantalla de edición de perfil
   */
  const navigateToEditProfile = () => {
    navigation.navigate('EditProfile');
  };

  /**
   * Maneja el proceso de cierre de sesión
   * Cierra la sesión de Firebase y navega al login
   */
  const handleLogout = async () => {
    try {
      await signOut(auth);
      // Resetear navegación para evitar que el usuario regrese
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    } catch (error) {
      console.error('Error durante el cierre de sesión:', error);
      Alert.alert('Error', 'No se pudo cerrar la sesión correctamente');
    }
  };

  /**
   * Renderiza cada item de la lista de productos
   */
  const renderProductItem = ({ item }) => (
    <CardProductos
      id={item.id}
      nombre={item.nombre}
      precio={item.precio}
      vendido={item.vendido}
      imagen={item.imagen}
    />
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor="#0F0E0E" />
      
      {/* HEADER PRINCIPAL CON INFORMACIÓN DEL USUARIO */}
      <View style={styles.headerCard}>
        {/* Información del usuario */}
        <View style={styles.userInfoContainer}>
          <Text style={styles.welcomeText}>
            {profile ? `Bienvenido, ${profile.name || profile.email || 'Usuario'}` : 'Cargando perfil...'}
          </Text>
          <Text style={styles.subtitle}>Panel de Control Profesional</Text>
        </View>

        {/* Botones de acción del header */}
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.editButton]} 
            onPress={navigateToEditProfile} 
            activeOpacity={0.85}
          >
            <Text style={styles.actionButtonText}>Editar Perfil</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.logoutButton]} 
            onPress={handleLogout} 
            activeOpacity={0.85}
          >
            <Text style={styles.actionButtonText}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* TÍTULO DE SECCIÓN */}
      <Text style={styles.sectionTitle}>Inventario de Productos</Text>

      {/* LISTA DE PRODUCTOS */}
      <FlatList
        data={productos}
        renderItem={renderProductItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyStateContainer}>
            <Text style={styles.emptyStateTitle}>Sin Productos Registrados</Text>
            <Text style={styles.emptyStateDescription}>
              Utilice el botón "Agregar" en la barra inferior para registrar su primer producto.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

export default Home;

const styles = StyleSheet.create({
  // Contenedor principal con fondo oscuro profesional
  safe: {
    flex: 1,
    backgroundColor: '#0F0E0E',
  },

  // Tarjeta del header principal
  headerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#EEEEEE',
    marginHorizontal: 20,
    marginTop: 16,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#8B9A46',
    // Sombras para efecto elevado
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },

  // Contenedor de información del usuario
  userInfoContainer: {
    flex: 1,
    marginRight: 16,
  },

  // Texto de bienvenida
  welcomeText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F0E0E',
    marginBottom: 4,
    letterSpacing: 0.3,
  },

  // Subtítulo descriptivo
  subtitle: {
    fontSize: 14,
    color: '#541212',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Contenedor de botones del header
  headerButtons: {
    gap: 8,
  },

  // Estilo base para botones de acción
  actionButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },

  // Texto de los botones de acción
  actionButtonText: {
    color: '#EEEEEE',
    fontWeight: '700',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Botón de editar perfil
  editButton: { 
    backgroundColor: '#8B9A46',
  },

  // Botón de cerrar sesión
  logoutButton: { 
    backgroundColor: '#541212',
  },

  // Título de sección principal
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#EEEEEE',
    marginTop: 24,
    marginBottom: 16,
    marginHorizontal: 20,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // Contenedor de la lista de productos
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100, // Espacio para la barra de pestañas
  },

  // Contenedor del estado vacío
  emptyStateContainer: {
    backgroundColor: '#EEEEEE',
    borderRadius: 12,
    marginHorizontal: 4,
    marginTop: 20,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#8B9A46',
    // Sombras suaves
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },

  // Título del estado vacío
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F0E0E',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 0.5,
  },

  // Descripción del estado vacío
  emptyStateDescription: {
    fontSize: 14,
    color: '#541212',
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: '400',
  },
});