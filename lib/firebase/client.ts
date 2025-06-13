// src/lib/firebase/client.ts

import {
  ref as dbRef,
  push,
  set,
  update,
  remove,
  get,
  query,
  orderByChild,
  equalTo,
} from "firebase/database"
import { database } from "./config"

import {
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage"
import { storage } from "./config"

class FirebaseClient {
  // Rutas
  async getRoutes() {
    try {
      const routesRef = dbRef(database, "routes")
      const snapshot = await get(routesRef)

      if (snapshot.exists()) {
        const routes = []
        snapshot.forEach((childSnapshot) => {
          const routeData = childSnapshot.val()
          routes.push({
            id: childSnapshot.key,
            ...routeData,
            available_spots_by_day:
              routeData.available_spots_by_day || [
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

  async getRouteById(id: string) {
    try {
      const routeRef = dbRef(database, `routes/${id}`)
      const snapshot = await get(routeRef)

      if (snapshot.exists()) {
        const routeData = snapshot.val()
        return {
          id: snapshot.key,
          ...routeData,
          available_spots_by_day:
            routeData.available_spots_by_day || [
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

  async createRoute(routeData: any) {
    try {
      const routesRef = dbRef(database, "routes")
      const newRouteRef = push(routesRef)

      const formattedData = {
        ...routeData,
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

  async updateRoute(id: string, routeData: any) {
    try {
      const routeRef = dbRef(database, `routes/${id}`)
      const formattedData = {
        ...routeData,
        updated_at: new Date().toISOString(),
      }

      await update(routeRef, formattedData)
      return { id, ...formattedData }
    } catch (error) {
      console.error(`Error al actualizar ruta ${id}:`, error)
      throw error
    }
  }

  async deleteRoute(id: string) {
    try {
      const routeRef = dbRef(database, `routes/${id}`)
      await remove(routeRef)
      return true
    } catch (error) {
      console.error(`Error al eliminar ruta ${id}:`, error)
      throw error
    }
  }

  // Galería por ruta
  async addImageToRoute(routeId: string, imageData: any) {
    try {
      const routeRef = dbRef(database, `routes/${routeId}`)
      const routeSnapshot = await get(routeRef)

      if (routeSnapshot.exists()) {
        const routeData = routeSnapshot.val()
        const currentGallery = routeData.gallery || []

        const newImage = {
          id: Date.now().toString(),
          url: imageData.url,
          alt: imageData.alt || "",
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

  async removeImageFromRoute(routeId: string, imageId: string) {
    try {
      const routeRef = dbRef(database, `routes/${routeId}`)
      const snapshot = await get(routeRef)

      if (snapshot.exists()) {
        const routeData = snapshot.val()
        const currentGallery = routeData.gallery || []

        const updatedGallery = currentGallery.filter((img: any) => img.id !== imageId)

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

  // Cupos disponibles por ruta
  async getAvailableSpotsByRoute(routeId: string) {
    try {
      const registrationsRef = dbRef(database, "registrations")
      const routeQuery = query(
        registrationsRef,
        orderByChild("route_id"),
        equalTo(routeId)
      )

      const snapshot = await get(routeQuery)

      const registrationsByDay: Record<string, number> = {}

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
      console.error(`Error al calcular cupos para ruta ${routeId}:`, error)
      return {}
    }
  }

  // Códigos de acceso
  async getAccessCodes() {
    try {
      const accessCodesRef = dbRef(database, "access_codes")
      const snapshot = await get(accessCodesRef)

      if (snapshot.exists()) {
        const codes: any[] = []
        snapshot.forEach((childSnapshot) => {
          codes.push({
            id: childSnapshot.key,
            ...childSnapshot.val(),
          })
        })

        return codes.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
      }

      return []
    } catch (error) {
      console.error("Error al obtener códigos de acceso:", error)
      throw error
    }
  }

  async getAccessCodeByDocument(documentId: string) {
    try {
      const accessCodesRef = dbRef(database, "access_codes")
      const docQuery = query(
        accessCodesRef,
        orderByChild("document_id"),
        equalTo(documentId)
      )

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
      console.error(
        `Error al buscar código por documento ${documentId}:`,
        error
      )
      throw error
    }
  }

  async getAccessCodeByCode(code: string) {
    try {
      const accessCodesRef = dbRef(database, "access_codes")
      const codeQuery = query(
        accessCodesRef,
        orderByChild("access_code"),
        equalTo(code)
      )

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
      console.error(`Error al buscar código "${code}":`, error)
      throw error
    }
  }

  async createAccessCode(accessCodeData: any) {
    try {
      const accessCodesRef = dbRef(database, "access_codes")
      const newAccessCodeRef = push(accessCodesRef)

      const codePrefix = accessCodeData.people_count > 1 ? "GRP" : "IND"
      const codeNumber = Date.now().toString().slice(-6)
      const accessCode = `${codePrefix}-${codeNumber}`

      const formattedData = {
        document_id: accessCodeData.document_id,
        people_count: accessCodeData.people_count,
        access_code: accessCode,
        is_group: accessCodeData.people_count > 1,
        payment_images: accessCodeData.payment_images || [],
        status: "pending",
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

  async updateAccessCode(id: string, accessCodeData: any) {
    try {
      const accessCodeRef = dbRef(database, `access_codes/${id}`)
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

  async deleteAccessCode(id: string) {
    try {
      const accessCodeRef = dbRef(database, `access_codes/${id}`)
      await remove(accessCodeRef)
      return true
    } catch (error) {
      console.error(`Error al eliminar código de acceso ${id}:`, error)
      throw error
    }
  }

  // ✅ SUBIDA DE IMÁGENES A FIREBASE STORAGE
  // ... (tus otras importaciones y métodos permanecen sin cambios) ...

  // ✅ SUBIDA DE IMÁGENES A FIREBASE STORAGE
  async addPaymentImageToAccessCode(accessCodeId: string, file: File) {
    try {
      // ✅ Saneamiento de accessCodeId: Reemplaza cualquier carácter no alfanumérico, guion o guion bajo con un guion bajo.
      // Esto asegura que la parte de la ruta del accessCodeId sea segura.
      const sanitizedAccessCodeId = accessCodeId.replace(/[^a-zA-Z0-9_-]/g, '_');

      // ✅ Saneamiento del nombre del archivo:
      // 1. Extrae la extensión del archivo.
      // 2. Sanea el nombre base del archivo (sin la extensión) para evitar caracteres problemáticos.
      // 3. Genera un ID único robusto.
      const fileExtension = file.name.split('.').pop();
      const baseFileName = file.name.substring(0, file.name.lastIndexOf('.'));
      const sanitizedBaseFileName = baseFileName.replace(/[^a-zA-Z0-9_-]/g, '_'); // Asegura que el nombre base sea seguro
      
      const uniqueId = Date.now().toString() + Math.random().toString(36).substring(2, 8); // ID más robusto

      // ✅ Construye el nombre del archivo final
      // Esto debería resultar en un nombre de archivo como "Mi_Imagen_12345_abc.jpeg"
      const finalFileName = `${sanitizedBaseFileName}_${uniqueId}.${fileExtension}`;


      // ✅ Construye la ruta completa en Storage
      const storagePath = `payment_images/${sanitizedAccessCodeId}/${finalFileName}`;

      // ❗❗❗ PASO CRÍTICO DE DEPURACIÓN ❗❗❗
      // Imprime la ruta de Storage en la consola del navegador.
      console.log("DEBUG_STORAGE_PATH:", storagePath); 

      // Crea la referencia al archivo en Firebase Storage
      const imageStorageRef = storageRef(storage, storagePath);

      // Realiza la subida
      const uploadTask = uploadBytesResumable(imageStorageRef, file);

      // Espera a que la subida se complete
      const snapshot = await new Promise<any>((resolve, reject) => {
        uploadTask.on("state_changed", 
          (progressSnapshot) => {
            // Opcional: puedes loguear el progreso aquí si quieres
            // const progress = (progressSnapshot.bytesTransferred / progressSnapshot.totalBytes) * 100;
            // console.log('Upload is ' + progress + '% done');
          }, 
          (error) => {
            console.error("Error durante la subida:", error);
            reject(error);
          }, 
          () => {
            resolve(uploadTask.snapshot);
          }
        );
      });

      // Obtén la URL de descarga pública
      const downloadURL = await getDownloadURL(snapshot.ref);

      // Actualiza la Base de Datos en Tiempo Real
      const accessCodeRef = dbRef(database, `access_codes/${accessCodeId}`);
      const currentSnapshot = await get(accessCodeRef);
      const data = currentSnapshot.val() || {};

      const newImage = {
        id: dbRef(database).key, // Usa push().key de RTDB para un ID de imagen más robusto
        url: downloadURL,
        uploaded_at: new Date().toISOString(),
        storagePath: storagePath, // Guarda esta ruta para poder eliminarla después
      };

      const updatedImages = [...(data.payment_images || []), newImage];

      await update(accessCodeRef, {
        payment_images: updatedImages,
        status: "paid", // Asume que el pago es "pagado" al subir la imagen
        updated_at: new Date().toISOString(),
      });

      return newImage;
    } catch (error) {
      console.error(`Error al subir imagen al código ${accessCodeId}:`, error);
      throw error;
    }
  }


  // ✅ ELIMINAR COMPROBANTE DE PAGO
  async removePaymentImageFromAccessCode(accessCodeId: string, imageId: string) {
    try {
      const accessCodeRef = dbRef(database, `access_codes/${accessCodeId}`);
      const snapshot = await get(accessCodeRef);
      const data = snapshot.val() || {};
      const images = data.payment_images || [];

      const imageToDelete = images.find((img: any) => img.id === imageId);
      if (!imageToDelete) return;

      // Elimina del Storage si existe el path
      if (imageToDelete.storagePath) {
        const imageStorageRef = storageRef(storage, imageToDelete.storagePath);
        await deleteObject(imageStorageRef);
      }

      // Filtrar imágenes
      const updatedImages = images.filter((img: any) => img.id !== imageId);
      const hasImages = updatedImages.length > 0;

      // Actualizar base de datos
      await update(accessCodeRef, {
        payment_images: updatedImages,
        status: hasImages ? "paid" : "pending", // Si no hay imágenes, vuelve a "pending"
        updated_at: new Date().toISOString(),
      });

      return true;
    } catch (error) {
      console.error(`Error al eliminar imagen del código ${accessCodeId}:`, error);
      throw error;
    }
  }

  // Inscripciones
  async getRegistrations() {
    try {
      const registrationsRef = dbRef(database, "registrations");
      const snapshot = await get(registrationsRef);

      if (snapshot.exists()) {
        const registrations: any[] = [];
        snapshot.forEach((childSnapshot) => {
          registrations.push({
            id: childSnapshot.key,
            ...childSnapshot.val(),
          });
        });

        return registrations;
      }

      return [];
    } catch (error) {
      console.error("Error al obtener inscripciones:", error);
      throw error;
    }
  }

  async getRegistrationByDocument(documentId: string) {
    try {
      const registrationsRef = dbRef(database, "registrations");
      const docQuery = query(
        registrationsRef,
        orderByChild("document_id"),
        equalTo(documentId)
      );

      const snapshot = await get(docQuery);

      if (snapshot.exists()) {
        let registration = null;
        snapshot.forEach((childSnapshot) => {
          registration = {
            id: childSnapshot.key,
            ...childSnapshot.val(),
          };
        });
        return registration;
      }

      return null;
    } catch (error) {
      console.error(
        `Error al obtener inscripción por documento ${documentId}:`,
        error
      );
      throw error;
    }
  }

  async createRegistration(registrationData: any) {
    try {
      const registrationsRef = dbRef(database, "registrations");
      const newRegistrationRef = push(registrationsRef);

      const formattedData = {
        ...registrationData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      await set(newRegistrationRef, formattedData);
      return { id: newRegistrationRef.key, ...formattedData };
    } catch (error) {
      console.error("Error al crear inscripción:", error);
      throw error;
    }
  }

  async updateRegistration(id: string, registrationData: any) {
    try {
      const registrationRef = dbRef(database, `registrations/${id}`);
      const formattedData = {
        ...registrationData,
        updated_at: new Date().toISOString(),
      };

      await update(registrationRef, formattedData);
      return { id, ...formattedData };
    } catch (error) {
      console.error(`Error al actualizar inscripción ${id}:`, error);
      throw error;
    }
  }

  async createPayment(paymentData: any) {
    try {
      const paymentsRef = dbRef(database, "payments");
      const newPaymentRef = push(paymentsRef);

      const formattedData = {
        ...paymentData,
        created_at: new Date().toISOString(),
      };

      await set(newPaymentRef, formattedData);
      return { id: newPaymentRef.key, ...formattedData };
    } catch (error) {
      console.error("Error al crear pago:", error);
      throw error;
    }
  }

  // Galería general
  async getGalleryImages() {
    try {
      const galleryRef = dbRef(database, "gallery");
      const snapshot = await get(galleryRef);

      if (snapshot.exists()) {
        const images: any[] = [];
        snapshot.forEach((childSnapshot) => {
          images.push({
            id: childSnapshot.key,
            ...childSnapshot.val(),
          });
        });
        return images;
      }

      return [];
    } catch (error) {
      console.error("Error al obtener imágenes de galería:", error);
      throw error;
    }
  }

  async createGalleryImage(imageData: any) {
    try {
      const galleryRef = dbRef(database, "gallery");
      const newImageRef = push(galleryRef);

      const formattedData = {
        ...imageData,
        created_at: new Date().toISOString(),
      };

      await set(newImageRef, formattedData);
      return newImageRef.key;
    } catch (error) {
      console.error("Error al crear imagen de galería:", error);
      throw error;
    }
  }

  async deleteGalleryImage(id: string) {
    try {
      const imageRef = dbRef(database, `gallery/${id}`);
      await remove(imageRef);
      return true;
    } catch (error) {
      console.error(`Error al eliminar imagen de galería ${id}:`, error);
      throw error;
    }
  }

  // Configuración
  async getSettings() {
    try {
      const settingsRef = dbRef(database, "settings");
      const snapshot = await get(settingsRef);

      if (snapshot.exists()) {
        return snapshot.val();
      }

      return {
        registration_price: 50000,
        bank_name: "Banco Nacional",
        account_type: "Ahorros",
        account_number: "123-456789-0",
        account_holder: "Evento Caminera S.A.S.",
        nit: "900.123.456-7",
        whatsapp_number: "+57 300 123 4567",
        payment_instructions:
          "Envía una foto del comprobante de pago al WhatsApp junto con tu número de cédula.",
      };
    } catch (error) {
      console.error("Error al obtener configuración:", error);
      throw error;
    }
  }

  async updateSettings(settingsData: any) {
    try {
      const settingsRef = dbRef(database, "settings");
      const formattedData = {
        ...settingsData,
        updated_at: new Date().toISOString(),
      };

      await set(settingsRef, formattedData);
      return formattedData;
    } catch (error) {
      console.error("Error al actualizar configuración:", error);
      throw error;
    }
  }

  // Programación del evento
  async getEventSchedule() {
    try {
      const scheduleRef = dbRef(database, "event_schedule");
      const snapshot = await get(scheduleRef);

      if (snapshot.exists()) {
        const schedule: any[] = [];
        snapshot.forEach((childSnapshot) => {
          schedule.push({
            id: childSnapshot.key,
            ...childSnapshot.val(),
          });
        })

        return schedule.sort((a, b) => a.order - b.order);
      }

      return [];
    } catch (error) {
      console.error("Error al obtener programación:", error);
      throw error;
    }
  }

  async createScheduleItem(scheduleData: any) {
    try {
      const scheduleRef = dbRef(database, "event_schedule");
      const newScheduleRef = push(scheduleRef);

      const formattedData = {
        ...scheduleData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      await set(newScheduleRef, formattedData);
      return { id: newScheduleRef.key, ...formattedData };
    } catch (error) {
      console.error("Error al crear item de programación:", error);
      throw error;
    }
  }

  async updateScheduleItem(id: string, scheduleData: any) {
    try {
      const scheduleRef = dbRef(database, `event_schedule/${id}`);
      const formattedData = {
        ...scheduleData,
        updated_at: new Date().toISOString(),
      };

      await update(scheduleRef, formattedData);
      return { id, ...formattedData };
    } catch (error) {
      console.error(`Error al actualizar item de programación ${id}:`, error);
      throw error;
    }
  }

  async deleteScheduleItem(id: string) {
    try {
      const scheduleRef = dbRef(database, `event_schedule/${id}`);
      await remove(scheduleRef);
      return true;
    } catch (error) {
      console.error(`Error al eliminar item de programación ${id}:`, error);
      throw error;
    }
  }
}

export const firebaseClient = new FirebaseClient();