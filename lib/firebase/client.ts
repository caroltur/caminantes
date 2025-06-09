import { ref, set, push, get, remove, update, query, orderByChild, equalTo } from "firebase/database"
import { database } from "./config"

class FirebaseClient {
  // Rutas
  async getRoutes() {
    try {
      const routesRef = ref(database, "routes")
      const snapshot = await get(routesRef)

      if (snapshot.exists()) {
        const routes = []
        snapshot.forEach((childSnapshot) => {
          const routeData = childSnapshot.val()
          routes.push({
            id: childSnapshot.key,
            ...routeData,
            available_spots_by_day: routeData.available_spots_by_day || [
              { day: 1, spots: 0 },
              { day: 2, spots: 0 },
            ],
            gallery: routeData.gallery || [],
          })
        })
        return routes
      }
      return []
    } catch (error) {
      console.error("Error al obtener rutas:", error)
      throw error
    }
  }

  async getRouteById(id) {
    try {
      const routeRef = ref(database, `routes/${id}`)
      const snapshot = await get(routeRef)

      if (snapshot.exists()) {
        const routeData = snapshot.val()
        return {
          id: snapshot.key,
          ...routeData,
          available_spots_by_day: routeData.available_spots_by_day || [
            { day: 1, spots: 0 },
            { day: 2, spots: 0 },
          ],
          gallery: routeData.gallery || [],
        }
      }
      return null
    } catch (error) {
      console.error(`Error al obtener ruta ${id}:`, error)
      throw error
    }
  }

  async createRoute(routeData) {
    try {
      const routesRef = ref(database, "routes")
      const newRouteRef = push(routesRef)

      const formattedData = {
        ...routeData,
        available_spots_by_day: routeData.available_spots_by_day || [
          { day: 1, spots: 0 },
          { day: 2, spots: 0 },
        ],
        gallery: routeData.gallery || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      await set(newRouteRef, formattedData)
      return { id: newRouteRef.key, ...formattedData }
    } catch (error) {
      console.error("Error al crear ruta:", error)
      throw error
    }
  }

  async updateRoute(id, routeData) {
    try {
      const routeRef = ref(database, `routes/${id}`)

      const formattedData = {
        ...routeData,
        available_spots_by_day: routeData.available_spots_by_day || [
          { day: 1, spots: 0 },
          { day: 2, spots: 0 },
        ],
        updated_at: new Date().toISOString(),
      }

      await update(routeRef, formattedData)
      return { id, ...formattedData }
    } catch (error) {
      console.error(`Error al actualizar ruta ${id}:`, error)
      throw error
    }
  }

  async deleteRoute(id) {
    try {
      const routeRef = ref(database, `routes/${id}`)
      await remove(routeRef)
      return true
    } catch (error) {
      console.error(`Error al eliminar ruta ${id}:`, error)
      throw error
    }
  }

  // Galería específica por ruta
  async addImageToRoute(routeId, imageData) {
    try {
      const routeRef = ref(database, `routes/${routeId}`)
      const routeSnapshot = await get(routeRef)

      if (routeSnapshot.exists()) {
        const routeData = routeSnapshot.val()
        const currentGallery = routeData.gallery || []

        // Agregar nueva imagen a la galería
        const newImage = {
          id: Date.now().toString(),
          url: imageData.url,
          alt: imageData.alt,
          uploaded_at: new Date().toISOString(),
        }

        const updatedGallery = [...currentGallery, newImage]

        await update(routeRef, {
          gallery: updatedGallery,
          updated_at: new Date().toISOString(),
        })

        return newImage
      }
      throw new Error("Ruta no encontrada")
    } catch (error) {
      console.error(`Error al agregar imagen a ruta ${routeId}:`, error)
      throw error
    }
  }

  async removeImageFromRoute(routeId, imageId) {
    try {
      const routeRef = ref(database, `routes/${routeId}`)
      const routeSnapshot = await get(routeRef)

      if (routeSnapshot.exists()) {
        const routeData = routeSnapshot.val()
        const currentGallery = routeData.gallery || []

        // Filtrar la imagen a eliminar
        const updatedGallery = currentGallery.filter((img) => img.id !== imageId)

        await update(routeRef, {
          gallery: updatedGallery,
          updated_at: new Date().toISOString(),
        })

        return true
      }
      throw new Error("Ruta no encontrada")
    } catch (error) {
      console.error(`Error al eliminar imagen de ruta ${routeId}:`, error)
      throw error
    }
  }

  // Calcular cupos disponibles por ruta
  async getAvailableSpotsByRoute(routeId) {
    try {
      const registrationsRef = ref(database, "registrations")
      const routeQuery = query(registrationsRef, orderByChild("route_id"), equalTo(routeId))
      const snapshot = await get(routeQuery)

      const registrationsByDay = {}

      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          const registration = childSnapshot.val()
          if (registration.payment_status === "paid") {
            const day = registration.day || 1
            registrationsByDay[day] = (registrationsByDay[day] || 0) + 1
          }
        })
      }

