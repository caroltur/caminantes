"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Search, Filter, Eye, Download } from "lucide-react"
// Cambia la importación
import { firebaseClient } from "@/lib/firebase/client"

type Person = {
  id: number
  full_name: string
  document_id: string
  email: string
  phone: string
  route_name: string
  registration_type: "individual" | "group_leader" | "group_member" | "staff"
  payment_status: "pending" | "paid"
  souvenir_status: "pending" | "delivered"
  registration_code?: string
}

export default function PersonManagement() {
  const [people, setPeople] = useState<Person[]>([])
  const [filteredPeople, setFilteredPeople] = useState<Person[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [routeFilter, setRouteFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [routes, setRoutes] = useState<{ id: number; name: string }[]>([])
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  useEffect(() => {
    fetchPeople()
    fetchRoutes()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [searchTerm, routeFilter, statusFilter, people])

  // En fetchPeople:
  const fetchPeople = async () => {
    setLoading(true)
    try {
      const data = await firebaseClient.getRegistrations()
      setPeople(data)
      setFilteredPeople(data)
    } catch (error) {
      console.error("Error fetching people:", error)
    } finally {
      setLoading(false)
    }
  }

  // En fetchRoutes:
  const fetchRoutes = async () => {
    try {
      const data = await firebaseClient.getRoutes()
      setRoutes(data.map((route) => ({ id: route.id, name: route.name })))
    } catch (error) {
      console.error("Error fetching routes:", error)
    }
  }

  const applyFilters = () => {
    let result = [...people]

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(
        (person) =>
          person.full_name.toLowerCase().includes(term) ||
          person.document_id.includes(term) ||
          person.email.toLowerCase().includes(term) ||
          (person.registration_code && person.registration_code.toLowerCase().includes(term)),
      )
    }

    // Apply route filter
    if (routeFilter !== "all") {
      result = result.filter((person) => person.route_name === routeFilter)
    }

    // Apply status filter
    if (statusFilter !== "all") {
      switch (statusFilter) {
        case "pending":
          result = result.filter((person) => person.payment_status === "pending")
          break
        case "paid":
          result = result.filter((person) => person.payment_status === "paid")
          break
        case "delivered":
          result = result.filter((person) => person.souvenir_status === "delivered")
          break
        case "staff":
          result = result.filter((person) => person.registration_type === "staff")
          break
      }
    }

    setFilteredPeople(result)
  }

  const getStatusBadge = (person: Person) => {
    if (person.registration_type === "staff") {
      return <Badge className="bg-purple-500">Staff</Badge>
    }

    if (person.payment_status === "pending") {
      return (
        <Badge variant="outline" className="border-yellow-500 text-yellow-500">
          Pendiente de pago
        </Badge>
      )
    }

    if (person.payment_status === "paid" && person.souvenir_status === "pending") {
      return <Badge className="bg-blue-500">Pagado</Badge>
    }

    if (person.payment_status === "paid" && person.souvenir_status === "delivered") {
      return <Badge className="bg-green-500">Souvenir entregado</Badge>
    }

    return <Badge variant="outline">Desconocido</Badge>
  }

  const getRegistrationTypeBadge = (type: string) => {
    switch (type) {
      case "individual":
        return <Badge variant="outline">Individual</Badge>
      case "group_leader":
        return (
          <Badge variant="outline" className="border-blue-500 text-blue-500">
            Líder de grupo
          </Badge>
        )
      case "group_member":
        return (
          <Badge variant="outline" className="border-blue-300 text-blue-500">
            Miembro de grupo
          </Badge>
        )
      case "staff":
        return (
          <Badge variant="outline" className="border-purple-500 text-purple-500">
            Staff
          </Badge>
        )
      default:
        return <Badge variant="outline">Desconocido</Badge>
    }
  }

  const exportToExcel = () => {
    // In a real implementation, you would generate an Excel file
    alert("Esta función generaría un archivo Excel con los datos filtrados.")
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestión de Personas</h1>
        <Button onClick={exportToExcel}>
          <Download className="mr-2 h-4 w-4" /> Exportar a Excel
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por nombre, cédula, email o código..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex items-center gap-2">
                <Filter className="text-gray-500 h-4 w-4" />
                <span className="text-sm text-gray-500 whitespace-nowrap">Ruta:</span>
                <Select value={routeFilter} onValueChange={setRouteFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Todas las rutas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {routes.map((route) => (
                      <SelectItem key={route.id} value={route.name}>
                        {route.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Filter className="text-gray-500 h-4 w-4" />
                <span className="text-sm text-gray-500 whitespace-nowrap">Estado:</span>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Todos los estados" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="pending">Pendiente de pago</SelectItem>
                    <SelectItem value="paid">Pagado</SelectItem>
                    <SelectItem value="delivered">Souvenir entregado</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Cédula</TableHead>
                  <TableHead>Ruta</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Cargando personas...
                    </TableCell>
                  </TableRow>
                ) : filteredPeople.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      No se encontraron personas que coincidan con los filtros.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPeople.map((person) => (
                    <TableRow key={person.id}>
                      <TableCell className="font-medium">{person.full_name}</TableCell>
                      <TableCell>{person.document_id}</TableCell>
                      <TableCell>{person.route_name}</TableCell>
                      <TableCell>{getRegistrationTypeBadge(person.registration_type)}</TableCell>
                      <TableCell>{getStatusBadge(person)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedPerson(person)
                            setIsDetailsOpen(true)
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Person Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Detalles de la Persona</DialogTitle>
            <DialogDescription>Información completa del participante.</DialogDescription>
          </DialogHeader>

          {selectedPerson && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-sm text-gray-500">Nombre completo</p>
                  <p className="font-medium">{selectedPerson.full_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Cédula</p>
                  <p className="font-medium">{selectedPerson.document_id}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{selectedPerson.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Teléfono</p>
                  <p className="font-medium">{selectedPerson.phone}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-sm text-gray-500">Ruta</p>
                  <p className="font-medium">{selectedPerson.route_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tipo de registro</p>
                  <p className="font-medium">
                    {selectedPerson.registration_type === "individual" && "Individual"}
                    {selectedPerson.registration_type === "group_leader" && "Líder de grupo"}
                    {selectedPerson.registration_type === "group_member" && "Miembro de grupo"}
                    {selectedPerson.registration_type === "staff" && "Staff"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-sm text-gray-500">Estado de pago</p>
                  <p className="font-medium">{selectedPerson.payment_status === "pending" ? "Pendiente" : "Pagado"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Estado de souvenir</p>
                  <p className="font-medium">
                    {selectedPerson.souvenir_status === "pending" ? "Pendiente" : "Entregado"}
                  </p>
                </div>
              </div>

              {selectedPerson.registration_code && (
                <div>
                  <p className="text-sm text-gray-500">Código de registro</p>
                  <p className="font-medium">{selectedPerson.registration_code}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
