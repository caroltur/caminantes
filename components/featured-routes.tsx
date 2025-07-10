"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, MapPin, Mountain, Users, Ruler } from "lucide-react"
import Link from "next/link"
import { firebaseClient } from "@/lib/firebase/client"

type DaySpots = {
  day: number
  spots: number
}

// ✅ CORRECCIÓN CLAVE: Añadir totalAvailable y availableSpotsByDay a la interfaz Route
type Route = {
  id: string
  name: string
  description: string
  difficulty: "Fácil" | "Moderada" | "Difícil"
  image_url: string
  available_spots_by_day: DaySpots[] // Propiedad original de Firebase
  duration: string
  distance: string
  elevation: string
  meeting_point: string
  gallery?: string[]
  
  // Propiedades calculadas y añadidas en el frontend:
  availableSpotsByDay?: DaySpots[] // La lista de cupos disponibles después del cálculo
  totalAvailable?: number // El total de cupos disponibles
}

export default function FeaturedRoutes() {
  const [routes, setRoutes] = useState<Route[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRoutes()
  }, [])

  const fetchRoutes = async () => {
    setLoading(true)
    try {
      // Aseguramos que 'data' sea un array de 'Route' objetos desde el principio
      // Si firebaseClient.getRoutes() devuelve un tipo más general (ej. any[]),
      // esta aserción (as Route[]) es útil.
      const data = await firebaseClient.getRoutes() as Route[]; 

      // Calcular cupos disponibles para cada ruta
      const routesWithAvailability = await Promise.all(
        data.map(async (route: Route) => { // Explicitamente tipamos 'route' aquí
          const registeredByDay = await firebaseClient.getAvailableSpotsByRoute(route.id)

          const availableSpotsByDay = route.available_spots_by_day.map((daySpot: DaySpots) => ({
            day: daySpot.day,
            spots: Math.max(0, daySpot.spots - (registeredByDay[daySpot.day] || 0)),
          }))

          const totalAvailable = availableSpotsByDay.reduce((total, day) => total + day.spots, 0)

          return {
            ...route,
            availableSpotsByDay,
            totalAvailable,
          } as Route; // ✅ Aseguramos que el objeto retornado coincida con la interfaz Route extendida
        }),
      )

      // Ordenar por cupos disponibles (mayor a menor)
      const sortedRoutes = routesWithAvailability.sort((a, b) => (b.totalAvailable || 0) - (a.totalAvailable || 0)).slice(0, 3) // Usamos 0 si es undefined

      setRoutes(sortedRoutes)
    } catch (error) {
      console.error("Error fetching routes:", error)
      // Fallback data
    } finally {
      setLoading(false)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Fácil":
        return "bg-green-500"
      case "Moderada":
        return "bg-yellow-500"
      case "Difícil":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Rutas Destacadas</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Descubre nuestras rutas más populares y emocionantes</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-300"></div>
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-300 rounded"></div>
                    <div className="h-3 bg-gray-300 rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Rutas Destacadas</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Descubre nuestras rutas más populares ordenadas por disponibilidad de cupos
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {routes.map((route) => (
            <Card key={route.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative h-48">
                <img
                  src={route.image_url || "/placeholder.svg"}
                  alt={route.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg?height=300&width=500"
                  }}
                />
                <div className="absolute top-4 left-4">
                  <Badge className={`${getDifficultyColor(route.difficulty)} text-white`}>{route.difficulty}</Badge>
                </div>
                <div className="absolute top-4 right-4">
                  <Badge variant="secondary" className="bg-white/90 text-gray-900">
                    <Users className="h-3 w-3 mr-1" />
                    {route.totalAvailable || 0} disponibles {/* Usamos || 0 para manejar undefined */}
                  </Badge>
                </div>
              </div>

              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{route.name}</h3>
                <p className="text-gray-600 mb-4 line-clamp-2">{route.description}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>Duración aproximada: {route.duration} Horas</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Ruler className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>Distancia: {route.distance} Km</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Mountain className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>Elevación: {route.elevation} metros</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">{route.meeting_point}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mb-4">
                  {/* Priorizamos la propiedad calculada 'availableSpotsByDay' */}
                  {route.availableSpotsByDay?.map((daySpot: DaySpots) => (
                    <Badge key={daySpot.day} variant={daySpot.spots > 0 ? "default" : "secondary"} className="text-xs">
                      Día {daySpot.day}: {daySpot.spots} disponibles
                    </Badge>
                  )) ||
                    // Si por alguna razón 'availableSpotsByDay' no existe, usamos la original 'available_spots_by_day'
                    route.available_spots_by_day?.map((daySpot: DaySpots) => (
                      <Badge key={daySpot.day} variant="outline" className="text-xs">
                        Día {daySpot.day}: {daySpot.spots} cupos
                      </Badge>
                    ))}
                </div>

                <Link href={`/rutas/${route.id}`}>
                  <Button className="w-full">Ver Detalles</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href="/rutas">
            <Button variant="outline" size="lg">
              Ver Todas las Rutas
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}