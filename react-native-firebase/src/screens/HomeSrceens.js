// Importación de bibliotecas y componentes necesarios
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert, StatusBar, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { database, auth } from '../config/firebase';
import { collection, onSnapshot, orderBy, query, doc, getDoc, where, } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import CardProductos from '../components/CardProduct';

const Home = ({ navigation }) => {
  // Estados para manejar los productos y perfil del usuario
  const [productos, setProductos] = useState([]);
  const [profile, setProfile] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

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
   * Optimizado para mostrar productos recién agregados
   */
  useEffect(() => {
    const currentUserId = auth.currentUser?.uid;
    if (!currentUserId) {
      setLoading(false);
      return; // Salir si no hay usuario autenticado
    }

    console.log('Configurando listener de productos para usuario:', currentUserId);

    try {
      // SOLUCIÓN TEMPORAL: Solo filtrar por usuario (sin ordenamiento en Firestore)
      // Esto evita el error del índice compuesto mientras se crea el índice necesario
      const productsQuery = query(
        collection(database, 'productos'),
        where('uid', '==', currentUserId) // Solo filtrar por usuario
      );

      // Suscribirse a cambios en tiempo real
      const unsubscribe = onSnapshot(
        productsQuery, 
        (querySnapshot) => {
          console.log('Recibidos datos del snapshot, documentos:', querySnapshot.size);
          
          const productsList = [];
          querySnapshot.forEach((document) => {
            const data = document.data();
            productsList.push({
              id: document.id,
              ...data,
              // Convertir timestamp a fecha si es necesario
              creado: data.creado?.toDate ? data.creado.toDate() : data.creado
            });
          });
          
          // Ordenar en JavaScript por fecha de creación (más recientes primero)
          // NOTA: Una vez que crees el índice compuesto, puedes volver a usar orderBy en Firestore
          productsList.sort((a, b) => {
            const dateA = a.creado instanceof Date ? a.creado : new Date(a.creado || 0);
            const dateB = b.creado instanceof Date ? b.creado : new Date(b.creado || 0);
            return dateB - dateA; // Descendente (más recientes primero)
          });
          
          console.log('Productos procesados y ordenados:', productsList.length);
          setProductos(productsList);
          setLoading(false);
          setRefreshing(false);
        }, 
        (error) => {
          console.error('Error obteniendo productos:', error);
          setLoading(false);
          setRefreshing(false);
          
          // Mostrar error más específico según el tipo
          if (error.code === 'failed-precondition') {
            Alert.alert(
              'Configuración de Base de Datos',
              'Es necesario crear un índice en Firestore. Haz clic en el enlace del error en la consola para crearlo automáticamente.',
              [
                { text: 'Entendido', style: 'default' },
                { text: 'Recargar', onPress: () => setRefreshing(true) }
              ]
            );
          } else {
            Alert.alert(
              'Error de Conexión', 
              'No se pudieron cargar los productos. Verifica tu conexión a internet.',
              [
                { text: 'Reintentar', onPress: () => setRefreshing(true) }
              ]
            );
          }
        }
      );

      // Cleanup: desuscribirse al desmontar el componente
      return () => {
        console.log('Limpiando listener de productos');
        unsubscribe();
      };
    } catch (error) {
      console.error('Error configurando listener:', error);
      setLoading(false);
      Alert.alert('Error', 'No se pudo configurar la sincronización de productos');
    }
  }, []);

  /**
   * Función para refrescar manualmente los datos
   */
  const onRefresh = () => {
    setRefreshing(true);
    // El useEffect se ejecutará nuevamente y actualizará los datos
    setTimeout(() => {
      if (refreshing) setRefreshing(false);
    }, 5000); // Timeout de seguridad
  };

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

      {/* TÍTULO DE SECCIÓN CON CONTADOR */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Inventario de Productos</Text>
        {productos.length > 0 && (
          <Text style={styles.productCount}>{productos.length} productos</Text>
        )}
      </View>

      {/* LISTA DE PRODUCTOS CON REFRESH */}
      <FlatList
        data={productos}
        renderItem={renderProductItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#8B9A46']}
            tintColor="#8B9A46"
            title="Actualizando productos..."
            titleColor="#EEEEEE"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyStateContainer}>
            {loading ? (
              <>
                <Text style={styles.emptyStateTitle}>Cargando Productos...</Text>
                <Text style={styles.emptyStateDescription}>
                  Sincronizando con la base de datos
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.emptyStateTitle}>Sin Productos Registrados</Text>
                <Text style={styles.emptyStateDescription}>
                  Utilice el botón "Agregar" en la barra inferior para registrar su primer producto.
                </Text>
                <TouchableOpacity 
                  style={styles.refreshButton}
                  onPress={onRefresh}
                  activeOpacity={0.8}
                >
                  <Text style={styles.refreshButtonText}>Actualizar Lista</Text>
                </TouchableOpacity>
              </>
            )}
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

  // Header de sección con contador
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
    marginHorizontal: 20,
  },

  // Título de sección principal
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#EEEEEE',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // Contador de productos
  productCount: {
    fontSize: 14,
    color: '#8B9A46',
    fontWeight: '600',
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    overflow: 'hidden',
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
    marginBottom: 16,
  },

  // Botón de actualizar en estado vacío
  refreshButton: {
    backgroundColor: '#8B9A46',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 8,
  },

  // Texto del botón de actualizar
  refreshButtonText: {
    color: '#EEEEEE',
    fontWeight: '600',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});