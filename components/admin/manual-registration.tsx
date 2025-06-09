"use client"

import { useState, useEffect } from "react"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { UserPlus, CheckCircle } from "lucide-react"

// --- CAMBIO: Eliminar la importación de useToast ---
// import { useToast } from "@/hooks/use-toast" // ELIMINAR ESTA LÍNEA
// --- FIN DE CAMBIO ---

import { toast } from "sonner" // <-- Importa la función 'toast' de sonner

import { firebaseClient } from "@/lib/firebase/client"

type Route = {
  id: number
  name: string
}

const manualRegistrationSchema = z.object({
  full_name: z.string().min(5, "El nombre completo es requerido"),
  document_id: z.string().min(5, "El número de documento es requerido"),
  email: z.string().email("Correo electrónico inválido").or(z.string().length(0)),
  phone: z.string().min(10, "El teléfono debe tener al menos 10 dígitos").or(z.string().length(0)),
  route_id: z.string().min(1, "Debes seleccionar una ruta"),
  role: z.string().min(1, "Debes seleccionar un rol"),
})

export default function ManualRegistration() {
  // --- CAMBIO: Eliminar la desestructuración de useToast ---
  // const { toast } = useToast() // ELIMINAR ESTA LÍNEA
  // --- FIN DE CAMBIO ---
  const [routes, setRoutes] = useState<Route[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [generatedCode, setGeneratedCode] = useState<string | null>(null)

  const form = useForm<z.infer<typeof manualRegistrationSchema>>({
    resolver: zodResolver(manualRegistrationSchema),
    defaultValues: {
      full_name: "",
      document_id: "",
      email: "",
      phone: "",
      route_id: "",
      role: "",
    },
  })

  useEffect(() => {
    fetchRoutes()
  }, [])

  const fetchRoutes = async () => {
    try {
      const data = await firebaseClient.getRoutes()
      setRoutes(data.map((route) => ({ id: route.id, name: route.name })))
    } catch (error) {
      console.error("Error fetching routes:", error)
      // Opcional: Podrías añadir un toast aquí si quieres notificar al usuario sobre el error al cargar las rutas
      toast.error("Error al cargar rutas", {
        description: "Hubo un problema al obtener las rutas disponibles. Por favor, recarga la página.",
      });
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: z.infer<typeof manualRegistrationSchema>) => {
    setSubmitting(true)
    setGeneratedCode(null); // Limpiar el código anterior al iniciar una nueva submisión

    try {
      // Generate a unique code based on role
      const rolePrefixMap: Record<string, string> = {
        logistica: "LOG",
        guia: "GUIA",
        staff: "STAFF",
      };
      const rolePrefix = rolePrefixMap[data.role] || "STAFF";
      const code = `${rolePrefix}-${Date.now().toString().slice(-4)}`
      setGeneratedCode(code)

      const registrationData = {
        full_name: data.full_name,
        document_id: data.document_id,
        email: data.email || null,
        phone: data.phone || null,
        route_id: data.route_id,
        registration_type: "staff",
        payment_status: "paid",
        souvenir_status: "delivered",
        role: data.role,
        registration_code: code,
      }

      await firebaseClient.createRegistration(registrationData)

      // --- CAMBIO: Usar toast.success de sonner ---
      toast.success("Inscripción manual registrada", {
        description: `Se ha registrado exitosamente a ${data.full_name} con el código: ${code}`,
      })
      // --- FIN DE CAMBIO ---

      form.reset()
    } catch (error) {
      console.error("Error creating manual registration:", error)
      // --- CAMBIO: Usar toast.error de sonner ---
      toast.error("Error", {
        description: "Hubo un problema al registrar la inscripción. Por favor intenta nuevamente.",
      })
      // --- FIN DE CAMBIO ---
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Inscripción Manual</h1>

      <Card>
        <CardHeader>
          <CardTitle>Agregar Personal de Logística/Guías</CardTitle>
          <CardDescription>Registra manualmente a personal de logística, guías o staff del evento.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="full_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombres y apellidos</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej. María García López" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="document_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número de cédula</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej. 1234567890" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Correo electrónico (opcional)</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Ej. maria@ejemplo.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teléfono (opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej. 3001234567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="route_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ruta asignada</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={loading}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona una ruta" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {routes.map((route) => (
                            <SelectItem key={route.id} value={route.id.toString()}>
                              {route.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>Ruta donde estará asignado el personal</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rol</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un rol" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="logistica">Logística</SelectItem>
                          <SelectItem value="guia">Guía</SelectItem>
                          <SelectItem value="staff">Staff General</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>Función que desempeñará en el evento</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? (
                  <>
                    <UserPlus className="mr-2 h-4 w-4 animate-spin" />
                    Registrando...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Registrar inscripción manual
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {generatedCode && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>¡Inscripción registrada exitosamente!</AlertTitle>
          <AlertDescription>
            Se ha generado el código de identificación: <strong>{generatedCode}</strong>
            <br />
            Esta persona aparecerá identificada como personal en el listado de participantes.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Información importante</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
            <li>El personal registrado manualmente aparecerá identificado como tal en todos los listados.</li>
            <li>No requieren realizar pago ya que son parte del equipo organizador.</li>
            <li>Recibirán automáticamente el estado de "pagado" y "souvenir entregado".</li>
            <li>
              Los códigos generados siguen el formato: LOG-XXXX (Logística), GUIA-XXXX (Guías), STAFF-XXXX (Staff
              General).
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}