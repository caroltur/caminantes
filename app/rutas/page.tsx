"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, MapPin, Mountain, Users, Search } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
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
}

export default function RoutesPage() {
  const [routes, setRoutes] = useState<Route[]>([])
  const [filteredRoutes, setFilteredRoutes] = useState<Route[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [difficultyFilter, setDifficultyFilter] = useState("all")
  const router = useRouter()

  useEffect(() => {
    fetchRoutes()
  }, [])

  useEffect(() => {
    filterRoutes()
  }, [routes, searchTerm, difficultyFilter])

  const fetchRoutes = async () => {
    try {
      const data = await firebaseClient.getRoutes()
      setRoutes(data)
    } catch (error) {
      console.error("Error fetching routes:", error)
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

  const filterRoutes = () => {
    let filtered = routes

    if (searchTerm) {
      filtered = filtered.filter(
        (route) =>
          route.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          route.description.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (difficultyFilter !== "all") {
      filtered = filtered.filter((route) => route.difficulty === difficultyFilter)
    }

    setFilteredRoutes(filtered)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Fácil":
        return "bg-green-500 text-white"
      case "Moderada":
        return "bg-yellow-500 text-white"
      case "Difícil":
        return "bg-red-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  const getTotalSpots = (spotsByDay: DaySpots[]) => {
    if (!spotsByDay || !Array.isArray(spotsByDay)) return 0
    return spotsByDay.reduce((total, day) => total + day.spots, 0)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Nuestras Rutas</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">Cargando rutas...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      {/* Botón fijo o destacado */}
      <div className="container mx-auto px-4 mb-8">
        <Button
          onClick={() => router.push("/")}
          variant="outline"
          className="w-full md:w-auto border-2 border-green-600 text-green-600 hover:bg-green-50 shadow-md font-semibold"
        >
          ← Volver al Inicio
        </Button>
      </div>

      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Nuestras Rutas</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explora todas nuestras rutas de senderismo, desde caminatas fáciles hasta desafiantes ascensos de montaña.
          </p>
        </div>

        {/* Filtros */}
        <div className="mb-8 flex flex-col md:flex-row gap-4 max-w-2xl mx-auto justify-between items-center">
          <div className="relative flex-1 w-full md:w-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar rutas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Filtrar por dificultad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las dificultades</SelectItem>
              <SelectItem value="Fácil">Fácil</SelectItem>
              <SelectItem value="Moderada">Moderada</SelectItem>
              <SelectItem value="Difícil">Difícil</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Rutas */}
        {filteredRoutes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No se encontraron rutas que coincidan con tu búsqueda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredRoutes.map((route) => (
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
                    <Badge className={`${getDifficultyColor(route.difficulty)}`}>
                      {route.difficulty}
                    </Badge>
                  </div>
                  <div className="absolute top-4 right-4">
                    <Badge variant="secondary" className="bg-white/90 text-gray-900">
                      <Users className="h-3 w-3 mr-1" />
                      {getTotalSpots(route.available_spots_by_day)} cupos
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{route.name}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">{route.description}</p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>{route.duration} Horas</span>
                      <span className="mx-2">•</span>
                      <span>{route.distance} Km</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Mountain className="h-4 w-4 mr-2" />
                      <span>Elevación: {route.elevation} metros</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span className="truncate">{route.meeting_point}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {route.available_spots_by_day.map((daySpot) => (
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
        )}
      </div>
    </div>
  )
}