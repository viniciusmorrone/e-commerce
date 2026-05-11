import Link from "next/link"
import { MessageCircle, Instagram, Facebook } from "lucide-react"

const MONTSERRAT = "'Montserrat', sans-serif"

export default function ContatoPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container py-16 max-w-xl">
        <nav className="flex items-center gap-2 text-[11px] text-white/30 mb-10 uppercase tracking-widest" style={{ fontFamily: MONTSERRAT }}>
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <span>/</span>
          <span className="text-white/60">Contato</span>
        </nav>

        <h1 className="text-3xl font-black uppercase tracking-[0.2em] mb-10" style={{ fontFamily: MONTSERRAT }}>
          Contato
        </h1>

        <div className="space-y-4">
          <a
            href="https://wa.me/5511934855599"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 p-5 rounded-2xl border border-white/10 hover:border-[#25D366]/50 hover:bg-[#25D366]/5 transition-all group"
          >
            <div className="w-12 h-12 rounded-full bg-[#25D366]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#25D366]/20 transition-colors">
              <MessageCircle size={22} className="text-[#25D366]" />
            </div>
            <div>
              <p className="text-white font-bold text-sm uppercase tracking-widest" style={{ fontFamily: MONTSERRAT }}>WhatsApp</p>
              <p className="text-white/40 text-xs mt-0.5">(11) 93485-5599</p>
            </div>
          </a>

          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 p-5 rounded-2xl border border-white/10 hover:border-pink-500/50 hover:bg-pink-500/5 transition-all group"
          >
            <div className="w-12 h-12 rounded-full bg-pink-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-pink-500/20 transition-colors">
              <Instagram size={22} className="text-pink-500" />
            </div>
            <div>
              <p className="text-white font-bold text-sm uppercase tracking-widest" style={{ fontFamily: MONTSERRAT }}>Instagram</p>
              <p className="text-white/40 text-xs mt-0.5">@jehfashion</p>
            </div>
          </a>

          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 p-5 rounded-2xl border border-white/10 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all group"
          >
            <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-500/20 transition-colors">
              <Facebook size={22} className="text-blue-500" />
            </div>
            <div>
              <p className="text-white font-bold text-sm uppercase tracking-widest" style={{ fontFamily: MONTSERRAT }}>Facebook</p>
              <p className="text-white/40 text-xs mt-0.5">JehFashion</p>
            </div>
          </a>
        </div>

        <p className="text-white/20 text-xs text-center mt-12" style={{ fontFamily: MONTSERRAT }}>
          Atendimento de seg a sáb, das 9h às 21h
        </p>
      </div>
    </div>
  )
}
