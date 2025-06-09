"use client"

import { useState, useEffect } from "react"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Upload, Trash2, Plus, ImageIcon } from "lucide-react"

// --- INICIO DE CAMBIO: Eliminar la importación de useToast ---
// import { useToast } from "@/hooks/use-toast" // ELIMINAR ESTA LÍNEA
// --- FIN DE CAMBIO ---

import { toast } from "sonner" // <-- Importa la función 'toast' de sonner

// Cambia la importación
import { firebaseClient } from "@/lib/firebase/client"

type GalleryImage = {
  id: number
  url: string
  alt: string
  uploaded_at: string
}

const imageFormSchema = z.object({
  image_file: z.instanceof(FileList).refine((files) => files.length > 0, "Selecciona una imagen"),
  alt_text: z.string().min(3, "La descripción debe tener al menos 3 caracteres"),
})

export default function GalleryManagement() {
  // --- INICIO DE CAMBIO: Eliminar la desestructuración de useToast ---
  // const { toast } = useToast() // ELIMINAR ESTA LÍNEA
  // --- FIN DE CAMBIO ---
  const [images, setImages] = useState<GalleryImage[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null)

  const form = useForm<z.infer<typeof imageFormSchema>>({
    resolver: zodResolver(imageFormSchema),
    defaultValues: {
      alt_text: "",
    },
  })

  useEffect(() => {
    fetchImages()
  }, [])

  // En fetchImages:
  const fetchImages = async () => {
    setLoading(true)
    try {
      const data = await firebaseClient.getGalleryImages()
      setImages(data)
    } catch (error) {
      console.error("Error fetching images:", error)
      // --- INICIO DE CAMBIO: Usar toast.error de sonner ---
      toast.error("Error", {
        description: "No se pudieron cargar las imágenes de la galería.",
      })
      // --- FIN DE CAMBIO ---
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: z.infer<typeof imageFormSchema>) => {
    setUploading(true)

    try {
      // In a real implementation, you would:
      // 1. Upload the image to Supabase Storage
      // 2. Get the public URL
      // 3. Save the image data to the gallery table

      // const file = data.image_file[0];
      // const fileExt = file.name.split('.').pop();
      // const fileName = `${Math.random()}.${fileExt}`;
      // const filePath = `gallery/${fileName}`;

      // const { error: uploadError } = await supabase.storage
      //   .from('images')
      //   .upload(filePath, file);

      // if (uploadError) throw uploadError;

      // const { data: { publicUrl } } = supabase.storage
      //   .from('images')
      //   .getPublicUrl(filePath);

      // const { error: insertError } = await supabase
      //   .from('gallery')
      //   .insert({
      //     url: publicUrl,
      //     alt: data.alt_text,
      //   });

      // if (insertError) throw insertError;

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Mock new image
      // En onSubmit:
      const imageData = {
        url: "/placeholder.svg?height=400&width=600", // En producción, subirías a Firebase Storage
        alt: data.alt_text,
      }

      const newImageId = await firebaseClient.createGalleryImage(imageData)
      const newImage = { id: newImageId, ...imageData, uploaded_at: new Date().toISOString() }
      setImages([newImage, ...images])

      // --- INICIO DE CAMBIO: Usar toast.success de sonner ---
      toast.success("Imagen subida exitosamente", {
        description: "La imagen ha sido agregada a la galería.",
      })
      // --- FIN DE CAMBIO ---

      form.reset()
      setIsAddDialogOpen(false)
    } catch (error) {
      console.error("Error uploading image:", error)
      // --- INICIO DE CAMBIO: Usar toast.error de sonner ---
      toast.error("Error", {
        description: "Hubo un problema al subir la imagen. Por favor intenta nuevamente.",
      })
      // --- FIN DE CAMBIO ---
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedImage) return

    try {
      // In a real implementation, you would:
      // 1. Delete the image from Supabase Storage
      // 2. Delete the record from the gallery table

      // const { error: deleteError } = await supabase
      //   .from('gallery')
      //   .delete()
      //   .eq('id', selectedImage.id);

      // if (deleteError) throw deleteError;

      // Also delete from storage if needed

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      // En handleDelete:
      await firebaseClient.deleteGalleryImage(selectedImage.id)
      setImages(images.filter((img) => img.id !== selectedImage.id))

      // --- INICIO DE CAMBIO: Usar toast.success de sonner ---
      toast.success("Imagen eliminada", {
        description: "La imagen ha sido eliminada de la galería.",
      })
      // --- FIN DE CAMBIO ---

      setIsDeleteDialogOpen(false)
      setSelectedImage(null)
    } catch (error) {
      console.error("Error deleting image:", error)
      // --- INICIO DE CAMBIO: Usar toast.error de sonner ---
      toast.error("Error", {
        description: "Hubo un problema al eliminar la imagen. Por favor intenta nuevamente.",
      })
      // --- FIN DE CAMBIO ---
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestión de Galería</h1>
        <Button
          onClick={() => {
            form.reset()
            setIsAddDialogOpen(true)
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> Agregar Imagen
        </Button>
      </div>

      <Alert>
        <ImageIcon className="h-4 w-4" />
        <AlertTitle>Recomendaciones para las imágenes</AlertTitle>
        <AlertDescription>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Usa imágenes de alta calidad (mínimo 800x600 píxeles)</li>
            <li>Formatos recomendados: JPG, PNG, WebP</li>
            <li>Tamaño máximo: 5MB por imagen</li>
            <li>Incluye descripciones claras para mejorar la accesibilidad</li>
          </ul>
        </AlertDescription>
      </Alert>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="aspect-square bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      ) : images.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No hay imágenes en la galería</h3>
            <p className="text-gray-500 mb-4">Agrega la primera imagen para comenzar a construir tu galería.</p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Agregar primera imagen
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image) => (
            <Card key={image.id} className="overflow-hidden">
              <div className="aspect-square relative">
                <Image src={image.url || "/placeholder.svg"} alt={image.alt} fill className="object-cover" />
              </div>
              <CardContent className="p-3">
                <p className="text-sm line-clamp-2 mb-2">{image.alt}</p>
                <p className="text-xs text-gray-500 mb-3">{new Date(image.uploaded_at).toLocaleDateString()}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-red-600 hover:text-red-700"
                  onClick={() => {
                    setSelectedImage(image)
                    setIsDeleteDialogOpen(true)
                  }}
                >
                  <Trash2 className="mr-2 h-3 w-3" />
                  Eliminar
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Image Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Nueva Imagen</DialogTitle>
            <DialogDescription>Sube una nueva imagen a la galería del evento.</DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="image_file"
                render={({ field: { value, onChange, ...field } }) => (
                  <FormItem>
                    <FormLabel>Seleccionar imagen</FormLabel>
                    <FormControl>
                      <Input type="file" accept="image/*" onChange={(e) => onChange(e.target.files)} {...field} />
                    </FormControl>
                    <FormDescription>Selecciona una imagen en formato JPG, PNG o WebP (máximo 5MB)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="alt_text"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción de la imagen</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej. Grupo de participantes en la cumbre" {...field} />
                    </FormControl>
                    <FormDescription>Describe brevemente lo que se ve en la imagen</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={uploading}>
                  {uploading ? (
                    <>
                      <Upload className="mr-2 h-4 w-4 animate-spin" />
                      Subiendo...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Subir imagen
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar esta imagen? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>

          {selectedImage && (
            <div className="my-4">
              <div className="relative h-32 w-full rounded overflow-hidden">
                <Image
                  src={selectedImage.url || "/placeholder.svg"}
                  alt={selectedImage.alt}
                  fill
                  className="object-cover"
                />
              </div>
              <p className="text-sm text-gray-600 mt-2">{selectedImage.alt}</p>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar imagen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>Estadísticas de la Galería</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{images.length}</p>
              <p className="text-sm text-gray-600">Imágenes totales</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">
                {
                  images.filter((img) => new Date(img.uploaded_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
                    .length
                }
              </p>
              <p className="text-sm text-gray-600">Subidas esta semana</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">~2.5MB</p>
              <p className="text-sm text-gray-600">Tamaño promedio</p>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Recuerda que el componente <Toaster /> de sonner debe estar en el layout principal de tu aplicación (ej. app/layout.tsx)
          para que las notificaciones se muestren correctamente en toda la app.
          No es necesario colocarlo aquí en cada componente que use 'toast'. */}
    </div>
  )
}