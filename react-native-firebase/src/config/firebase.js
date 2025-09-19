// src/config/firebase.js
import { initializeApp, getApps } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import {
  API_KEY,
  AUTH_DOMAIN,
  PROJECT_ID,
  STORAGE_BUCKET,
  MESSAGING_SENDER_ID,
  APP_ID,
} from '@env';

const firebaseConfig = {
  apiKey: API_KEY,
  authDomain: AUTH_DOMAIN,
  projectId: PROJECT_ID,
  storageBucket: STORAGE_BUCKET,
  messagingSenderId: MESSAGING_SENDER_ID,
  appId: APP_ID,
};

// Evita doble inicialización en Fast Refresh
const app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);

// Auth con persistencia en React Native
let auth;
if (!global.auth) {
  global.auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
}
auth = global.auth;

// Firestore y Storage
const database = getFirestore(app);
const storage = getStorage(app);

export { app, auth, database, storage };