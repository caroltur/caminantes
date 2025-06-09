"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Clock, MapPin, Mountain, Users, ArrowLeft, Ruler, ChevronLeft, ChevronRight, ImageIcon } from "lucide-react"
import Link from "next/link"
import { firebaseClient } from "@/lib/firebase/client"

type DaySpots = {
  day: number
  spots: number
}

type GalleryImage = {
  id: string
  url: string
  alt: string
  uploaded_at: string
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
  gallery: GalleryImage[]
}

export default function RouteDetailPage() {
  const params = useParams()
  const [route, setRoute] = useState<Route | null>(null)
  const [loading, setLoading] = useState(true)
  const [availableSpots, setAvailableSpots] = useState<DaySpots[]>([])
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)
  const [currentGalleryIndex, setCurrentGalleryIndex] = useState(0)

  useEffect(() => {
    if (params.id) {
      fetchRoute(params.id as string)
    }
  }, [params.id])

  const fetchRoute = async (id: string) => {
    try {
      const data = await firebaseClient.getRouteById(id)
      if (data) {
        setRoute(data)

        // Calcular cupos disponibles
        const registeredByDay = await firebaseClient.getAvailableSpotsByRoute(id)
        const availableSpotsByDay = data.available_spots_by_day.map((daySpot) => ({
          day: daySpot.day,
          spots: Math.max(0, daySpot.spots - (registeredByDay[daySpot.day] || 0)),
        }))
        setAvailableSpots(availableSpotsByDay)
      }
    } catch (error) {
      console.error("Error fetching route:", error)
      // Fallback data
      setRoute({
        id: "1",
        name: "Sendero del Bosque",
        description:
          "Un recorrido tranquilo a través de un hermoso bosque con vistas panorámicas. Esta ruta es perfecta para principiantes y familias que buscan una experiencia en la naturaleza sin demasiada dificultad. El sendero está bien marcado y ofrece múltiples puntos de descanso con vistas espectaculares del valle. Durante el recorrido podrás observar diversas especies de aves y flora nativa, así como disfrutar de la tranquilidad que solo la naturaleza puede ofrecer.",
        difficulty: "Fácil",
        image_url: "/placeholder.svg?height=400&width=800",
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
            id: "1",
            url: "/placeholder.svg?height=400&width=600",
            alt: "Vista panorámica del sendero del bosque",
            uploaded_at: new Date().toISOString(),
          },
          {
            id: "2",
            url: "/placeholder.svg?height=400&width=600",
            alt: "Sendero entre los árboles",
            uploaded_at: new Date().toISOString(),
          },
          {
            id: "3",
            url: "/placeholder.svg?height=400&width=600",
            alt: "Punto de descanso con vista al valle",
            uploaded_at: new Date().toISOString(),
          },
          {
            id: "4",
            url: "/placeholder.svg?height=400&width=600",
            alt: "Flora nativa del bosque",
            uploaded_at: new Date().toISOString(),
          },
          {
            id: "5",
            url: "/placeholder.svg?height=400&width=600",
            alt: "Grupo de senderistas en el bosque",
            uploaded_at: new Date().toISOString(),
          },
        ],
      })
      setAvailableSpots([
        { day: 1, spots: 23 },
        { day: 2, spots: 18 },
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

  const getTotalAvailableSpots = (spots: DaySpots[]) => {
    return spots.reduce((total, day) => total + day.spots, 0)
  }

  const nextImage = () => {
    if (route?.gallery && route.gallery.length > 0) {
      setCurrentGalleryIndex((prev) => (prev + 1) % route.gallery.length)
    }
  }

  const prevImage = () => {
    if (route?.gallery && route.gallery.length > 0) {
      setCurrentGalleryIndex((prev) => (prev - 1 + route.gallery.length) % route.gallery.length)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/3 mb-8"></div>
            <div className="h-64 bg-gray-300 rounded mb-8"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-300 rounded"></div>
              <div className="h-4 bg-gray-300 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!route) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Ruta no encontrada</h1>
            <Link href="/rutas">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver a Rutas
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Usar la galería específica de la ruta, o la imagen principal como fallback
  const galleryImages =
    route.gallery && route.gallery.length > 0
      ? route.gallery
      : [
          {
            id: "main",
            url: route.image_url,
            alt: route.name,
            uploaded_at: new Date().toISOString(),
          },
        ]

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <Link href="/rutas">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a Rutas
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Imagen principal */}
            <div className="relative h-64 md:h-96 mb-6 rounded-lg overflow-hidden">
              <img
                src={route.image_url || "/placeholder.svg"}
                alt={route.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg?height=400&width=800"
                }}
              />
              <div className="absolute top-4 left-4">
                <Badge className={`${getDifficultyColor(route.difficulty)} text-white`}>{route.difficulty}</Badge>
              </div>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">{route.name}</h1>
            <p className="text-gray-600 text-lg leading-relaxed mb-8">{route.description}</p>

            {/* Galería de fotos específica de la ruta */}
            {galleryImages.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <ImageIcon className="mr-2 h-5 w-5 text-green-700" />
                  Galería de {route.name}
                </h3>

                {galleryImages.length > 1 ? (
                  <>
                    {/* Imagen principal de la galería */}
                    <div className="relative h-64 md:h-80 mb-4 rounded-lg overflow-hidden">
                      <img
                        src={galleryImages[currentGalleryIndex]?.url || "/placeholder.svg"}
                        alt={
                          galleryImages[currentGalleryIndex]?.alt || `${route.name} - Imagen ${currentGalleryIndex + 1}`
                        }
                        className="w-full h-full object-cover cursor-pointer"
                        onClick={() => setSelectedImageIndex(currentGalleryIndex)}
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg?height=400&width=600"
                        }}
                      />

                      {/* Controles de navegación */}
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>

                      {/* Indicador de posición */}
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                        {currentGalleryIndex + 1} / {galleryImages.length}
                      </div>
                    </div>

                    {/* Miniaturas */}
                    <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                      {galleryImages.slice(0, 8).map((image, index) => (
                        <div
                          key={image.id}
                          className={`relative h-16 rounded overflow-hidden cursor-pointer border-2 transition-all ${
                            index === currentGalleryIndex
                              ? "border-green-500"
                              : "border-transparent hover:border-gray-300"
                          }`}
                          onClick={() => setCurrentGalleryIndex(index)}
                        >
                          <img
                            src={image.url || "/placeholder.svg"}
                            alt={image.alt || `Miniatura ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder.svg?height=100&width=100"
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  /* Imagen única */
                  <div className="relative h-64 md:h-80 rounded-lg overflow-hidden">
                    <img
                      src={galleryImages[0]?.url || "/placeholder.svg"}
                      alt={galleryImages[0]?.alt || route.name}
                      className="w-full h-full object-cover cursor-pointer"
                      onClick={() => setSelectedImageIndex(0)}
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg?height=400&width=600"
                      }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Detalles de la Ruta</h3>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 mr-3 text-gray-500" />
                    <div>
                      <p className="font-medium">Duración aproximada</p>
                      <p className="text-gray-600">{route.duration}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Ruler className="h-5 w-5 mr-3 text-gray-500" />
                    <div>
                      <p className="font-medium">Distancia</p>
                      <p className="text-gray-600">{route.distance}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Mountain className="h-5 w-5 mr-3 text-gray-500" />
                    <div>
                      <p className="font-medium">Elevación</p>
                      <p className="text-gray-600">{route.elevation}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 mr-3 text-gray-500" />
                    <div>
                      <p className="font-medium">Punto de Encuentro</p>
                      <p className="text-gray-600">{route.meeting_point}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Users className="h-5 w-5 mr-3 text-gray-500" />
                    <div>
                      <p className="font-medium">Cupos Disponibles</p>
                      <p className="text-gray-600">{getTotalAvailableSpots(availableSpots)} personas</p>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="font-medium mb-3">Disponibilidad por Día</h4>
                  <div className="space-y-2">
                    {availableSpots.map((daySpot) => (
                      <div key={daySpot.day} className="flex justify-between items-center">
                        <span className="text-gray-600">Día {daySpot.day}</span>
                        <Badge
                          variant={daySpot.spots > 0 ? "default" : "secondary"}
                          className={daySpot.spots > 0 ? "bg-green-500" : ""}
                        >
                          {daySpot.spots} disponibles
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">¿Cómo inscribirse?</h4>
                  <p className="text-blue-800 text-sm mb-3">
                    Para inscribirte, primero debes realizar el pago y luego usar tu código de confirmación en el
                    proceso de inscripción.
                  </p>
                  <Link href="/inscripcion">
                    <Button size="sm" className="w-full">
                      Ir a Inscripción
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Modal de imagen ampliada */}
        <Dialog open={selectedImageIndex !== null} onOpenChange={() => setSelectedImageIndex(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] p-0">
            {selectedImageIndex !== null && galleryImages[selectedImageIndex] && (
              <div className="relative h-[80vh]">
                <Image
                  src={galleryImages[selectedImageIndex].url || "/placeholder.svg"}
                  alt={galleryImages[selectedImageIndex].alt || `${route.name} - Imagen ampliada`}
                  fill
                  className="object-contain"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg?height=600&width=800"
                  }}
                />
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
