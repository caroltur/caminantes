"use client"

import { useState, useEffect } from "react"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Settings, DollarSign, CheckCircle, Info } from "lucide-react"

// --- CAMBIO: Eliminar la importación de useToast ---
// import { useToast } from "@/hooks/use-toast" // ELIMINAR ESTA LÍNEA
// --- FIN DE CAMBIO ---

import { toast } from "sonner" // <-- Importa la función 'toast' de sonner

// Cambia la importación
import { firebaseClient } from "@/lib/firebase/client"

const priceSettingsSchema = z.object({
  registration_price: z.coerce.number().min(1000, "El precio debe ser mayor a $1,000"),
  bank_name: z.string().min(3, "El nombre del banco es requerido"),
  account_type: z.string().min(3, "El tipo de cuenta es requerido"),
  account_number: z.string().min(5, "El número de cuenta es requerido"),
  account_holder: z.string().min(5, "El titular de la cuenta es requerido"),
  nit: z.string().min(5, "El NIT es requerido"),
  whatsapp_number: z.string().min(10, "El número de WhatsApp es requerido"),
  payment_instructions: z.string().min(10, "Las instrucciones de pago son requeridas"),
})

type PriceSettings = {
  registration_price: number
  bank_name: string
  account_type: string
  account_number: string
  account_holder: string
  nit: string
  whatsapp_number: string
  payment_instructions: string
  updated_at?: string; // Propiedad opcional para la fecha de actualización
}


