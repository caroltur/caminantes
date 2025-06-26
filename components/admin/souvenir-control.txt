"use client"

import { useState } from "react"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Package, CheckCircle, Search } from "lucide-react"

// --- INICIO DE CAMBIO: Eliminar la importación de useToast ---
// import { useToast } from "@/hooks/use-toast" // ELIMINAR ESTA LÍNEA
// --- FIN DE CAMBIO ---

import { toast } from "sonner" // --- AÑADIR/MANTENER ESTA LÍNEA para usar la función `toast` de Sonner ---
import { Toaster } from "@/components/ui/sonner"; // Asegúrate de que el Toaster esté renderizado en el layout principal

import { firebaseClient } from "@/lib/firebase/client"

const souvenirFormSchema = z.object({
  document_id: z.string().min(5, "El número de documento es requerido"),
})

type Person = {
  id: number
  full_name: string
  document_id: string
  route_name: string
  registration_code: string
  souvenir_status: "pending" | "delivered"
  payment_status?: "pending" | "paid"
}

export default function SouvenirControl() {
  // --- INICIO DE CAMBIO: Eliminar la desestructuración de useToast ---
  // const { toast } = useToast() // ELIMINAR ESTA LÍNEA
  // --- FIN DE CAMBIO ---
  const [submitting, setSubmitting] = useState(false)
  const [searchResult, setSearchResult] = useState<Person | null>(null)
  const [recentDeliveries, setRecentDeliveries] = useState<Person[]>([])

  const form = useForm<z.infer<typeof souvenirFormSchema>>({
    resolver: zodResolver(souvenirFormSchema),
    defaultValues: {
      document_id: "",
    },
  })

  const onSubmit = async (data: z.infer<typeof souvenirFormSchema>) => {
    setSubmitting(true)

    try {
      const registration = await firebaseClient.getRegistrationByDocument(data.document_id)

      if (registration && registration.payment_status === "paid") {
        await firebaseClient.updateRegistration(registration.id, {
          souvenir_status: "delivered",
        })

        const updatedPerson = { ...registration, souvenir_status: "delivered" }
        setSearchResult(updatedPerson)
        setRecentDeliveries((prev) => [updatedPerson, ...prev.slice(0, 4)])

        // --- INICIO DE CAMBIO: Usar toast.success de sonner ---
        toast.success("Souvenir entregado", {
          description: `Souvenir marcado como entregado para ${updatedPerson.full_name}`,
        })
        // --- FIN DE CAMBIO ---

      } else if (registration && registration.payment_status === "pending") {
        setSearchResult(registration)

        // --- INICIO DE CAMBIO: Usar toast.warning o toast.error de sonner ---
        toast.warning("Pago pendiente", {
          description: "Esta persona aún no ha confirmado su pago.",
        })
        // --- FIN DE CAMBIO ---

      } else {
        setSearchResult(null)
        // --- INICIO DE CAMBIO: Usar toast.error de sonner ---
        toast.error("Persona no encontrada", {
          description: "No se encontró ninguna inscripción con ese número de documento.",
        })
        // --- FIN DE CAMBIO ---
      }

      form.reset()
    } catch (error) {
      console.error("Error updating souvenir status:", error)
      // --- INICIO DE CAMBIO: Usar toast.error de sonner ---
      toast.error("Error", {
        description: "Hubo un problema al actualizar el estado del souvenir. Por favor intenta nuevamente.",
      })
      // --- FIN DE CAMBIO ---
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Control de Souvenirs</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Marcar Souvenir como Entregado</CardTitle>
            <CardDescription>Ingresa el número de documento para marcar el souvenir como entregado.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="document_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número de documento</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej. 1234567890" {...field} />
                      </FormControl>
                      <FormDescription>Documento de la persona que recibe el souvenir</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" disabled={submitting} className="w-full">
                  {submitting ? (
                    <>
                      <Search className="mr-2 h-4 w-4 animate-spin" />
                      Buscando...
                    </>
                  ) : (
                    <>
                      <Package className="mr-2 h-4 w-4" />
                      Marcar como entregado
                    </>
                  )}
                </Button>
              </form>
            </Form>

            {searchResult && (
              <div className="mt-6 p-4 border rounded-lg">
                <h3 className="font-medium mb-2">Resultado de búsqueda</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Nombre:</span>
                    <span>{searchResult.full_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Documento:</span>
                    <span>{searchResult.document_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Ruta:</span>
                    <span>{searchResult.route_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Código:</span>
                    <span>{searchResult.registration_code || "Sin código (pago pendiente)"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Estado del souvenir:</span>
                    <Badge className={searchResult.souvenir_status === "delivered" ? "bg-green-500" : "bg-yellow-500"}>
                      {searchResult.souvenir_status === "delivered" ? "Entregado" : "Pendiente"}
                    </Badge>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Entregas Recientes</CardTitle>
            <CardDescription>Últimos souvenirs marcados como entregados.</CardDescription>
          </CardHeader>
          <CardContent>
            {recentDeliveries.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No hay entregas recientes.</p>
            ) : (
              <div className="space-y-3">
                {recentDeliveries.map((person, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200"
                  >
                    <div>
                      <p className="font-medium">{person.full_name}</p>
                      <p className="text-sm text-gray-500">{person.document_id}</p>
                    </div>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Estadísticas de Souvenirs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">124</p>
              <p className="text-sm text-gray-600">Total de inscritos</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">45</p>
              <p className="text-sm text-gray-600">Souvenirs entregados</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <p className="text-2xl font-bold text-yellow-600">79</p>
              <p className="text-sm text-gray-600">Pendientes de entrega</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Alert>
        <Package className="h-4 w-4" />
        <AlertTitle>Instrucciones para el control de souvenirs</AlertTitle>
        <AlertDescription>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Solo se pueden entregar souvenirs a personas que hayan confirmado su pago.</li>
            <li>Verifica siempre el número de documento antes de marcar como entregado.</li>
            <li>Una vez marcado como entregado, el estado no se puede revertir desde esta interfaz.</li>
            <li>Las personas con rol de staff aparecerán automáticamente como "entregado".</li>
          </ul>
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Datos de prueba</CardTitle>
          <CardDescription>Para probar la funcionalidad, usa estos números de documento:</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Documento</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>1234567890</TableCell>
                <TableCell>Juan Pérez</TableCell>
                <TableCell>Pago confirmado - Puede recibir souvenir</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>0987654321</TableCell>
                <TableCell>María López</TableCell>
                <TableCell>Pago pendiente - No puede recibir souvenir</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>5555555555</TableCell>
                <TableCell>-</TableCell>
                <TableCell>No encontrado</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {/* Es importante que el Toaster de Sonner esté renderizado en el layout principal de tu aplicación */}
      {/* Si este componente es una página de nivel superior o solo aquí necesitas toasts, puedes dejarlo aquí. */}
      <Toaster />
    </div>
  )
}