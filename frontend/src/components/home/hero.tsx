import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, MessageCircle } from "lucide-react"

export function Hero() {
  return (
    <section className="relative h-[600px] flex items-center justify-center bg-gradient-to-br from-neutral-900 to-neutral-800 text-white">
      <div className="container text-center space-y-6">
        <span className="inline-block text-xs font-semibold tracking-widest uppercase text-neutral-400 border border-neutral-600 px-3 py-1 rounded-full">
          Nova Coleção
        </span>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
          Estilo que Inspira
        </h1>
        <p className="text-xl md:text-2xl text-neutral-300 max-w-2xl mx-auto">
          Peças exclusivas, moda masculina de grife e muito estilo. Compre direto pelo WhatsApp, rápido e sem complicação.
        </p>
        <div className="flex gap-4 justify-center pt-4 flex-wrap">
          <Button asChild size="lg" className="bg-white text-black hover:bg-neutral-200">
            <Link href="/produtos">
              Explorar Coleção
              <ArrowRight className="ml-2" size={20} />
            </Link>
          </Button>
          <Button asChild size="lg" className="bg-[#25D366] text-white hover:bg-[#1ebe5d] border-0">
            <a href="https://wa.me/5511934855599" target="_blank" rel="noopener noreferrer">
              <MessageCircle className="mr-2" size={20} />
              Falar no WhatsApp
            </a>
          </Button>
        </div>
      </div>
    </section>
  )
}
