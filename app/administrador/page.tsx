"use client"

import { useState } from "react"
import Link from "next/link"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Home, Route, Users, CreditCard, Package, Download, Settings, ImageIcon } from "lucide-react"
import RouteManagement from "@/components/admin/route-management"
import PersonManagement from "@/components/admin/person-management"
import PaymentControl from "@/components/admin/payment-control"
import ManualRegistration from "@/components/admin/manual-registration"
import SouvenirControl from "@/components/admin/souvenir-control"
import DataExport from "@/components/admin/data-export"
import PriceSettings from "@/components/admin/price-settings"
import GalleryManagement from "@/components/admin/gallery-management"

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("dashboard")

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
                  Control de Pagos
                </Button>
              </li>
              <li>
                <Button
                  variant={activeTab === "manual" ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveTab("manual")}
                >
                  <Users className="mr-2 h-4 w-4" />
                  Inscripción Manual
                </Button>
              </li>
              <li>
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
              </li>
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
              <li>
                <Button
                  variant={activeTab === "gallery" ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveTab("gallery")}
                >
                  <ImageIcon className="mr-2 h-4 w-4" />
                  Gestión de Galería
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
                </TabsTrigger>
                <TabsTrigger value="prices">
                  <Settings className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">Precios</span>
                </TabsTrigger>
                <TabsTrigger value="gallery">
                  <ImageIcon className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">Galería</span>
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Total de Inscritos</CardTitle>
                    <CardDescription>Personas registradas en el evento</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">124</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Pagos Confirmados</CardTitle>
                    <CardDescription>Inscripciones con pago verificado</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">98</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Souvenirs Entregados</CardTitle>
                    <CardDescription>Participantes que recibieron souvenir</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">45</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Inscripciones por Ruta</CardTitle>
                    <CardDescription>Distribución de participantes</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span>Sendero del Bosque</span>
                          <span>45/50</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div className="bg-green-600 h-2.5 rounded-full" style={{ width: "90%" }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span>Cascada Escondida</span>
                          <span>32/40</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div className="bg-green-600 h-2.5 rounded-full" style={{ width: "80%" }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span>Cumbre del Águila</span>
                          <span>25/30</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div className="bg-green-600 h-2.5 rounded-full" style={{ width: "83%" }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span>Valle de los Venados</span>
                          <span>22/30</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div className="bg-green-600 h-2.5 rounded-full" style={{ width: "73%" }}></div>
                        </div>
                      </div>
                    </div>
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
                      Registrar nuevo pago
                    </Button>
                    <Button className="w-full justify-start" onClick={() => setActiveTab("manual")}>
                      <Users className="mr-2 h-4 w-4" />
                      Agregar inscripción manual
                    </Button>
                    <Button className="w-full justify-start" onClick={() => setActiveTab("souvenirs")}>
                      <Package className="mr-2 h-4 w-4" />
                      Marcar souvenir como entregado
                    </Button>
                    <Button className="w-full justify-start" onClick={() => setActiveTab("export")}>
                      <Download className="mr-2 h-4 w-4" />
                      Exportar listado de inscritos
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === "routes" && <RouteManagement />}
          {activeTab === "people" && <PersonManagement />}
          {activeTab === "payments" && <PaymentControl />}
          {activeTab === "manual" && <ManualRegistration />}
          {activeTab === "souvenirs" && <SouvenirControl />}
          {activeTab === "export" && <DataExport />}
          {activeTab === "prices" && <PriceSettings />}
          {activeTab === "gallery" && <GalleryManagement />}
        </div>
      </div>
    </div>
  )
}
