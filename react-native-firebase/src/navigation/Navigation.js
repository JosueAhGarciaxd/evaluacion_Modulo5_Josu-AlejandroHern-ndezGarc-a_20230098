// src/navigation/Navigation.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from '@expo/vector-icons/Ionicons';

// Importación de pantallas de la aplicación
import Splash from '../screens/SplashScreens';
import Home from '../screens/HomeSrceens';
import Add from '../screens/KeepScreens';
import EditProfile from '../screens/EditProfileScreens';
import Login from '../screens/LoginScreens';
import Register from '../screens/RegisterScreens';

// Inicialización de navegadores
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

/**
 * Configuración de pestañas principales para usuarios autenticados
 * Incluye: Inicio, Agregar contenido y Perfil del usuario
 */
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        // Configuración de header
        headerTitleAlign: 'center',
        headerStyle: {
          backgroundColor: '#0F0E0E', // Fondo oscuro profesional
          borderBottomWidth: 1,
          borderBottomColor: '#8B9A46', // Línea de separación verde oliva
          elevation: 8, // Sombra en Android
          shadowColor: '#000', // Sombra en iOS
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 8,
        },
        headerTitleStyle: {
          fontSize: 18,
          fontWeight: '700',
          color: '#EEEEEE', // Texto claro para contraste
          letterSpacing: 1,
          textTransform: 'uppercase',
        },
        
        // Configuración de la barra de pestañas
        tabBarActiveTintColor: '#541212', // Color activo rojo oscuro
        tabBarInactiveTintColor: '#8B9A46', // Color inactivo verde oliva
        tabBarLabelStyle: { 
          fontSize: 11, 
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: 0.5,
          marginTop: 2,
        },
        tabBarStyle: { 
          height: 62,
          paddingBottom: 8,
          paddingTop: 8,
          backgroundColor: '#EEEEEE', // Fondo claro para la barra
          borderTopWidth: 2,
          borderTopColor: '#8B9A46', // Línea superior verde oliva
          elevation: 12, // Sombra pronunciada
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
        },
        
        // Configuración de iconos con lógica condicional
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = 'home';
          
          // Selección de iconos según la ruta y estado de foco
          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Agregar':
              iconName = focused ? 'add-circle' : 'add-circle-outline';
              break;
            case 'Perfil':
              iconName = focused ? 'person' : 'person-outline';
              break;
          }
          
          return (
            <Ionicons 
              name={iconName} 
              size={focused ? size + 2 : size} // Iconos activos ligeramente más grandes
              color={color} 
            />
          );
        },
      })}
    >
      {/* Pestaña: Pantalla principal */}
      <Tab.Screen
        name="Home"
        component={Home}
        options={{ 
          title: 'Inicio',
          tabBarLabel: 'Inicio',
        }}
      />
      
      {/* Pestaña: Agregar nuevo contenido */}
      <Tab.Screen
        name="Agregar"
        component={Add}
        options={{ 
          title: 'Nuevo Registro',
          tabBarLabel: 'Agregar',
        }}
      />
      
      {/* Pestaña: Perfil del usuario */}
      <Tab.Screen
        name="Perfil"
        component={EditProfile}
        options={{ 
          title: 'Mi Perfil Profesional',
          tabBarLabel: 'Perfil',
        }}
      />
    </Tab.Navigator>
  );
}

/**
 * Navegación principal de la aplicación
 * Maneja el flujo desde splash screen hasta autenticación y app principal
 */
export default function Navigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash" // Pantalla inicial: splash screen
        screenOptions={{ 
          headerShown: false, // Ocultar headers del stack principal
          animation: 'slide_from_right', // Animación de transición
          gestureEnabled: true, // Habilitar gestos de navegación
        }}
      >
        {/* Pantalla de carga inicial */}
        <Stack.Screen 
          name="Splash" 
          component={Splash}
          options={{
            // Prevenir navegación hacia atrás desde splash
            gestureEnabled: false,
          }}
        />

        {/* Pantallas de autenticación */}
        <Stack.Screen 
          name="Login" 
          component={Login}
          options={{
            title: 'Iniciar Sesión',
            // Animación específica para login
            animation: 'fade',
          }}
        />
        
        <Stack.Screen 
          name="Register" 
          component={Register}
          options={{
            title: 'Crear Cuenta',
            // Transición suave para registro
            animation: 'slide_from_bottom',
          }}
        />

        {/* Aplicación principal con pestañas para usuarios autenticados */}
        <Stack.Screen 
          name="MainTabs" 
          component={MainTabs}
          options={{
            // Prevenir navegación hacia atrás desde app principal
            gestureEnabled: false,
            // Transición fade para entrada a app principal
            animation: 'fade',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}