import { initializeApp } from "firebase/app"
import { getDatabase } from "firebase/database"
import { getStorage } from "firebase/storage"

// Usa la configuración proporcionada por el usuario
const firebaseConfig = {
  apiKey: "AIzaSyAmot7JrabI66NJ4RkUJqKuuZ7IV8tZnzI",
  authDomain: "camineria-d4dac.firebaseapp.com",
  databaseURL: "https://camineria-d4dac-default-rtdb.firebaseio.com", // URL de la base de datos en tiempo real
  projectId: "camineria-d4dac",
  storageBucket: "camineria-d4dac.appspot.com", // Corregido según el formato estándar
  messagingSenderId: "95656369310",
  appId: "1:95656369310:web:a2db74e2dc6509ab902f8f",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Realtime Database and get a reference to the service
export const database = getDatabase(app)
export const storage = getStorage(app)

export default app
