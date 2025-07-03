import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export default function HeroSection() {
  return (
    <section className="relative bg-black text-black" >
      <div
        className="absolute inset-0 bg-cover bg-center opacity-70"
        style={{ backgroundImage: "url('/logo.png')", backgroundSize: "100% 100%", backgroundRepeat: "no-repeat" }}
      />
      <div className="container px-4 py-24 relative z-10" style={{ width: "50%",marginLeft: "5%" }}>
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-5xl lg:text-5xl font-bold texto-resaltado mb-6">
            III Encuentro departamental de Caminantes Villamaría Caldas
          </h1>
          <p className="text-2xl mb-8 texto-resaltado font-bold" style={{  }}>
            Camina, ven y descubre los encantos de villa maría
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild size="lg" className="bg-white text-green-700 hover:bg-gray-100">
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
