"use client"


import Link from "next/link"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Home, Route, Users, CreditCard, Settings } from "lucide-react"
import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableRow, TableHead, TableHeader } from "@/components/ui/table"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { firebaseClient } from "@/lib/firebase/client"
import RouteManagement from "@/components/admin/route-management"
import PersonManagement from "@/components/admin/person-management"
import PaymentControl from "@/components/admin/payment-control"
//import SouvenirControl from "@/components/admin/souvenir-control"
import PriceSettings from "@/components/admin/price-settings"

interface SpotByDay {
  day: number
  spots: number
}

interface RouteData {
  id: string
  name: string
  available_spots_by_day: SpotByDay[]
}


export default function AdminPage() {
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("dashboard")
  //const [accessCodes, setAccessCodes] = useState<any[]>([])
  const [totalInscritos, setTotalInscritos] = useState(0)
  const [cuposTotales, setCuposTotales] = useState(0)
  //const [souvenirsEntregados, setSouvenirsEntregados] = useState(0)
  const [routesData, setRoutesData] = useState<{
    name: string
    day1Used: number
    day1Total: number
    day2Used: number
    day2Total: number
  }[]>([])

  useEffect(() => {
    const loadData = async () => {
      try {
        // 1. Obtener todas las inscripciones
        // Cargar códigos de acceso
        const codesList = await firebaseClient.getAccessCodes()
        //setAccessCodes(codesList)

        // Calcular cupos totales desde los códigos usados/pagados
        const totalSpotss = codesList          
          .reduce((acc, code) => acc + code.people_count, 0)
        setCuposTotales(totalSpotss)
        const registrationsSnapshot = await firebaseClient.getRegistrations()
        const totalRegistered = registrationsSnapshot.length
        setTotalInscritos(totalRegistered)

        // Cargar inscripciones para contar inscritos
        const registrationsList = await firebaseClient.getRegistrations()
        setTotalInscritos(registrationsList.length)

        // Cargar rutas para mostrar gráfica
        const routesList = await firebaseClient.getRoutes() as RouteData[]

        // Contar cuántas personas están inscritas por ruta y día
        const routesWithStats = routesList.map(route => {
          const routeId = route.id
          const day1Used = registrationsList.filter(
            reg => reg.route_id_day1 === routeId
          ).length
          const day2Used = registrationsList.filter(
            reg => reg.route_id_day2 === routeId
          ).length
          const day1Total = route.available_spots_by_day.find((d: SpotByDay) => d.day === 1)?.spots || 0
          const day2Total = route.available_spots_by_day.find((d: SpotByDay) => d.day === 2)?.spots || 0

          return {
            id: route.id,
            name: route.name,
            day1Used,
            day1Total,
            day2Used,
            day2Total,
          }
        })

        setRoutesData(routesWithStats)

      } catch (error) {
        console.error("Error al cargar datos:", error)
        toast.error("No se pudieron cargar los datos")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Calcular si hay cupos disponibles
  

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
        <span className="ml-2">Cargando datos...</span>
      </div>
    )
  }
  return (
   <div className="min-h-screen bg-gray-100">
      <div className="flex">
        {/* Sidebar */}
        <div className="hidden md:flex flex-col w-64 bg-white border-r h-screen sticky top-0">
          <div className="p-4 border-b">
            <h1 className="text-xl font-bold text-green-700">Panel de Administración</h1>
          </div>
          <nav className="flex-1 p-4">
            <ul className="space-y-1">
              <li>
                <Button
                  variant={activeTab === "dashboard" ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveTab("dashboard")}
                >
                  <Home className="mr-2 h-4 w-4" />
                  Inicio
                </Button>
              </li>
              <li>
                <Button
                  variant={activeTab === "routes" ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveTab("routes")}
                >
                  <Route className="mr-2 h-4 w-4" />
                  Gestión de Rutas
                </Button>
              </li>
              <li>
                <Button
                  variant={activeTab === "people" ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveTab("people")}
                >
                  <Users className="mr-2 h-4 w-4" />
                  Gestión de Personas
                </Button>
              </li>
              <li>
                <Button
                  variant={activeTab === "payments" ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveTab("payments")}
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Códigos de Acceso
                </Button>
              </li>
              
              {/*<li>
                <Button
                  variant={activeTab === "souvenirs" ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveTab("souvenirs")}
                >
                  <Package className="mr-2 h-4 w-4" />
                  Control de Souvenirs
                </Button>
              </li>
              <li>
                <Button
                  variant={activeTab === "export" ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveTab("export")}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Exportación de Datos
                </Button>
              </li>*/}
              <li>
                <Button
                  variant={activeTab === "prices" ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveTab("prices")}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Configuración de Precios
                </Button>
              </li>
              
            </ul>
          </nav>
          <div className="p-4 border-t">
            <Button asChild variant="outline" className="w-full">
              <Link href="/">Ir al sitio público</Link>
            </Button>
          </div>
        </div>

        {/* Mobile navigation */}
        <div className="md:hidden w-full bg-white border-b sticky top-0 z-10">
          <div className="p-4 flex justify-between items-center">
            <h1 className="text-lg font-bold text-green-700">Panel de Administración</h1>
            <Button asChild variant="outline" size="sm">
              <Link href="/">Sitio público</Link>
            </Button>
          </div>
          <div className="overflow-x-auto pb-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="px-4">
              <TabsList className="w-max">
                <TabsTrigger value="dashboard">
                  <Home className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">Inicio</span>
                </TabsTrigger>
                <TabsTrigger value="routes">
                  <Route className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">Rutas</span>
                </TabsTrigger>
                <TabsTrigger value="people">
                  <Users className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">Personas</span>
                </TabsTrigger>
                <TabsTrigger value="payments">
                  <CreditCard className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">Pagos</span>
                </TabsTrigger>
                {/*}
                <TabsTrigger value="manual">
                  <Users className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">Inscripción</span>
                </TabsTrigger>
                <TabsTrigger value="souvenirs">
                  <Package className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">Souvenirs</span>
                </TabsTrigger>
                <TabsTrigger value="export">
                  <Download className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">Exportar</span>
                </TabsTrigger>*/}
                <TabsTrigger value="prices">
                  <Settings className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">Precios</span>
                </TabsTrigger>
                
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 p-4 md:p-8">
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold">Panel de Control</h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Total de Inscritos</CardTitle>
                <CardDescription>Personas registradas en el evento</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{totalInscritos}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Cupos Autorizados</CardTitle>
                <CardDescription>Número máximo de participantes permitidos</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{cuposTotales}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Souvenirs Entregados</CardTitle>
                <CardDescription>Artículos entregados a los participantes</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">0</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabla de rutas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Inscripciones por Ruta</CardTitle>
                <CardDescription>Distribución de cupos por día</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ruta</TableHead>
                      <TableHead className="text-center">Día 1 <br/> Usados/Total</TableHead>
                      <TableHead className="text-center">Día 2 <br/> Usados/Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {routesData.map((route, index) => {

                      return (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{route.name}</TableCell>
                          <TableCell className="text-center">{route.day1Used} / {route.day1Total}</TableCell>
                          <TableCell className="text-center">{route.day2Used} / {route.day2Total}</TableCell>
                        </TableRow>
                      )
                    })}

                    {routesData.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-gray-500">
                          No hay rutas definidas aún
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            <Card>
                  <CardHeader>
                    <CardTitle>Acciones Rápidas</CardTitle>
                    <CardDescription>Accesos directos a funciones comunes</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button className="w-full justify-start" onClick={() => setActiveTab("payments")}>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Generar nuevo Código
                    </Button>
                    <Button className="w-full justify-start" onClick={() => setActiveTab("routes")}>
                      <Route className="mr-2 h-4 w-4" />
                      Gestión de Rutas
                    </Button>
                    <Button className="w-full justify-start" onClick={() => setActiveTab("people")}>
                      <Users className="mr-2 h-4 w-4" />
                      Gestión de Personas
                    </Button>
                    <Button className="w-full justify-start" onClick={() => setActiveTab("prices")}>
                      <Settings className="mr-2 h-4 w-4" />
                      Configuración de precios
                    </Button>
                  </CardContent>
                </Card>
          </div>
          </div>
          )}
          

          {activeTab === "routes" && <RouteManagement />}
          {activeTab === "people" && <PersonManagement />}
          {activeTab === "payments" && <PaymentControl />}
          {/*activeTab === "souvenirs" && <SouvenirControl />*/}
          {/*activeTab === "export" && <DataExport />*/}
          {activeTab === "prices" && <PriceSettings />}
        </div>
      </div>
    </div>
  )
}