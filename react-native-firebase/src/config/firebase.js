import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";
import {
  API_KEY,
  AUTH_DOMAIN,
  PROJECT_ID,
  STORAGE_BUCKET,
  MESSAGING_SENDER_ID,
  APP_ID,
  test,
} from "@env";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: API_KEY,
  authDomain: AUTH_DOMAIN,
  projectId: PROJECT_ID,
  storageBucket: STORAGE_BUCKET,
  messagingSenderId: MESSAGING_SENDER_ID,
  appId: APP_ID,
};

console.log(test);
console.log("Valor de configuracion", firebaseConfig);

// Inicializamos Firebase
const app = initializeApp(firebaseConfig);

if (app) {
  console.log("Firebase initialized successfully");
} else {
  console.log("Firebase initialization failed");
}

// Firestore
const database = getFirestore(app);
if (database) {
  console.log("Firestore initialized correctly");
} else {
  console.log("Firestore initialization failed");
}

// Authentication
const auth = getAuth(app);
if (auth) {
  console.log("Auth initialized correctly");
} else {
  console.log("Auth initialization failed");
}

/*
// Storage (lo dejas comentado si no lo necesitas aún)
const storage = getStorage(app);
if (storage) {
  console.log("storage initialized correctly");
} else {
  console.log("storage initialization failed");
}
*/

// Exportamos lo necesario
export { database, auth /*, storage*/ };