      return registrationsByDay
    } catch (error) {
      console.error(`Error al calcular cupos disponibles para ruta ${routeId}:`, error)
      return {}
    }
  }

  // Códigos de acceso
  async getAccessCodes() {
    try {
      const accessCodesRef = ref(database, "access_codes")
      const snapshot = await get(accessCodesRef)

      if (snapshot.exists()) {
        const accessCodes = []
        snapshot.forEach((childSnapshot) => {
          accessCodes.push({
            id: childSnapshot.key,
            ...childSnapshot.val(),
          })
        })
        return accessCodes.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      }
      return []
    } catch (error) {
      console.error("Error al obtener códigos de acceso:", error)
      throw error
    }
  }

  async getAccessCodeByDocument(documentId) {
    try {
      const accessCodesRef = ref(database, "access_codes")
      const docQuery = query(accessCodesRef, orderByChild("document_id"), equalTo(documentId))
      const snapshot = await get(docQuery)

      if (snapshot.exists()) {
        let accessCode = null
        snapshot.forEach((childSnapshot) => {
          accessCode = {
            id: childSnapshot.key,
            ...childSnapshot.val(),
          }
        })
        return accessCode
      }
      return null
    } catch (error) {
      console.error(`Error al obtener código de acceso por documento ${documentId}:`, error)
      throw error
    }
  }

  async getAccessCodeByCode(code) {
    try {
      const accessCodesRef = ref(database, "access_codes")
      const codeQuery = query(accessCodesRef, orderByChild("access_code"), equalTo(code))
      const snapshot = await get(codeQuery)

      if (snapshot.exists()) {
        let accessCode = null
        snapshot.forEach((childSnapshot) => {
          accessCode = {
            id: childSnapshot.key,
            ...childSnapshot.val(),
          }
        })
        return accessCode
      }
      return null
    } catch (error) {
      console.error(`Error al obtener código de acceso por código ${code}:`, error)
      throw error
    }
  }

  async createAccessCode(accessCodeData) {
    try {
      const accessCodesRef = ref(database, "access_codes")
      const newAccessCodeRef = push(accessCodesRef)

      // Generar código único
      const codePrefix = accessCodeData.people_count > 1 ? "GRP" : "IND"
      const codeNumber = Date.now().toString().slice(-6)
      const accessCode = `${codePrefix}-${codeNumber}`

      const formattedData = {
        document_id: accessCodeData.document_id,
        people_count: accessCodeData.people_count,
        access_code: accessCode,
        is_group: accessCodeData.people_count > 1,
        payment_images: accessCodeData.payment_images || [],
        status: "pending", // pending, paid, used
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      await set(newAccessCodeRef, formattedData)
      return { id: newAccessCodeRef.key, ...formattedData }
    } catch (error) {
      console.error("Error al crear código de acceso:", error)
      throw error
    }
  }

  async updateAccessCode(id, accessCodeData) {
    try {
      const accessCodeRef = ref(database, `access_codes/${id}`)

      const formattedData = {
        ...accessCodeData,
        updated_at: new Date().toISOString(),
      }

      await update(accessCodeRef, formattedData)
      return { id, ...formattedData }
    } catch (error) {
      console.error(`Error al actualizar código de acceso ${id}:`, error)
      throw error
    }
  }

  async deleteAccessCode(id) {
    try {
      const accessCodeRef = ref(database, `access_codes/${id}`)
      await remove(accessCodeRef)
      return true
    } catch (error) {
      console.error(`Error al eliminar código de acceso ${id}:`, error)
      throw error
    }
  }

  async addPaymentImageToAccessCode(accessCodeId, imageData) {
    try {
      const accessCodeRef = ref(database, `access_codes/${accessCodeId}`)
      const snapshot = await get(accessCodeRef)

      if (snapshot.exists()) {
        const accessCodeData = snapshot.val()
        const currentImages = accessCodeData.payment_images || []

        const newImage = {
          id: Date.now().toString(),
          url: imageData.url,
          uploaded_at: new Date().toISOString(),
        }

        const updatedImages = [...currentImages, newImage]

        await update(accessCodeRef, {
          payment_images: updatedImages,
          status: "paid",
          updated_at: new Date().toISOString(),
        })

        return newImage
      }
      throw new Error("Código de acceso no encontrado")
    } catch (error) {
      console.error(`Error al agregar imagen de pago al código ${accessCodeId}:`, error)
      throw error
    }
  }

  async removePaymentImageFromAccessCode(accessCodeId, imageId) {
    try {
      const accessCodeRef = ref(database, `access_codes/${accessCodeId}`)
      const snapshot = await get(accessCodeRef)

      if (snapshot.exists()) {
        const accessCodeData = snapshot.val()
        const currentImages = accessCodeData.payment_images || []

        const updatedImages = currentImages.filter((img) => img.id !== imageId)

        await update(accessCodeRef, {
          payment_images: updatedImages,
          status: updatedImages.length > 0 ? "paid" : "pending",
          updated_at: new Date().toISOString(),
        })

        return true
      }
      throw new Error("Código de acceso no encontrado")
    } catch (error) {
      console.error(`Error al eliminar imagen de pago del código ${accessCodeId}:`, error)
      throw error
    }
  }

  // Inscripciones
  async getRegistrations() {
    try {
      const registrationsRef = ref(database, "registrations")
      const snapshot = await get(registrationsRef)

      if (snapshot.exists()) {
        const registrations = []
        snapshot.forEach((childSnapshot) => {
          registrations.push({
            id: childSnapshot.key,
            ...childSnapshot.val(),
          })
        })
        return registrations
      }
      return []
    } catch (error) {
      console.error("Error al obtener inscripciones:", error)
      throw error
    }
  }

  async getRegistrationByDocument(documentId) {
    try {
      const registrationsRef = ref(database, "registrations")
      const docQuery = query(registrationsRef, orderByChild("document_id"), equalTo(documentId))
      const snapshot = await get(docQuery)

      if (snapshot.exists()) {
        let registration = null
        snapshot.forEach((childSnapshot) => {
          registration = {
            id: childSnapshot.key,
            ...childSnapshot.val(),
          }
        })
        return registration
      }
      return null
    } catch (error) {
      console.error(`Error al obtener inscripción por documento ${documentId}:`, error)
      throw error
    }
  }

  async createRegistration(registrationData) {
    try {
      const registrationsRef = ref(database, "registrations")
      const newRegistrationRef = push(registrationsRef)

      const formattedData = {
        ...registrationData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      await set(newRegistrationRef, formattedData)
      return { id: newRegistrationRef.key, ...formattedData }
    } catch (error) {
      console.error("Error al crear inscripción:", error)
      throw error
    }
  }

  async updateRegistration(id, registrationData) {
    try {
      const registrationRef = ref(database, `registrations/${id}`)

      const formattedData = {
        ...registrationData,
        updated_at: new Date().toISOString(),
      }

      await update(registrationRef, formattedData)
      return { id, ...formattedData }
    } catch (error) {
      console.error(`Error al actualizar inscripción ${id}:`, error)
      throw error
    }
  }

  // Pagos (mantener para compatibilidad)
  async createPayment(paymentData) {
    try {
      const paymentsRef = ref(database, "payments")
      const newPaymentRef = push(paymentsRef)

      const formattedData = {
        ...paymentData,
        created_at: new Date().toISOString(),
      }

      await set(newPaymentRef, formattedData)
      return { id: newPaymentRef.key, ...formattedData }
    } catch (error) {
      console.error("Error al crear pago:", error)
      throw error
    }
  }

  // Galería general (mantenida para compatibilidad)
  async getGalleryImages() {
    try {
      const galleryRef = ref(database, "gallery")
      const snapshot = await get(galleryRef)

      if (snapshot.exists()) {
        const images = []
        snapshot.forEach((childSnapshot) => {
          images.push({
            id: childSnapshot.key,
            ...childSnapshot.val(),
          })
        })
        return images
      }
      return []
    } catch (error) {
      console.error("Error al obtener imágenes de galería:", error)
      throw error
    }
  }

  async createGalleryImage(imageData) {
    try {
      const galleryRef = ref(database, "gallery")
      const newImageRef = push(galleryRef)

      const formattedData = {
        ...imageData,
        created_at: new Date().toISOString(),
      }

      await set(newImageRef, formattedData)
      return newImageRef.key
    } catch (error) {
      console.error("Error al crear imagen de galería:", error)
      throw error
    }
  }

  async deleteGalleryImage(id) {
    try {
      const imageRef = ref(database, `gallery/${id}`)
      await remove(imageRef)
      return true
    } catch (error) {
      console.error(`Error al eliminar imagen ${id}:`, error)
      throw error
    }
  }

  // Configuración
  async getSettings() {
    try {
      const settingsRef = ref(database, "settings")
      const snapshot = await get(settingsRef)

      if (snapshot.exists()) {
        return snapshot.val()
      }
      return {
        registration_price: 50000,
        bank_name: "Banco Nacional",
        account_type: "Ahorros",
        account_number: "123-456789-0",
        account_holder: "Evento Caminera S.A.S.",
        nit: "900.123.456-7",
        whatsapp_number: "+57 300 123 4567",
        payment_instructions: "Envía una foto del comprobante de pago al WhatsApp junto con tu número de cédula.",
      }
    } catch (error) {
      console.error("Error al obtener configuración:", error)
      throw error
    }
  }

  async updateSettings(settingsData) {
    try {
      const settingsRef = ref(database, "settings")
      const formattedData = {
        ...settingsData,
        updated_at: new Date().toISOString(),
      }
      await set(settingsRef, formattedData)
      return formattedData
    } catch (error) {
      console.error("Error al actualizar configuración:", error)
      throw error
    }
  }

  // Programación del evento
  async getEventSchedule() {
    try {
      const scheduleRef = ref(database, "event_schedule")
      const snapshot = await get(scheduleRef)

      if (snapshot.exists()) {
        const schedule = []
        snapshot.forEach((childSnapshot) => {
          schedule.push({
            id: childSnapshot.key,
            ...childSnapshot.val(),
          })
        })
        return schedule.sort((a, b) => a.order - b.order)
      }
      return []
    } catch (error) {
      console.error("Error al obtener programación:", error)
      throw error
    }
  }

  async createScheduleItem(scheduleData) {
    try {
      const scheduleRef = ref(database, "event_schedule")
      const newScheduleRef = push(scheduleRef)

      const formattedData = {
        ...scheduleData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      await set(newScheduleRef, formattedData)
      return { id: newScheduleRef.key, ...formattedData }
    } catch (error) {
      console.error("Error al crear item de programación:", error)
      throw error
    }
  }

  async updateScheduleItem(id, scheduleData) {
    try {
      const scheduleRef = ref(database, `event_schedule/${id}`)

      const formattedData = {
        ...scheduleData,
        updated_at: new Date().toISOString(),
      }

      await update(scheduleRef, formattedData)
      return { id, ...formattedData }
    } catch (error) {
      console.error(`Error al actualizar item de programación ${id}:`, error)
      throw error
    }
  }

  async deleteScheduleItem(id) {
    try {
      const scheduleRef = ref(database, `event_schedule/${id}`)
      await remove(scheduleRef)
      return true
    } catch (error) {
      console.error(`Error al eliminar item de programación ${id}:`, error)
      throw error
    }
  }
}

export const firebaseClient = new FirebaseClient()
