import { MessageCircle } from "lucide-react"

const MONTSERRAT = "'Montserrat', sans-serif"

export function Hero() {
  return (
    <section className="relative min-h-[580px] flex items-center justify-center bg-black text-white">
      <div className="container text-center space-y-6 px-4">
        <h1
          className="text-5xl md:text-7xl font-black tracking-tight uppercase"
          style={{ fontFamily: MONTSERRAT }}
        >
          Estilo que Inspira
        </h1>
        <p className="text-lg md:text-xl text-neutral-400 max-w-xl mx-auto leading-relaxed">
          Peças exclusivas, moda masculina de grife e muito estilo.
          Compre direto pelo WhatsApp, rápido e sem complicação.
        </p>
        <div className="flex justify-center pt-4">
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
      </div>
    </section>
  )
}
