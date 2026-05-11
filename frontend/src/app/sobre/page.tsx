import Link from "next/link"
import { MessageCircle } from "lucide-react"

const MONTSERRAT = "'Montserrat', sans-serif"

export default function SobrePage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container py-16 max-w-2xl">
        <nav className="flex items-center gap-2 text-[11px] text-white/30 mb-10 uppercase tracking-widest" style={{ fontFamily: MONTSERRAT }}>
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <span>/</span>
          <span className="text-white/60">Sobre Nós</span>
        </nav>

        <h1 className="text-3xl font-black uppercase tracking-[0.2em] mb-8" style={{ fontFamily: MONTSERRAT }}>
          Sobre a JehFashion
        </h1>

        <div className="space-y-5 text-neutral-400 text-base leading-relaxed">
          <p>
            A <strong className="text-white">JehFashion</strong> nasceu da paixão pela moda masculina de qualidade.
            Aqui você encontra peças exclusivas de marcas nacionais e internacionais, com um atendimento
            personalizado direto pelo WhatsApp.
          </p>
          <p>
            Trabalhamos com camisetas, calças, chinelos, bonés e acessórios selecionados a dedo —
            sempre pensando no estilo e conforto do homem moderno.
          </p>
          <p>
            Nossa missão é simples: levar moda de verdade com preço justo e atendimento rápido.
            Sem complicação, sem burocracia.
          </p>
        </div>

        <div className="mt-12">
          <a
            href="https://wa.me/5511934855599"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#25D366] text-white font-bold px-10 py-3.5 rounded-full text-base hover:bg-[#1ebe5d] transition-colors"
            style={{ fontFamily: MONTSERRAT }}
          >
            <MessageCircle size={20} />
            Falar no WhatsApp
          </a>
        </div>
      </div>
    </div>
  )
}
