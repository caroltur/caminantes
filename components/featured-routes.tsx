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

type Route = {
  id: string
  name: string
  description: string
  difficulty: "Fácil" | "Moderada" | "Difícil"
  image_url: string
  available_spots_by_day: DaySpots[]
  duration: string
  distance: string
  elevation: string
  meeting_point: string
  gallery?: string[]
}

export default function FeaturedRoutes() {
  const [routes, setRoutes] = useState<Route[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRoutes()
  }, [])

  const fetchRoutes = async () => {
    try {
      const data = await firebaseClient.getRoutes()

      // Calcular cupos disponibles para cada ruta
      const routesWithAvailability = await Promise.all(
        data.map(async (route) => {
          const registeredByDay = await firebaseClient.getAvailableSpotsByRoute(route.id)

          const availableSpotsByDay = route.available_spots_by_day.map((daySpot) => ({
            day: daySpot.day,
            spots: Math.max(0, daySpot.spots - (registeredByDay[daySpot.day] || 0)),
          }))

          const totalAvailable = availableSpotsByDay.reduce((total, day) => total + day.spots, 0)

          return {
            ...route,
            availableSpotsByDay,
            totalAvailable,
          }
        }),
      )

      // Ordenar por cupos disponibles (mayor a menor)
      const sortedRoutes = routesWithAvailability.sort((a, b) => b.totalAvailable - a.totalAvailable).slice(0, 3)

      setRoutes(sortedRoutes)
    } catch (error) {
      console.error("Error fetching routes:", error)
      // Fallback data
      setRoutes([
        {
          id: "1",
          name: "Sendero del Bosque",
          description: "Un recorrido tranquilo a través de un hermoso bosque con vistas panorámicas.",
          difficulty: "Fácil",
          image_url: "/placeholder.svg?height=300&width=500",
          available_spots_by_day: [
            { day: 1, spots: 25 },
            { day: 2, spots: 20 },
          ],
          availableSpotsByDay: [
            { day: 1, spots: 23 },
            { day: 2, spots: 18 },
          ],
          totalAvailable: 41,
          duration: "3 horas",
          distance: "5 km",
          elevation: "150 m",
          meeting_point: "Parque Central",
        },
        {
          id: "2",
          name: "Cascada Escondida",
          description: "Ruta que te lleva a una impresionante cascada oculta entre montañas.",
          difficulty: "Moderada",
          image_url: "/placeholder.svg?height=300&width=500",
          available_spots_by_day: [
            { day: 1, spots: 15 },
            { day: 2, spots: 12 },
          ],
          availableSpotsByDay: [
            { day: 1, spots: 12 },
            { day: 2, spots: 10 },
          ],
          totalAvailable: 22,
          duration: "4 horas",
          distance: "7 km",
          elevation: "300 m",
          meeting_point: "Estación de guardabosques",
        },
        {
          id: "3",
          name: "Cumbre del Águila",
          description: "Ascenso desafiante con vistas espectaculares desde la cima.",
          difficulty: "Difícil",
          image_url: "/placeholder.svg?height=300&width=500",
          available_spots_by_day: [
            { day: 1, spots: 10 },
            { day: 2, spots: 8 },
          ],
          availableSpotsByDay: [
            { day: 1, spots: 8 },
            { day: 2, spots: 6 },
          ],
          totalAvailable: 14,
          duration: "6 horas",
          distance: "10 km",
          elevation: "800 m",
          meeting_point: "Centro de visitantes",
        },
      ])
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
                    {route.totalAvailable || 0} disponibles
                  </Badge>
                </div>
              </div>

              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{route.name}</h3>
                <p className="text-gray-600 mb-4 line-clamp-2">{route.description}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>Duración aproximada: {route.duration}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Ruler className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>Distancia: {route.distance}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Mountain className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>Elevación: {route.elevation}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">{route.meeting_point}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mb-4">
                  {route.availableSpotsByDay?.map((daySpot) => (
                    <Badge key={daySpot.day} variant={daySpot.spots > 0 ? "default" : "secondary"} className="text-xs">
                      Día {daySpot.day}: {daySpot.spots} disponibles
                    </Badge>
                  )) ||
                    route.available_spots_by_day?.map((daySpot) => (
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
