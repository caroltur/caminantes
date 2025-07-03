import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export default function HeroSection() {
  return (
    <section className="relative bg-black text-white overflow-hidden">
    <div
      className="absolute inset-0 bg-cover bg-center opacity-70 LogoResponsib"
      
    />
    <div
      className="container px-4 py-20 relative z-10 
                 flex items-center  min-h-[60vh] 
                 text-center sm:text-left" // CAMBIO: Flexbox para centrado, altura mínima y alineación de texto
    >
      <div className="max-w-3xl">
        <h1
          className="text-3xl md:text-4xl lg:text-5xl font-bold 
                     texto-resaltado mb-6 text-white" // CAMBIO: Tamaños de texto responsive y color blanco
        >
          III Encuentro departamental de Caminantes Villamaría Caldas
        </h1>
        <p
          className="text-xl md:text-2xl mb-8 
                     texto-resaltado font-bold text-white" // CAMBIO: Tamaños de texto responsive y color blanco
        >
          Camina, ven y descubre los encantos de Villa María
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center sm:justify-start">
          {/* CAMBIO: Los botones se apilan en móvil y luego se ponen en fila, centrados en móvil */}
          <Button
            asChild
            size="lg"
            className="bg-white text-green-700 hover:bg-gray-100"
          >
            <Link href="/inscripcion">
              Inscríbete Ahora <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  </section>
  )
}
