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
      
      setScheduleItems([
        {
          id: "1",
          day: "Viernes 31 de Octubre",
          time: "07:00 AM a 2:00 PM",
          title: "Llegada de participantes",
          description: "Llegada de participantes.",
          order: 1,
        },
        {
          id: "2",
          day: "Viernes 31 de Octubre",
          time: "3:00 PM",
          title: "Desfile por Villamaría",
          description: "Recorrido tipo desfile por Villamaría con secretaría de cultura.",
          order: 2,
        },
        {
          id: "3",
          day: "Viernes 31 de Octubre",
          time: "5:00 PM",
          title: "Eucaristía",
          description: "Eucaristía de recibimiento con bendición de bastones.",
          order: 3,
        },
        {
          id: "4",
          day: "Viernes 31 de Octubre",
          time: "6:00 PM",
          title: "Entrega de souvenirs",
          description: "Entrega de souvenirs sede salón parroquial.",
          order: 4,
        },
        {
          id: "5",
          day: "Sábado 1 de Noviembre",
          time: "5:00 AM a 8:00 AM",
          title: "Salida de recorrido según el grado de dificultad",
          description: "Salida de recorrido según el grado de dificultad.",
          order: 5,
        },
        {
          id: "6",
          day: "Sábado 1 de Noviembre",
          time: "1:00 PM a 7:00 PM",
          title: "Llegada de las caminatas",
          description: "Llegada de las caminatas.",
          order: 6,
        },
        {
          id: "7",
          day: "Domingo 2 de Noviembre",
          time: "5:00 AM a 8:00 AM",
          title: "Salida de recorrido según el grado de dificultad",
          description: "Salida de recorrido según el grado de dificultad.",
          order: 7,
        },
        {
          id: "8",
          day: "Domingo 2 de Noviembre",
          time: "1:00 PM a 7:00 PM",
          title: "Llegada de las caminatas",
          description: "Llegada de las caminatas.",
          order: 8,
        },
        {
          id: "9",
          day: "Lunes 3 de Noviembre",
          time: "",
          title: "Regreso de caminantes a sus lugares de origen",
          description: "Regreso de caminantes a sus lugares de origen.",
          order: 9,
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
      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out">
  <CardHeader className="bg-gradient-to-r from-red-500 to-orange-500 text-white p-4 rounded-t-lg">
    <h1 className="text-xl font-bold">Otra Programación</h1>
  </CardHeader>
  <CardContent className="p-4 flex flex-col items-center justify-center">
    <div className="space-y-4 text-center">
      <p className="text-gray-700 mb-4">
        Descubre emocionantes ofertas de actividades y rutas con otros operadores turísticos.
        ¡Amplía tus opciones de aventura!
      </p>
      {/* El enlace ahora apunta a una URL externa específica */}
      <a
        href="https://drive.google.com/file/d/1YF1ZaoeRs5T3HPb-XOWDk5QuGX61Pngo/view?usp=sharing" // <--- CAMBIA ESTA URL POR LA REAL
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-full transition-colors duration-300 ease-in-out transform hover:scale-105"
      >
        Ver Ofertas de Otros Operadores
      </a>
    </div>
  </CardContent>
</Card>
      
    </div>
    
  )
}
