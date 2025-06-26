"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { firebaseClient } from "@/lib/firebase/client"
import { Loader2 } from "lucide-react" // Asegúrate de importar Loader2 si lo usas

// ✅ INTERFAZ WALKER CORREGIDA
interface Walker {
  id: string // ← ID único de Firebase
  full_name: string
  document_type: "cedula" | "tarjeta_identidad" | "pasaporte" | "otro"
  document_id: string
  phone: string
  rh: string
  route_id_day1?: string
  route_id_day2?: string
  registration_type?: "group_leader" | "group_member" | "individual"
  group_id: string; // ✅ Añadido: Siempre presente una vez creado/actualizado
  updated_at?: string; // ✅ Añadido: Opcional, solo para actualizaciones
  created_at?: string; // ✅ Añadido: Opcional, solo para creaciones
}


// Esquema del formulario de caminante (no necesita group_id, updated_at, created_at ya que se gestionan en el código)
const walkerSchema = z.object({
  full_name: z.string().min(3, "Nombre requerido"),
  document_type: z.enum(["cedula", "tarjeta_identidad", "pasaporte", "otro"], {
    errorMap: () => ({ message: "Tipo de documento requerido" }),
  }),
  document_id: z.string().min(5, "Cédula requerida"),
  phone: z.string().min(7, "Teléfono requerido"),
  rh: z.string().min(1, "RH requerido"),
  route_id_day1: z.string().optional(),
  route_id_day2: z.string().optional(),
})

