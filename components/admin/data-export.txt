"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Download, FileSpreadsheet, Filter, Calendar } from "lucide-react"

// --- INICIO DE CAMBIO: Eliminar la importación de useToast ---
// import { useToast } from "@/hooks/use-toast" // ELIMINAR ESTA LÍNEA
// --- FIN DE CAMBIO ---

import { toast } from "sonner" // <-- Importa la función 'toast' de sonner

export default function DataExport() {
  // --- INICIO DE CAMBIO: Eliminar la desestructuración de useToast ---
  // const { toast } = useToast() // ELIMINAR ESTA LÍNEA
  // --- FIN DE CAMBIO ---
  const [exporting, setExporting] = useState(false)
  const [routeFilter, setRouteFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [includePersonalData, setIncludePersonalData] = useState(true)
  const [includePaymentData, setIncludePaymentData] = useState(true)
  const [includeSouvenirData, setIncludeSouvenirData] = useState(true)

  const handleExport = async () => {
    setExporting(true)

    try {
      // In a real implementation, you would:
      // 1. Fetch data from Supabase based on filters
      // 2. Generate Excel file using a library like xlsx
      // 3. Download the file

      // Simulate export process
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Mock download
      const filename = `inscritos_evento_${new Date().toISOString().split("T")[0]}.xlsx`

      // --- INICIO DE CAMBIO: Usar toast.success de sonner ---
      toast.success("Exportación completada", {
        description: `El archivo ${filename} se ha descargado exitosamente.`,
      })
      // --- FIN DE CAMBIO ---

      // In a real implementation, you would trigger the actual download here
      console.log("Downloading file:", filename)
    } catch (error) {
      console.error("Error exporting data:", error)
      // --- INICIO DE CAMBIO: Usar toast.error de sonner ---
      toast.error("Error en la exportación", {
        description: "Hubo un problema al generar el archivo. Por favor intenta nuevamente.",
      })
      // --- FIN DE CAMBIO ---
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Exportación de Datos</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Configurar Exportación</CardTitle>
            <CardDescription>Selecciona los filtros y datos que deseas incluir en el archivo Excel.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4 flex items-center">
                <Filter className="mr-2 h-5 w-5" />
                Filtros
              </h3>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="route-filter">Filtrar por ruta</Label>
                  <Select value={routeFilter} onValueChange={setRouteFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una ruta" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las rutas</SelectItem>
                      <SelectItem value="sendero-bosque">Sendero del Bosque</SelectItem>
                      <SelectItem value="cascada-escondida">Cascada Escondida</SelectItem>
                      <SelectItem value="cumbre-aguila">Cumbre del Águila</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="status-filter">Filtrar por estado</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los estados</SelectItem>
                      <SelectItem value="pending">Pendiente de pago</SelectItem>
                      <SelectItem value="paid">Pagado</SelectItem>
                      <SelectItem value="delivered">Souvenir entregado</SelectItem>
                      <SelectItem value="staff">Personal/Staff</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">Datos a incluir</h3>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox id="personal-data" checked={includePersonalData} onCheckedChange={setIncludePersonalData} />
                  <Label htmlFor="personal-data">Datos personales (nombre, cédula, email, teléfono)</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox id="payment-data" checked={includePaymentData} onCheckedChange={setIncludePaymentData} />
                  <Label htmlFor="payment-data">Datos de pago (estado, código de inscripción, fecha de pago)</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox id="souvenir-data" checked={includeSouvenirData} onCheckedChange={setIncludeSouvenirData} />
                  <Label htmlFor="souvenir-data">Estado de souvenir (entregado/pendiente)</Label>
                </div>
              </div>
            </div>

            <Button onClick={handleExport} disabled={exporting} className="w-full">
              {exporting ? (
                <>
                  <Download className="mr-2 h-4 w-4 animate-spin" />
                  Generando archivo...
                </>
              ) : (
                <>
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Exportar a Excel
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estadísticas de Exportación</CardTitle>
            <CardDescription>Resumen de los datos que se incluirán en la exportación.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">124</p>
                  <p className="text-sm text-gray-600">Total de registros</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">98</p>
                  <p className="text-sm text-gray-600">Pagos confirmados</p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Distribución por ruta:</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Sendero del Bosque:</span>
                    <span>45 personas</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cascada Escondida:</span>
                    <span>32 personas</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cumbre del Águila:</span>
                    <span>25 personas</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Personal/Staff:</span>
                    <span>22 personas</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Estados de pago:</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Pagado:</span>
                    <span>98 personas</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pendiente:</span>
                    <span>26 personas</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Souvenirs:</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Entregados:</span>
                    <span>45 personas</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pendientes:</span>
                    <span>79 personas</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Alert>
        <Calendar className="h-4 w-4" />
        <AlertTitle>Información sobre la exportación</AlertTitle>
        <AlertDescription>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>El archivo Excel incluirá todas las columnas seleccionadas con los datos filtrados.</li>
            <li>Los datos se exportan en tiempo real, reflejando el estado actual de las inscripciones.</li>
            <li>El archivo se nombrará automáticamente con la fecha de exportación.</li>
            <li>Los datos personales están protegidos y solo deben usarse para fines del evento.</li>
          </ul>
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Exportaciones Rápidas</CardTitle>
          <CardDescription>Accesos directos para exportaciones comunes.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
              <div className="flex items-center mb-2">
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                <span className="font-medium">Listado completo</span>
              </div>
              <span className="text-sm text-gray-600">Todos los inscritos con datos completos</span>
            </Button>

            <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
              <div className="flex items-center mb-2">
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                <span className="font-medium">Solo pagados</span>
              </div>
              <span className="text-sm text-gray-600">Personas con pago confirmado</span>
            </Button>

            <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
              <div className="flex items-center mb-2">
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                <span className="font-medium">Pendientes de pago</span>
              </div>
              <span className="text-sm text-gray-600">Personas que aún no han pagado</span>
            </Button>

            <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
              <div className="flex items-center mb-2">
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                <span className="font-medium">Personal del evento</span>
              </div>
              <span className="text-sm text-gray-600">Logística, guías y staff</span>
            </Button>
          </div>
        </CardContent>
      </Card>
      {/* El Toaster de Sonner debe estar en el layout principal de tu aplicación,
          no es necesario repetirlo en cada componente que use 'toast'. */}
    </div>
  )
}