import { Button } from "@/components/ui/button"
import { MessageCircle } from "lucide-react"

export function Newsletter() {
  return (
    <section className="py-16 bg-neutral-900 text-white">
      <div className="container max-w-2xl text-center">
        <MessageCircle className="mx-auto mb-6 text-[#25D366]" size={48} />
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Fique por Dentro
        </h2>
        <p className="text-neutral-300 mb-8 text-lg">
          Receba novidades, lançamentos e peças exclusivas com um atendimento rápido e personalizado.
        </p>
        <Button
          asChild
          size="lg"
          className="bg-[#25D366] text-white hover:bg-[#1ebe5d] border-0 px-8 py-4 text-base"
        >
          <a href="https://wa.me/5511934855599" target="_blank" rel="noopener noreferrer">
            <MessageCircle className="mr-2" size={20} />
            Falar no WhatsApp
          </a>
        </Button>
      </div>
    </section>
  )
}