export default function PriceSettings() {
  // --- CAMBIO: Eliminar la desestructuración de useToast ---
  // const { toast } = useToast() // ELIMINAR ESTA LÍNEA
  // --- FIN DE CAMBIO ---
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const [cuposTotales, setCuposTotales] = useState(0)

  const form = useForm<z.infer<typeof priceSettingsSchema>>({
    resolver: zodResolver(priceSettingsSchema),
    defaultValues: {
      registration_price: 50000,
      bank_name: "",
      account_type: "",
      account_number: "",
      account_holder: "",
      nit: "",
      whatsapp_number: "",
      payment_instructions: "",
    },
  })

  useEffect(() => {
    const loadData = async () => {
      
      try {
        const codesList = await firebaseClient.getAccessCodes()
        const totalSpotss = codesList          
          .reduce((acc, code) => acc + code.people_count, 0)
          setCuposTotales(totalSpotss)
      } catch (error) {
        console.error("Error loading data:", error)
      }
    }
    loadData()
    fetchSettings()

  }, [])

  // En fetchSettings:
  const fetchSettings = async () => {
    setLoading(true)
    try {
      const data: PriceSettings = await firebaseClient.getSettings() // Asegúrate de que firebaseClient.getSettings devuelve el tipo correcto
      form.reset(data)
      setLastUpdated(data.updated_at ? new Date(data.updated_at).toLocaleString() : new Date().toLocaleString())
    } catch (error) {
      console.error("Error fetching settings:", error)
      // --- CAMBIO: Usar toast.error de sonner ---
      toast.error("Error", {
        description: "No se pudieron cargar las configuraciones. Se usarán valores por defecto.",
      })
      // --- FIN DE CAMBIO ---
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: z.infer<typeof priceSettingsSchema>) => {
    setSubmitting(true)

    try {
      // En onSubmit:
      await firebaseClient.updateSettings(data)
      const now = new Date().toLocaleString();
      setLastUpdated(now)

      // --- CAMBIO: Usar toast.success de sonner ---
      toast.success("Configuración actualizada", {
        description: `Los precios y datos bancarios han sido actualizados exitosamente. (${now})`,
      })
      // --- FIN DE CAMBIO ---
    } catch (error) {
      console.error("Error updating settings:", error)
      // --- CAMBIO: Usar toast.error de sonner ---
      toast.error("Error", {
        description: "Hubo un problema al actualizar la configuración. Por favor intenta nuevamente.",
      })
      // --- FIN DE CAMBIO ---
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Configuración de Precios</h1>
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Configuración de Precios</h1>
        {lastUpdated && <p className="text-sm text-gray-500">Última actualización: {lastUpdated}</p>}
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Información importante</AlertTitle>
        <AlertDescription>
          Los cambios en esta configuración se reflejarán inmediatamente en el sitio público. Asegúrate de que todos los
          datos sean correctos antes de guardar.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="mr-2 h-5 w-5" />
                Configuración General
              </CardTitle>
              <CardDescription>Actualiza los precios y datos bancarios del evento.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="registration_price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Precio de inscripción (COP)</FormLabel>
                        <FormControl>
                          <Input type="number" min="1000" step="1000" {...field} />
                        </FormControl>
                        <FormDescription>Precio por persona en pesos colombianos</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="bank_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre del banco</FormLabel>
                          <FormControl>
                            <Input placeholder="Ej. Banco Nacional" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="account_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo de cuenta</FormLabel>
                          <FormControl>
                            <Input placeholder="Ej. Ahorros" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="account_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número de cuenta</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej. 123-456789-0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="account_holder"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Titular de la cuenta</FormLabel>
                          <FormControl>
                            <Input placeholder="Ej. Evento Caminera S.A.S." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="nit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>NIT</FormLabel>
                          <FormControl>
                            <Input placeholder="Ej. 900.123.456-7" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="whatsapp_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número de WhatsApp</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej. +57 300 123 4567" {...field} />
                        </FormControl>
                        <FormDescription>Número donde los participantes enviarán los comprobantes</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="payment_instructions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Instrucciones de pago</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Instrucciones detalladas para el proceso de pago..."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Instrucciones que verán los participantes sobre cómo enviar el comprobante
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" disabled={submitting} className="w-full">
                    {submitting ? (
                      <>
                        <Settings className="mr-2 h-4 w-4 animate-spin" />
                        Guardando cambios...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Guardar configuración
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="mr-2 h-5 w-5" />
                Vista Previa
              </CardTitle>
              <CardDescription>Así se verá la información en el sitio público</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-1">Valor de la inscripción:</h3>
                  <p className="text-2xl font-bold text-green-700">
                    ${form.watch("registration_price")?.toLocaleString()} COP
                  </p>
                  <p className="text-sm text-gray-500">Por persona</p>
                </div>

                <div>
                  <h3 className="font-medium mb-1">Datos bancarios:</h3>
                  <ul className="space-y-1 text-sm">
                    <li>
                      <span className="font-medium">Banco:</span> {form.watch("bank_name") || "No configurado"}
                    </li>
                    <li>
                      <span className="font-medium">Tipo de cuenta:</span>{" "}
                      {form.watch("account_type") || "No configurado"}
                    </li>
                    <li>
                      <span className="font-medium">Número:</span> {form.watch("account_number") || "No configurado"}
                    </li>
                    <li>
                      <span className="font-medium">Titular:</span> {form.watch("account_holder") || "No configurado"}
                    </li>
                    <li>
                      <span className="font-medium">NIT:</span> {form.watch("nit") || "No configurado"}
                    </li>
                  </ul>
                </div>

                <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                  <h3 className="font-medium mb-1">Envío de comprobante:</h3>
                  <p className="text-sm">{form.watch("payment_instructions") || "No configurado"}</p>
                  <p className="text-sm mt-2">
                    <span className="font-bold">WhatsApp:</span> {form.watch("whatsapp_number") || "No configurado"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Estadísticas de Ingresos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Pagos confirmados:</span>
                  <span className="font-medium">{cuposTotales}</span>
                </div>
                <div className="flex justify-between">
                  <span>Ingresos totales:</span>
                  <span className="font-bold text-green-600">
                    ${(cuposTotales * (form.watch("registration_price") || 0)).toLocaleString()} COP
                  </span>
                </div>
                
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      {/* Recuerda que el componente <Toaster /> de sonner debe estar en el layout principal de tu aplicación (ej. app/layout.tsx)
          para que las notificaciones se muestren correctamente en toda la app.
          No es necesario colocarlo aquí en cada componente que use 'toast'. */}
    </div>
  )
}