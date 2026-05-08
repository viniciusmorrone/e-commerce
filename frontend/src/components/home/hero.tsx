import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function Hero() {
  return (
    <section className="relative h-[600px] flex items-center justify-center bg-gradient-to-br from-neutral-900 to-neutral-800 text-white">
      <div className="container text-center space-y-6">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
          Estilo que Inspira
        </h1>
        <p className="text-xl md:text-2xl text-neutral-300 max-w-2xl mx-auto">
          Descubra as últimas tendências em moda. Peças exclusivas para todos os momentos.
        </p>
        <div className="flex gap-4 justify-center pt-4">
          <Button asChild size="lg" className="bg-white text-black hover:bg-neutral-200">
            <Link href="/produtos">
              Explorar Coleção
              <ArrowRight className="ml-2" size={20} />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
            <Link href="/produtos?categoria=feminino">
              Feminino
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
