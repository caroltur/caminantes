"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { firebaseClient } from "@/lib/firebase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { toast } from "sonner"
import { Loader2, CheckCircle, AlertCircle } from "lucide-react"

const inscriptionSchema = z.object({
  document_id: z.string().min(5, "El número de documento es requerido"),
  confirmation_code: z.string().min(3, "El código de confirmación es requerido"),
  route_id: z.string().min(1, "Debes seleccionar una ruta"),
  day: z.string().min(1, "Debes seleccionar un día"),
})

type Route = {
  id: string
  name: string
  available_spots_by_day: { day: number; spots: number }[]
}

export default function InscripcionPage() {
  const [routes, setRoutes] = useState<Route[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingRoutes, setLoadingRoutes] = useState(true)
  const [verificationStep, setVerificationStep] = useState<"verify" | "select" | "success">("verify")
  const [verifiedAccessCode, setVerifiedAccessCode] = useState<any>(null)
  const router = useRouter()

  const form = useForm<z.infer<typeof inscriptionSchema>>({
    resolver: zodResolver(inscriptionSchema),
    defaultValues: {
      document_id: "",
      confirmation_code: "",
      route_id: "",
      day: "",
    },
  })

  useEffect(() => {
    fetchRoutes()
  }, [])

  const fetchRoutes = async () => {
    try {
      const routesData = await firebaseClient.getRoutes()

      // Calcular cupos disponibles para cada ruta
      const routesWithAvailability = await Promise.all(
        routesData.map(async (route) => {
          const registeredByDay = await firebaseClient.getAvailableSpotsByRoute(route.id)

          const availableSpotsByDay = route.available_spots_by_day.map((daySpot) => ({
            day: daySpot.day,
            spots: Math.max(0, daySpot.spots - (registeredByDay[daySpot.day] || 0)),
          }))

          return {
            ...route,
            available_spots_by_day: availableSpotsByDay,
          }
        }),
      )

      setRoutes(routesWithAvailability)
    } catch (error) {
      console.error("Error fetching routes:", error)
      toast.error("Error al cargar las rutas")
    } finally {
      setLoadingRoutes(false)
    }
  }

  const handleVerification = async () => {
    const documentId = form.getValues("document_id")
    const confirmationCode = form.getValues("confirmation_code")

    if (!documentId || !confirmationCode) {
      toast.error("Por favor completa todos los campos")
      return
    }

    setLoading(true)

    try {
      // Verificar si existe un código de acceso con este documento y código
      const accessCode = await firebaseClient.getAccessCodeByCode(confirmationCode)

      if (accessCode && accessCode.document_id === documentId && accessCode.status === "paid") {
        setVerifiedAccessCode(accessCode)
        setVerificationStep("select")
        toast.success("Código verificado correctamente")
      } else if (accessCode && accessCode.document_id !== documentId) {
        toast.error("El número de documento no coincide con el código")
      } else if (accessCode && accessCode.status !== "paid") {
        toast.error("El código no tiene un pago confirmado")
      } else {
        toast.error("Código de confirmación inválido o no encontrado")
      }
    } catch (error) {
      console.error("Error verifying access code:", error)
      toast.error("Error al verificar el código")
    } finally {
      setLoading(false)
    }
  }

  const handleInscription = async (data: z.infer<typeof inscriptionSchema>) => {
    setLoading(true)

    try {
      // Crear la inscripción
      const registrationData = {
        document_id: data.document_id,
        route_id: data.route_id,
        day: Number.parseInt(data.day),
        access_code: data.confirmation_code,
        people_count: verifiedAccessCode.people_count,
        is_group: verifiedAccessCode.is_group,
        payment_status: "paid",
        registration_type: verifiedAccessCode.is_group ? "group_leader" : "individual",
        created_at: new Date().toISOString(),
      }

      await firebaseClient.createRegistration(registrationData)

      // Marcar el código de acceso como usado
      await firebaseClient.updateAccessCode(verifiedAccessCode.id, {
        status: "used",
        route_id: data.route_id,
        day: Number.parseInt(data.day),
      })

      setVerificationStep("success")
      toast.success("¡Inscripción completada exitosamente!")
    } catch (error) {
      console.error("Error completing inscription:", error)
      toast.error("Error al completar la inscripción")
    } finally {
      setLoading(false)
    }
  }

  const selectedRoute = routes.find((route) => route.id === form.watch("route_id"))
  const availableDays = selectedRoute?.available_spots_by_day.filter((day) => day.spots > 0) || []

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Completar Inscripción</h1>
            <p className="text-gray-600">
              {verificationStep === "verify" && "Verifica tu código de confirmación para continuar"}
              {verificationStep === "select" && "Selecciona tu ruta y día preferido"}
              {verificationStep === "success" && "¡Tu inscripción ha sido completada!"}
            </p>
          </div>

          {verificationStep === "verify" && (
            <Card>
              <CardHeader>
                <CardTitle>Verificación de Código de Acceso</CardTitle>
                <CardDescription>
                  Ingresa tu número de documento y el código de acceso que recibiste por WhatsApp
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="document_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Número de Documento</FormLabel>
                          <FormControl>
                            <Input placeholder="Ej. 1234567890" {...field} />
                          </FormControl>
                          <FormDescription>El mismo documento usado para generar el código</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="confirmation_code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Código de Acceso</FormLabel>
                          <FormControl>
                            <Input placeholder="Ej. IND-123456 o GRP-123456" {...field} />
                          </FormControl>
                          <FormDescription>El código que recibiste por WhatsApp después del pago</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button onClick={handleVerification} disabled={loading} className="w-full">
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Verificar Código
                    </Button>
                  </div>
                </Form>
              </CardContent>
            </Card>
          )}

          {verificationStep === "select" && (
            <Card>
              <CardHeader>
                <CardTitle>Seleccionar Ruta y Día</CardTitle>
                <CardDescription>Elige la ruta y el día en que deseas participar</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleInscription)} className="space-y-6">
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertTitle>Código Verificado</AlertTitle>
                      <AlertDescription>
                        Tu código de acceso ha sido verificado.
                        {verifiedAccessCode?.is_group && (
                          <span className="block mt-1">
                            <strong>Grupo de {verifiedAccessCode.people_count} personas</strong> - Eres el líder del
                            grupo.
                          </span>
                        )}
                      </AlertDescription>
                    </Alert>

                    <FormField
                      control={form.control}
                      name="route_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ruta</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona una ruta" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {routes.map((route) => (
                                <SelectItem key={route.id} value={route.id}>
                                  {route.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {selectedRoute && (
                      <FormField
                        control={form.control}
                        name="day"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Día</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecciona un día" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {availableDays.map((daySpot) => (
                                  <SelectItem key={daySpot.day} value={daySpot.day.toString()}>
                                    Día {daySpot.day} ({daySpot.spots} cupos disponibles)
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription>Solo se muestran los días con cupos disponibles</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {availableDays.length === 0 && selectedRoute && (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Sin Cupos Disponibles</AlertTitle>
                        <AlertDescription>
                          Esta ruta no tiene cupos disponibles. Por favor selecciona otra ruta.
                        </AlertDescription>
                      </Alert>
                    )}

                    <Button type="submit" disabled={loading || availableDays.length === 0} className="w-full">
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Completar Inscripción
                      {verifiedAccessCode?.is_group && ` (${verifiedAccessCode.people_count} personas)`}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}

          {verificationStep === "success" && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Inscripción Completada!</h2>
                  <p className="text-gray-600 mb-6">
                    Tu inscripción ha sido procesada exitosamente.
                    {verifiedAccessCode?.is_group && (
                      <span className="block mt-2">
                        <strong>Grupo de {verifiedAccessCode.people_count} personas registrado.</strong>
                      </span>
                    )}
                  </p>
                  <div className="space-y-2">
                    <Button onClick={() => router.push("/")} className="w-full">
                      Volver al Inicio
                    </Button>
                    <Button variant="outline" onClick={() => router.push("/rutas")} className="w-full">
                      Ver Otras Rutas
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
