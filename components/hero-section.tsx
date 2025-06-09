import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export default function HeroSection() {
  return (
    <section className="relative bg-green-700 text-white">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{ backgroundImage: "url('/placeholder.svg?height=800&width=1600')" }}
      />
      <div className="container mx-auto px-4 py-24 relative z-10">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Explora la Naturaleza en Nuestro Evento Caminera
          </h1>
          <p className="text-xl mb-8">
            Únete a nosotros en esta aventura por senderos naturales, disfruta del aire libre y vive una experiencia
            inolvidable.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild size="lg" className="bg-white text-green-700 hover:bg-gray-100">
              <Link href="/inscripcion">
                Inscríbete Ahora <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              <Link href="/#rutas">Ver Rutas Disponibles</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