export default function GroupDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [walkers, setWalkers] = useState<Walker[]>([])
  const [group, setGroup] = useState<any>(null) // Considera tipar 'group' si conoces su estructura
  const [routes, setRoutes] = useState<{ id: string; name: string }[]>([])
  const [openModal, setOpenModal] = useState(false)
  //const [editingIndex] = useState<number | null>(null) // Este state no se usa para el index, sino editingDocumentId
  const [editingDocumentId, setEditingDocumentId] = useState<string | null>(null)
  const [isGroupLeader, setIsGroupLeader] = useState(false)
  const [loading, setLoading] = useState(true)

  const form = useForm<z.infer<typeof walkerSchema>>({
    resolver: zodResolver(walkerSchema),
    defaultValues: {
      full_name: "",
      document_type: "cedula",
      document_id: "",
      phone: "",
      rh: "",
      route_id_day1: "",
      route_id_day2: "",
    },
  })

  // Cargar grupo y caminantes
  useEffect(() => {
    const loadGroupAndMembers = async () => {
      if (!params.grupo_id) return

      try {
        const groupData = await firebaseClient.getGroupById(params.grupo_id as string)
        const membersData = await firebaseClient.getRegistrationsByGroupId(
          params.grupo_id as string
        )

        setGroup(groupData)
        // Asegúrate de que los datos de membersData también cumplan con la interfaz Walker
        // Si no vienen con group_id, updated_at, created_at, deberías añadirlos aquí si es necesario
        setWalkers(membersData as Walker[]) // ✅ Type cast si estás seguro de que cumplen la interfaz extendida
      } catch (error) {
        console.error("Error cargando grupo:", error)
        toast.error("No se pudo cargar el grupo")
        router.push("/rutas")
      } finally {
        setLoading(false)
      }
    }

    loadGroupAndMembers()
  }, [params.grupo_id, router]) // Añade router a las dependencias del useEffect

  // Cargar rutas
  useEffect(() => {
    const loadRoutes = async () => {
      try {
        const routesList = await firebaseClient.getRoutes()
        setRoutes(routesList)
      } catch (error) {
        toast.error("Error al cargar las rutas")
      }
    }

    loadRoutes()
  }, [])
  
  const getRouteName = (routeId: string | undefined): string => {
    if (!routeId) return "-"
    const route = routes.find((r) => r.id === routeId)
    return route?.name || "Ruta desconocida"
  }
  
  // Abrir modal para nuevo o edición
  const handleOpenModal = (documentId: string | null = null) => {
    if (documentId) {
      const walkerToEdit = walkers.find((w) => w.document_id === documentId)

      if (walkerToEdit) {
        form.reset(walkerToEdit)
        setEditingDocumentId(documentId)
        setIsGroupLeader(walkerToEdit.registration_type === "group_leader")
      }
    } else {
      form.reset({
        full_name: "",
        document_type: "cedula",
        document_id: "",
        phone: "",
        rh: "",
        route_id_day1: "",
        route_id_day2: "",
      })
      setEditingDocumentId(null)
      setIsGroupLeader(false); // Resetear también para nuevo caminante
    }
    setOpenModal(true)
  }
  
  // Guardar caminante
  const handleSaveWalker = async (formData: z.infer<typeof walkerSchema>) => {
    setLoading(true)
    try {
      const documentId = formData.document_id
      
      if (!documentId) {
        toast.error("El número de documento es requerido")
        return
      }
      
      let finalWalkerData: Walker; // Declara una variable para el objeto final
      
      // Si estamos editando...
      if (editingDocumentId !== null) {
        
        const isLeader = walkers.some(
          (w) => w.document_id === editingDocumentId && w.registration_type === "group_leader"
        )
        console.log("Editando caminante: " + isLeader + ", editingDocumentId: " + editingDocumentId)
        
        // Creamos el objeto updatedData con el tipo Walker
        const updatedData: Walker = isLeader
          ? {
              id: editingDocumentId, // El ID de Firebase, no document_id
              ...formData,
              document_id: documentId, // Asegurarse que document_id es el del formulario
              group_id: group.id,
              registration_type: "group_leader", // 👈 Mantenemos el tipo de registro
              updated_at: new Date().toISOString(),
            }
          : {
              id: editingDocumentId, // El ID de Firebase
              ...formData,
              document_id: documentId, // Asegurarse que document_id es el del formulario
              group_id: group.id,
              registration_type: "group_member",
              updated_at: new Date().toISOString(),
            }
        
        //finalWalkerData = updatedData;

        // Guardar en Firebase
        await firebaseClient.updateRegistration(editingDocumentId, updatedData) // updateRegistration debería recibir el ID de Firebase y los datos
        
        // Actualizar estado local
        setWalkers(
          walkers.map((w) =>
            w.id === editingDocumentId
              ? {
                  ...w,
                  ...updatedData, // ✅ Ya no es necesario 'id: w.id' aquí
                }
              : w
          )
        )
        
        toast.success("Datos actualizados correctamente")
        
      } else {
        console.log("Agregando nuevo caminante:")
        // Validar límite del grupo
        //const totalMembers = walkers.filter(w => w.registration_type === "group_member").length
        //const leaderExists = walkers.some(w => w.registration_type === "group_leader")
        
        // El líder cuenta como un miembro para el total
        const currentTotalParticipants = walkers.length; 

        if (currentTotalParticipants >= group?.member_count) {
          toast.warning("No puedes agregar más caminantes. Grupo completo.")
          setLoading(false) // Desactiva el loading si no se agrega
          return
        }
        
        // Obtener un nuevo ID de Firebase antes de crear la registration
        
        // Agregar nuevo caminante
        const newWalkerDataWithoutId: Omit<Walker, 'id'> = { // Usamos Omit para decir que 'id' no está aquí inicialmente
          ...formData,
          document_id: documentId,
          group_id: group.id,
          registration_type: "group_member", // Los nuevos siempre son miembros
          created_at: new Date().toISOString(),
        }
        

        const generatedId = await firebaseClient.createRegistration(newWalkerDataWithoutId) // createRegistration debería recibir el ID y los datos
        const newWalker: Walker = {
          id: generatedId,
          ...newWalkerDataWithoutId
      };
        setWalkers([...walkers, newWalker])
        toast.success("Caminante agregado exitosamente")
      }
      
      setOpenModal(false)
    } catch (error) {
      console.error("Error guardando caminante:", error)
      toast.error("Hubo un problema al guardar los datos")
    } finally {
      setLoading(false)
    }
    // Considera si realmente necesitas recargar toda la página.
    // Si el estado local se actualiza correctamente, `window.location.reload()` puede ser excesivo.
    // window.location.reload() 
  }

  // Lógica de eliminación (ajustar para usar ID de Firebase si `walker.id` es el ID de Firebase)
  // Actualmente usa walker.id que debería ser el ID de Firebase.
  // La línea `const updated = walkers.filter((_, i) => i !== index)` no es ideal si usas IDs únicos.
  // Es mejor filtrar por `w.id !== walker.id`.
  const handleDeleteWalker = async (walkerToDelete: Walker, index: number) => {
    if (confirm("¿Seguro que deseas eliminar este caminante?")) {
      try {
        await firebaseClient.deleteRegistration(walkerToDelete.id); // Asegura que `walker.id` sea el ID de Firebase
        setWalkers(walkers.filter((w) => w.id !== walkerToDelete.id)); // Filtra por el ID único
        toast.success("Caminante eliminado");
      } catch (error) {
        console.error("Error eliminando caminante:", error);
        toast.error("Hubo un problema al eliminar el caminante");
      }
    }
  };


  if (loading) {
    return <p>Cargando...</p>
  }

  // Ordenar para que el líder esté primero
  const sortedWalkers = [...walkers].sort((a, b) => {
    if (a.registration_type === "group_leader" && b.registration_type !== "group_leader") return -1
    if (b.registration_type === "group_leader" && a.registration_type !== "group_leader") return 1
    return 0
  })

  const totalRegistered = sortedWalkers.length
  const availableSlots = group?.member_count ? group.member_count - totalRegistered : 0

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="container mx-auto px-4 mb-8">
        <Button
          onClick={() => router.push("/")}
          variant="outline"
          className="w-full md:w-auto border-2 border-green-600 text-green-600 hover:bg-green-50 shadow-md font-semibold"
        >
          ← Volver al Inicio
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{group?.group_name || "Grupo"}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Caminantes del Grupo</h2>
            
            {availableSlots > 0 && (
              <Button onClick={() => handleOpenModal()}>
                + Agregar Caminante ({availableSlots} cupo{availableSlots > 1 ? "s" : ""} restante{availableSlots > 1 ? "s" : ""})
              </Button>
            )}
            {availableSlots <= 0 && (
              <p className="text-gray-500 italic">✅ Grupo completo</p>
            )}
          </div>

          {/* Tabla */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Número de Documento</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>RH</TableHead>
                <TableHead>Ruta Día 1</TableHead>
                <TableHead>Ruta Día 2</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedWalkers.map((walker, index) => (
                <TableRow
                  key={walker.id}
                  className={walker.registration_type === "group_leader" ? "bg-green-200 hover:bg-gray-200" : "hover:bg-gray-200"}
                >
                  <TableCell>{walker.full_name}</TableCell>
                  <TableCell>{walker.document_id}</TableCell>
                  <TableCell>{walker.phone}</TableCell>
                  <TableCell>{walker.rh}</TableCell>
                  <TableCell>{getRouteName(walker.route_id_day1)}</TableCell>
                  <TableCell>{getRouteName(walker.route_id_day2)}</TableCell>
                  <TableCell className="flex gap-2">
                    <Button className="bg-gray-800 text-white hover:bg-white hover:text-black" variant="outline" size="sm" onClick={() => handleOpenModal(walker.document_id)}>
                      ✏️ Editar
                    </Button>
                    {walker.registration_type === "group_leader" ? (
                      <Button variant="secondary" size="sm" disabled>
                        Líder del grupo
                      </Button>
                    ) : (
                    <Button
                      className="bg-gray-800 text-white hover:bg-red-600"
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteWalker(walker, index)} // Usar la nueva función de borrado
                    >
                      🗑️ Eliminar
                    </Button>)}
                  </TableCell>
                </TableRow>
              ))}

              {sortedWalkers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-gray-500">
                    No hay caminantes registrados aún
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal */}
      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSaveWalker)} className="space-y-4">
              <DialogHeader>
                <DialogTitle>
                  {editingDocumentId !== null ? "Editar Caminante" : "Agregar Nuevo Caminante"}
                </DialogTitle>
              </DialogHeader>

              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre Completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej. Juan Pérez" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="document_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Documento</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un tipo de documento" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="cedula">Cédula</SelectItem>
                        <SelectItem value="tarjeta_identidad">Tarjeta de Identidad</SelectItem>
                        <SelectItem value="pasaporte">Pasaporte</SelectItem>
                        <SelectItem value="otro">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="document_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de Documento</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej. 1234567890" {...field} disabled={isGroupLeader}/>
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
                    <FormLabel>Teléfono</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej. 3001234567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="rh"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>RH</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej. AB+" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="route_id_day1"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ruta Día 1</FormLabel>
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

              <FormField
                control={form.control}
                name="route_id_day2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ruta Día 2</FormLabel>
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

              <DialogFooter>
                <Button type="submit" disabled={loading} className="w-full">
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingDocumentId !== null ? "Actualizar Caminante" : "Guardar Caminante"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}