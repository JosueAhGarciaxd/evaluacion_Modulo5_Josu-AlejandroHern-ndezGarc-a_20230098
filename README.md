# Professional Network - React Native + Firebase

Una aplicación móvil profesional desarrollada en React Native con Firebase para la gestión de inventario de productos. La app incluye autenticación de usuarios, registro de productos, y gestión de perfil profesional.

## 🚀 Características

### 🔐 Autenticación
- Registro de usuarios con información profesional
- Inicio de sesión seguro con Firebase Auth
- Persistencia de sesión
- Validación de formularios en tiempo real

### 📱 Gestión de Productos
- Agregar nuevos productos al inventario
- Visualizar lista de productos en tiempo real
- Marcar productos como vendidos/disponibles
- Eliminar productos del inventario
- Subida de imágenes desde galería

### 👤 Perfil Profesional
- Edición de información personal
- Datos académicos y profesionales
- Interfaz optimizada para profesionales

### 🎨 Diseño
- Interfaz moderna con paleta de colores profesional
- Navegación por pestañas intuitiva
- Animaciones fluidas y transiciones
- Diseño responsive y accesible

## 🛠️ Tecnologías Utilizadas

### Frontend
- **React Native** - Framework principal
- **Expo** - Plataforma de desarrollo
- **React Navigation** - Navegación entre pantallas
- **Expo Image Picker** - Selección de imágenes

### Backend & Base de Datos
- **Firebase Authentication** - Autenticación de usuarios
- **Cloud Firestore** - Base de datos NoSQL en tiempo real
- **Firebase Storage** - Almacenamiento de archivos (preparado)

### UI/UX
- **React Native Safe Area Context** - Manejo de áreas seguras
- **Ionicons** - Iconografía moderna
- **Paleta de colores profesional**: `#0F0E0E`, `#541212`, `#8B9A46`, `#EEEEEE`

## 📁 Estructura del Proyecto

```
react-native-firebase/
├── src/
│   ├── components/
│   │   └── CardProduct.js          # Componente tarjeta de producto
│   ├── config/
│   │   └── firebase.js             # Configuración Firebase
│   ├── navigation/
│   │   └── Navigation.js           # Navegación principal
│   └── screens/
│       ├── SplashScreens.js        # Pantalla de carga
│       ├── LoginScreens.js         # Pantalla de login
│       ├── RegisterScreens.js      # Pantalla de registro
│       ├── HomeSrceens.js          # Pantalla principal
│       ├── KeepScreens.js          # Agregar productos
│       └── EditProfileScreens.js   # Editar perfil
├── App.js                          # Componente raíz
└── package.json
```

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js (v14 o superior)
- npm o yarn
- Expo CLI
- Cuenta de Firebase

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/react-native-firebase.git
cd react-native-firebase
```

### 2. Instalar dependencias
```bash
npm install
# o
yarn install
```

### 3. Configurar Firebase

1. Crea un proyecto en [Firebase Console](https://console.firebase.google.com/)
2. Habilita Authentication (Email/Password)
3. Crea una base de datos Firestore
4. Obtén las credenciales de configuración

### 4. Variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
API_KEY=tu_api_key
AUTH_DOMAIN=tu_proyecto.firebaseapp.com
PROJECT_ID=tu_proyecto_id
STORAGE_BUCKET=tu_proyecto.appspot.com
MESSAGING_SENDER_ID=123456789
APP_ID=1:123456789:web:abcdef123456
```
### 5. Índices de Firestore

Para optimizar las consultas, crea estos índices compuestos:

```
Colección: productos
Campos: uid (Ascending), creado (Descending)
```

### 6. Ejecutar la aplicación

```bash
# Desarrollo con Expo
npx expo start

# Para iOS
npx expo start --ios

# Para Android
npx expo start --android
```

## 📱 Funcionalidades Principales

### Autenticación
- **Registro**: Los usuarios pueden crear cuentas con información profesional completa
- **Login**: Acceso seguro con email y contraseña
- **Persistencia**: La sesión se mantiene entre reinicios de la app

### Gestión de Productos
- **Agregar**: Formulario completo con imagen, nombre y precio
- **Visualizar**: Lista en tiempo real con información detallada
- **Actualizar**: Cambiar estado de vendido/disponible
- **Eliminar**: Remover productos del inventario

### Perfil Profesional
- **Edición**: Actualizar información personal y académica
- **Validación**: Formularios con validación en tiempo real

## 🎨 Paleta de Colores

| Color | Hex | Uso |
|-------|-----|-----|
| Negro Profundo | `#0F0E0E` | Fondo principal, texto primario |
| Rojo Oscuro | `#541212` | Botones principales, acentos |
| Verde Oliva | `#8B9A46` | Botones secundarios, elementos activos |
| Gris Claro | `#EEEEEE` | Fondos de tarjetas, texto secundario |

## 📋 Scripts Disponibles

```bash
# Iniciar desarrollo
npm start

# Limpiar caché
npm run clear

# Construcción para producción
npm run build

# Ejecutar tests
npm test
```

## 🔧 Configuraciones Adicionales

### Permisos requeridos
- **Galería de imágenes**: Para subir fotos de productos
- **Internet**: Para sincronización con Firebase

### Configuraciones de navegación
- Stack Navigator para flujo de autenticación
- Tab Navigator para pantallas principales
- Animaciones suaves entre transiciones

## 🚨 Solución de Problemas Comunes

### Error de índices en Firestore
```
Error: The query requires an index
```
**Solución**: Crear el índice compuesto mencionado en la configuración

### Error de permisos de galería
```
Error accessing image gallery
```
**Solución**: Verificar permisos en el dispositivo

### Problemas de autenticación
```
Firebase Auth errors
```
**Solución**: Verificar configuración en `.env` y reglas de Firestore

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agrega nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request
   
## 👥 Autor

Josué Alejandro Hernández García - 20230098
- GitHub: [Josueahgarcia](https://github.com/JosueAhGarcia)
- Instagram: [Instagran](https://www.instagram.com/josueahgarcia/)
- Email (Institucionaal): 20230098@ricaldone.edu.sv

## 📹 Video
-Video: [drive](https://drive.google.com/drive/folders/1zou2p-p-QvDWrQKY-ciACDbKS393W3lt?usp=drive_link)
