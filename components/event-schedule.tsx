"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, Calendar } from "lucide-react"
import { firebaseClient } from "@/lib/firebase/client"

type ScheduleItem = {
  id: string
  day: string
  time: string
  title: string
  description: string
  order: number
}

export default function EventSchedule() {
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSchedule()
  }, [])

  const fetchSchedule = async () => {
    try {
      const data = await firebaseClient.getEventSchedule()
      setScheduleItems(data)
    } catch (error) {
      console.error("Error fetching schedule:", error)
      // Fallback data
      setScheduleItems([
        {
          id: "1",
          day: "Día 1",
          time: "06:00 AM",
          title: "Punto de encuentro",
          description: "Reunión en el punto de partida, registro de asistentes y entrega de kit de bienvenida.",
          order: 1,
        },
        {
          id: "2",
          day: "Día 1",
          time: "06:30 AM",
          title: "Inicio de la caminata",
          description: "Charla de seguridad y comienzo del recorrido por la ruta seleccionada.",
          order: 2,
        },
        {
          id: "3",
          day: "Día 1",
          time: "08:30 AM",
          title: "Parada para refrigerio",
          description: "Descanso para hidratación y refrigerio ligero.",
          order: 3,
        },
        {
          id: "4",
          day: "Día 1",
          time: "12:00 PM",
          title: "Almuerzo",
          description: "Parada para almuerzo en un punto panorámico de la ruta.",
          order: 4,
        },
        {
          id: "5",
          day: "Día 1",
          time: "03:00 PM",
          title: "Llegada al punto final",
          description: "Finalización del recorrido, entrega de souvenirs y fotografía grupal.",
          order: 5,
        },
        {
          id: "6",
          day: "Día 2",
          time: "07:00 AM",
          title: "Segundo día de aventura",
          description: "Inicio del segundo día con nuevas rutas y experiencias.",
          order: 6,
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  // Agrupar items por día
  const groupedSchedule = scheduleItems.reduce(
    (acc, item) => {
      if (!acc[item.day]) {
        acc[item.day] = []
      }
      acc[item.day].push(item)
      return acc
    },
    {} as Record<string, ScheduleItem[]>,
  )

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-gray-300 rounded w-1/2"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex space-x-4">
                <div className="h-4 bg-gray-300 rounded w-16"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-300 rounded w-1/3 mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {Object.entries(groupedSchedule).map(([day, items]) => (
        <Card key={day}>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-green-700" />
              {day}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative border-l-2 border-green-200 pl-6 space-y-6">
              {items.map((item, index) => (
                <div key={item.id} className="relative">
                  <div className="absolute -left-[31px] bg-white p-1 rounded-full border-2 border-green-200">
                    <Clock className="h-4 w-4 text-green-700" />
                  </div>
                  <div>
                    <div className="flex items-center mb-1">
                      <span className="bg-green-100 text-green-800 text-sm font-medium px-2.5 py-0.5 rounded mr-2">
                        {item.time}
                      </span>
                      <h3 className="font-bold">{item.title}</h3>
                    </div>
                    <p className="text-gray-600">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
