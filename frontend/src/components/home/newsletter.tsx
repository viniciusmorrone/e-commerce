import { MessageCircle } from "lucide-react"

const MONTSERRAT = "'Montserrat', sans-serif"

export function Newsletter() {
  return (
    <section className="py-20 bg-black border-t border-white/5 text-white">
      <div className="container max-w-2xl text-center">
        <MessageCircle className="mx-auto mb-6 text-[#25D366]" size={44} />
        <h2
          className="text-2xl md:text-3xl font-black mb-4 uppercase tracking-widest"
          style={{ fontFamily: MONTSERRAT }}
        >
          Fique por Dentro
        </h2>
        <p className="text-neutral-400 mb-8 text-base max-w-md mx-auto leading-relaxed">
          Receba novidades, lançamentos e peças exclusivas com um atendimento rápido e personalizado.
        </p>
        <a
          href="https://wa.me/5511934855599"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-[#25D366] text-white font-bold px-10 py-3.5 rounded-full text-base hover:bg-[#1ebe5d] transition-colors shadow-lg shadow-[#25D366]/20"
          style={{ fontFamily: MONTSERRAT }}
        >
          <MessageCircle size={20} />
          Falar no WhatsApp
        </a>
      </div>
    </section>
  )
}
