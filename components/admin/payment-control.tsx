"use client"

import { useState, useEffect } from "react"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CheckCircle, Upload, Users, User, Trash2, Plus, ImageIcon, X, Edit } from "lucide-react"
import { toast } from "sonner" // <-- CAMBIO CLAVE: Importación de sonner directamente
import { firebaseClient } from "@/lib/firebase/client"

// --- CAMBIO CLAVE: Definición del esquema Zod para payment_image ---
// Cambiamos FileList a z.any() para evitar errores en SSR.
// La validación real de FileList se hará en onSubmit (en el lado del cliente).
const accessCodeFormSchema = z.object({
  document_id: z.string().min(5, "El número de documento es requerido"),
  people_count: z.coerce.number().min(1, "Debe haber al menos 1 persona").max(20, "Máximo 20 personas por grupo"),
  payment_image: z.any().optional(), // <-- CORRECCIÓN AQUÍ: Usamos z.any()
})

type AccessCode = {
  id: string
  document_id: string
  people_count: number
  access_code: string
  is_group: boolean
  payment_images: Array<{
    id: string
    url: string
    uploaded_at: string
  }>
  status: "pending" | "paid" | "used"
  created_at: string
  updated_at: string
}

export default function PaymentControl() {
  // const { toast } = useToast() // <-- REMOVIDO: Ya no se usa el hook de Shadcn UI
  const [accessCodes, setAccessCodes] = useState<AccessCode[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [generatedCode, setGeneratedCode] = useState<string | null>(null)

  // Estados para gestión de imágenes
  const [selectedAccessCode, setSelectedAccessCode] = useState<AccessCode | null>(null)
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [newImageUrl, setNewImageUrl] = useState("")
  const [uploadingImage, setUploadingImage] = useState(false)
  const [editingPeopleCount, setEditingPeopleCount] = useState(1)

  const form = useForm<z.infer<typeof accessCodeFormSchema>>({
    resolver: zodResolver(accessCodeFormSchema),
    defaultValues: {
      document_id: "",
      people_count: 1,
      payment_image: undefined, // Asegúrate de que el valor por defecto sea undefined para campos de archivo
    },
  })

  useEffect(() => {
    fetchAccessCodes()
  }, [])

  const fetchAccessCodes = async () => {
    setLoading(true)
    try {
      const data = await firebaseClient.getAccessCodes()
      setAccessCodes(data)
    } catch (error) {
      console.error("Error fetching access codes:", error)
      toast.error("No se pudieron cargar los códigos de acceso.") // <-- CAMBIO: Usando sonner.toast
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: z.infer<typeof accessCodeFormSchema>) => {
    setSubmitting(true)

    try {
      // Verificar si ya existe un código para este documento
      const existingCode = await firebaseClient.getAccessCodeByDocument(data.document_id)
      if (existingCode) {
        toast.error("Ya existe un código de acceso para este número de documento", { // <-- CAMBIO: Usando sonner.toast
          title: "Código ya existe",
        })
        setSubmitting(false)
        return
      }

      // Crear el código de acceso
      const accessCodeData = {
        document_id: data.document_id,
        people_count: data.people_count,
        payment_images: [],
      }

      // --- CAMBIO CLAVE: Validación de FileList en tiempo de ejecución (cliente) ---
      // Verificamos si data.payment_image es una instancia de FileList y si tiene archivos.
      if (typeof window !== 'undefined' && data.payment_image instanceof FileList && data.payment_image.length > 0) {
        // En producción, aquí subirías la imagen a Firebase Storage
        accessCodeData.payment_images = [
          {
            id: Date.now().toString(),
            url: "/placeholder.svg?height=400&width=600", // URL placeholder
            uploaded_at: new Date().toISOString(),
          },
        ]
      }
      // --- FIN DE CAMBIO CLAVE ---

      const newAccessCode = await firebaseClient.createAccessCode(accessCodeData)
      setAccessCodes([newAccessCode, ...accessCodes])
      setGeneratedCode(newAccessCode.access_code)

      toast.success(`Código generado exitosamente: ${newAccessCode.access_code}`, { // <-- CAMBIO: Usando sonner.toast
        description: "Envía este código a la persona por WhatsApp para que pueda completar su inscripción.",
      })

      form.reset()
    } catch (error) {
      console.error("Error creating access code:", error)
      toast.error("Hubo un problema al generar el código. Por favor intenta nuevamente.", { // <-- CAMBIO: Usando sonner.toast
        title: "Error al generar código",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteAccessCode = async (accessCode: AccessCode) => {
    try {
      await firebaseClient.deleteAccessCode(accessCode.id)
      setAccessCodes(accessCodes.filter((code) => code.id !== accessCode.id))
      toast.success("El código de acceso ha sido eliminado exitosamente", { // <-- CAMBIO: Usando sonner.toast
        title: "Código eliminado",
      })
    } catch (error) {
      console.error("Error deleting access code:", error)
      toast.error("Hubo un problema al eliminar el código", { // <-- CAMBIO: Usando sonner.toast
        title: "Error al eliminar",
      })
    }
  }

  const handleAddPaymentImage = async () => {
    if (!selectedAccessCode || !newImageUrl) {
      toast.error("Por favor ingresa una URL válida para la imagen", { // <-- CAMBIO: Usando sonner.toast
        title: "URL inválida",
      })
      return
    }

    setUploadingImage(true)
    try {
      const newImage = await firebaseClient.addPaymentImageToAccessCode(selectedAccessCode.id, {
        url: newImageUrl,
      })

      // Actualizar el estado local
      const updatedAccessCode = {
        ...selectedAccessCode,
        payment_images: [...selectedAccessCode.payment_images, newImage],
        status: "paid" as const,
      }

      setSelectedAccessCode(updatedAccessCode)
      setAccessCodes(accessCodes.map((code) => (code.id === selectedAccessCode.id ? updatedAccessCode : code)))
      setNewImageUrl("")

      toast.success("La imagen de pago ha sido agregada exitosamente", { // <-- CAMBIO: Usando sonner.toast
        title: "Imagen agregada",
      })
    } catch (error) {
      console.error("Error adding payment image:", error)
      toast.error("Hubo un problema al agregar la imagen", { // <-- CAMBIO: Usando sonner.toast
        title: "Error al agregar imagen",
      })
    } finally {
      setUploadingImage(false)
    }
  }

  const handleRemovePaymentImage = async (imageId: string) => {
    if (!selectedAccessCode) return

    try {
      await firebaseClient.removePaymentImageFromAccessCode(selectedAccessCode.id, imageId)

      // Actualizar el estado local
      const updatedImages = selectedAccessCode.payment_images.filter((img) => img.id !== imageId)
      const updatedAccessCode = {
        ...selectedAccessCode,
        payment_images: updatedImages,
        status: (updatedImages.length > 0 ? "paid" : "pending") as const,
      }

      setSelectedAccessCode(updatedAccessCode)
      setAccessCodes(accessCodes.map((code) => (code.id === selectedAccessCode.id ? updatedAccessCode : code)))

      toast.success("La imagen de pago ha sido eliminada exitosamente", { // <-- CAMBIO: Usando sonner.toast
        title: "Imagen eliminada",
      })
    } catch (error) {
      console.error("Error removing payment image:", error)
      toast.error("Hubo un problema al eliminar la imagen", { // <-- CAMBIO: Usando sonner.toast
        title: "Error al eliminar imagen",
      })
    }
  }

  const handleUpdatePeopleCount = async () => {
    if (!selectedAccessCode) return

    try {
      const updatedData = {
        people_count: editingPeopleCount,
        is_group: editingPeopleCount > 1,
      }

      await firebaseClient.updateAccessCode(selectedAccessCode.id, updatedData)

      // Actualizar el estado local
      const updatedAccessCode = {
        ...selectedAccessCode,
        ...updatedData,
      }

      setSelectedAccessCode(updatedAccessCode)
      setAccessCodes(accessCodes.map((code) => (code.id === selectedAccessCode.id ? updatedAccessCode : code)))
      setIsEditDialogOpen(false)

      toast.success(`Se ha actualizado a ${editingPeopleCount} persona${editingPeopleCount > 1 ? "s" : ""}`, { // <-- CAMBIO: Usando sonner.toast
        title: "Número de personas actualizado",
      })
    } catch (error) {
      console.error("Error updating people count:", error)
      toast.error("Hubo un problema al actualizar el número de personas", { // <-- CAMBIO: Usando sonner.toast
        title: "Error al actualizar",
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="border-yellow-500 text-yellow-500">
            Pendiente
          </Badge>
        )
      case "paid":
        return <Badge className="bg-green-500">Pagado</Badge>
      case "used":
        return <Badge className="bg-blue-500">Usado</Badge>
      default:
        return <Badge variant="outline">Desconocido</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Generación de Códigos de Acceso</h1>

      <Tabs defaultValue="generate" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="generate">Generar Código</TabsTrigger>
          <TabsTrigger value="manage">Gestionar Códigos</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Generar Nuevo Código de Acceso</CardTitle>
              <CardDescription>
                Crea un código único para que las personas puedan completar su inscripción.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="document_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Número de documento</FormLabel>
                          <FormControl>
                            <Input placeholder="Ej. 1234567890" {...field} />
                          </FormControl>
                          <FormDescription>Documento de la persona responsable del pago</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="people_count"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Número de personas</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              max="20"
                              {...field}
                              // Asegúrate de que el valor sea un número cuando se actualiza
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>1 = Individual, 2+ = Grupo (máximo 20 personas)</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="payment_image"
                    render={({ field: { value, onChange, ...field } }) => (
                      <FormItem>
                        <FormLabel>Imagen del comprobante (opcional)</FormLabel>
                        <FormControl>
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => onChange(e.target.files)}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Puedes agregar la imagen ahora o posteriormente desde la gestión de códigos
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" disabled={submitting} className="w-full">
                    {submitting ? (
                      <>
                        <Upload className="mr-2 h-4 w-4 animate-spin" />
                        Generando código...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Generar código de acceso
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
              <AlertTitle>¡Código generado exitosamente!</AlertTitle>
              <AlertDescription>
                Se ha generado el código de acceso: <strong>{generatedCode}</strong>
                <br />
                Envía este código a la persona por WhatsApp para que pueda completar su inscripción.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        <TabsContent value="manage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Códigos de Acceso Generados</CardTitle>
              <CardDescription>
                Gestiona los códigos existentes, agrega imágenes de pago y actualiza información.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Documento</TableHead>
                      <TableHead>Código</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Personas</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Imágenes</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          Cargando códigos...
                        </TableCell>
                      </TableRow>
                    ) : accessCodes.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          No hay códigos de acceso generados.
                        </TableCell>
                      </TableRow>
                    ) : (
                      accessCodes.map((accessCode) => (
                        <TableRow key={accessCode.id}>
                          <TableCell className="font-medium">{accessCode.document_id}</TableCell>
                          <TableCell>
                            <code className="bg-gray-100 px-2 py-1 rounded text-sm">{accessCode.access_code}</code>
                          </TableCell>
                          <TableCell>
                            {accessCode.is_group ? (
                              <Badge variant="outline" className="border-blue-500 text-blue-500">
                                <Users className="h-3 w-3 mr-1" />
                                Grupo
                              </Badge>
                            ) : (
                              <Badge variant="outline">
                                <User className="h-3 w-3 mr-1" />
                                Individual
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>{accessCode.people_count}</TableCell>
                          <TableCell>{getStatusBadge(accessCode.status)}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedAccessCode(accessCode)
                                setIsImageDialogOpen(true)
                              }}
                            >
                              <ImageIcon className="h-4 w-4 mr-1" />
                              {accessCode.payment_images.length} imagen
                              {accessCode.payment_images.length !== 1 ? "es" : ""}
                            </Button>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-1 justify-end">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setSelectedAccessCode(accessCode)
                                  setEditingPeopleCount(accessCode.people_count)
                                  setIsEditDialogOpen(true)
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDeleteAccessCode(accessCode)}>
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog para gestionar imágenes de pago */}
      <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Gestionar Imágenes de Pago - {selectedAccessCode?.access_code}</DialogTitle>
            <DialogDescription>
              {selectedAccessCode?.is_group
                ? "Agrega múltiples imágenes de pago para el grupo"
                : "Agrega la imagen del comprobante de pago"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Agregar nueva imagen */}
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-3">Agregar Nueva Imagen</h4>
              <div className="flex gap-3">
                <Input
                  placeholder="URL de la imagen del comprobante"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleAddPaymentImage} disabled={uploadingImage || !newImageUrl}>
                  {uploadingImage ? (
                    <>
                      <Upload className="mr-2 h-4 w-4 animate-spin" />
                      Agregando...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Agregar
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Imágenes actuales */}
            <div>
              <h4 className="font-medium mb-3">Imágenes de Pago ({selectedAccessCode?.payment_images.length || 0})</h4>
              {selectedAccessCode?.payment_images && selectedAccessCode.payment_images.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {selectedAccessCode.payment_images.map((image) => (
                    <div key={image.id} className="relative group">
                      <div className="aspect-square relative rounded overflow-hidden border">
                        <img
                          src={image.url || "/placeholder.svg"}
                          alt="Comprobante de pago"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder.svg?height=200&width=200"
                          }}
                        />
                      </div>
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
                        <Button variant="destructive" size="sm" onClick={() => handleRemovePaymentImage(image.id)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">{new Date(image.uploaded_at).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
                  <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No hay imágenes de pago</p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog para editar número de personas */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Actualizar Número de Personas</DialogTitle>
            <DialogDescription>
              Modifica el número de personas para el código {selectedAccessCode?.access_code}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Número de personas</label>
              <Input
                type="number"
                min="1"
                max="20"
                value={editingPeopleCount}
                onChange={(e) => setEditingPeopleCount(Number.parseInt(e.target.value) || 1)}
              />
              <p className="text-sm text-gray-500 mt-1">
                {editingPeopleCount === 1 ? "Individual" : `Grupo de ${editingPeopleCount} personas`}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdatePeopleCount}>Actualizar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}