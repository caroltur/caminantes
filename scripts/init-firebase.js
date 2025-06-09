import { initializeApp } from "firebase/app"
import { getDatabase, ref, set } from "firebase/database"

const firebaseConfig = {
  apiKey: "AIzaSyAmot7JrabI66NJ4RkUJqKuuZ7IV8tZnzI",
  authDomain: "camineria-d4dac.firebaseapp.com",
  databaseURL: "https://camineria-d4dac-default-rtdb.firebaseio.com/",
  projectId: "camineria-d4dac",
  storageBucket: "camineria-d4dac.firebasestorage.app",
  messagingSenderId: "95656369310",
  appId: "1:95656369310:web:a2db74e2dc6509ab902f8f",
}

// Inicializar Firebase
const app = initializeApp(firebaseConfig)
const database = getDatabase(app)

// Datos iniciales
const initialData = {
  routes: {
    route1: {
      name: "Sendero del Bosque",
      description: "Un recorrido tranquilo a través de un hermoso bosque con vistas panorámicas.",
      difficulty: "Fácil",
      image_url: "/placeholder.svg?height=300&width=500",
      available_spots_by_day: [
        { day: 1, spots: 25 },
        { day: 2, spots: 20 },
      ],
      duration: "3 horas",
      distance: "5 km",
      elevation: "150 m",
      meeting_point: "Parque Central, entrada principal",
      gallery: [
        {
          id: "img1",
          url: "/placeholder.svg?height=400&width=600",
          alt: "Vista panorámica del sendero del bosque",
          uploaded_at: new Date().toISOString(),
        },
        {
          id: "img2",
          url: "/placeholder.svg?height=400&width=600",
          alt: "Sendero entre los árboles",
          uploaded_at: new Date().toISOString(),
        },
        {
          id: "img3",
          url: "/placeholder.svg?height=400&width=600",
          alt: "Punto de descanso con vista al valle",
          uploaded_at: new Date().toISOString(),
        },
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    route2: {
      name: "Cascada Escondida",
      description: "Ruta que te lleva a una impresionante cascada oculta entre montañas.",
      difficulty: "Moderada",
      image_url: "/placeholder.svg?height=300&width=500",
      available_spots_by_day: [
        { day: 1, spots: 15 },
        { day: 2, spots: 12 },
        { day: 3, spots: 10 },
      ],
      duration: "4 horas",
      distance: "7 km",
      elevation: "300 m",
      meeting_point: "Estación de guardabosques",
      gallery: [
        {
          id: "img1",
          url: "/placeholder.svg?height=400&width=600",
          alt: "La cascada escondida en todo su esplendor",
          uploaded_at: new Date().toISOString(),
        },
        {
          id: "img2",
          url: "/placeholder.svg?height=400&width=600",
          alt: "Sendero hacia la cascada",
          uploaded_at: new Date().toISOString(),
        },
        {
          id: "img3",
          url: "/placeholder.svg?height=400&width=600",
          alt: "Poza natural de la cascada",
          uploaded_at: new Date().toISOString(),
        },
        {
          id: "img4",
          url: "/placeholder.svg?height=400&width=600",
          alt: "Vista desde arriba de la cascada",
          uploaded_at: new Date().toISOString(),
        },
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    route3: {
      name: "Cumbre del Águila",
      description: "Ascenso desafiante con vistas espectaculares desde la cima.",
      difficulty: "Difícil",
      image_url: "/placeholder.svg?height=300&width=500",
      available_spots_by_day: [
        { day: 1, spots: 10 },
        { day: 2, spots: 8 },
      ],
      duration: "6 horas",
      distance: "10 km",
      elevation: "800 m",
      meeting_point: "Centro de visitantes",
      gallery: [
        {
          id: "img1",
          url: "/placeholder.svg?height=400&width=600",
          alt: "Vista panorámica desde la cumbre del águila",
          uploaded_at: new Date().toISOString(),
        },
        {
          id: "img2",
          url: "/placeholder.svg?height=400&width=600",
          alt: "Sendero empinado hacia la cumbre",
          uploaded_at: new Date().toISOString(),
        },
        {
          id: "img3",
          url: "/placeholder.svg?height=400&width=600",
          alt: "Formaciones rocosas en el ascenso",
          uploaded_at: new Date().toISOString(),
        },
        {
          id: "img4",
          url: "/placeholder.svg?height=400&width=600",
          alt: "Grupo de senderistas en la cumbre",
          uploaded_at: new Date().toISOString(),
        },
        {
          id: "img5",
          url: "/placeholder.svg?height=400&width=600",
          alt: "Amanecer desde la cumbre",
          uploaded_at: new Date().toISOString(),
        },
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
  settings: {
    registration_price: 50000,
    bank_name: "Banco Nacional",
    account_type: "Ahorros",
    account_number: "123-456789-0",
    account_holder: "Evento Caminera S.A.S.",
    nit: "900.123.456-7",
    whatsapp_number: "+57 300 123 4567",
    payment_instructions: "Envía una foto del comprobante de pago al WhatsApp junto con tu número de cédula.",
    updated_at: new Date().toISOString(),
  },
  event_schedule: {
    item1: {
      day: "Día 1",
      time: "06:00 AM",
      title: "Punto de encuentro",
      description: "Reunión en el punto de partida, registro de asistentes y entrega de kit de bienvenida.",
      order: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    item2: {
      day: "Día 1",
      time: "06:30 AM",
      title: "Inicio de la caminata",
      description: "Charla de seguridad y comienzo del recorrido por la ruta seleccionada.",
      order: 2,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    item3: {
      day: "Día 1",
      time: "08:30 AM",
      title: "Parada para refrigerio",
      description: "Descanso para hidratación y refrigerio ligero.",
      order: 3,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    item4: {
      day: "Día 1",
      time: "12:00 PM",
      title: "Almuerzo",
      description: "Parada para almuerzo en un punto panorámico de la ruta.",
      order: 4,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    item5: {
      day: "Día 1",
      time: "03:00 PM",
      title: "Llegada al punto final",
      description: "Finalización del recorrido, entrega de souvenirs y fotografía grupal.",
      order: 5,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    item6: {
      day: "Día 2",
      time: "07:00 AM",
      title: "Segundo día de aventura",
      description: "Inicio del segundo día con nuevas rutas y experiencias.",
      order: 6,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
  // Mantener galería general para compatibilidad
  gallery: {
    img1: {
      url: "/placeholder.svg?height=400&width=600",
      alt: "Vista general del evento",
      created_at: new Date().toISOString(),
    },
  },
}

// Función para inicializar los datos
async function initializeFirebaseData() {
  try {
    console.log("Inicializando datos en Firebase...")

    // Escribir datos iniciales
    await set(ref(database), initialData)

    console.log("✅ Datos inicializados correctamente en Firebase!")
    console.log("📊 Rutas creadas:", Object.keys(initialData.routes).length)
    console.log("🖼️ Galerías por ruta configuradas")
    console.log("📅 Programación del evento configurada")
    console.log("⚙️ Configuración inicial establecida")
  } catch (error) {
    console.error("❌ Error al inicializar datos:", error)
  }
}

// Ejecutar la inicialización
initializeFirebaseData()
