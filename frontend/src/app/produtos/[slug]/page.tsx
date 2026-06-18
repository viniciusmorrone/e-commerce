"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { MessageCircle, ArrowLeft, ChevronRight } from "lucide-react"
import { produtosApi, type Produto, type Variante } from "@/lib/api"

const MONTSERRAT = "'Montserrat', sans-serif"

export default function ProdutoPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const [produto, setProduto] = useState<Produto | null>(null)
  const [loading, setLoading] = useState(true)
  const [imagemAtiva, setImagemAtiva] = useState(0)

  const [varianteSelecionada, setVarianteSelecionada] = useState<Variante | null>(null)
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null)
  const [loadingWpp, setLoadingWpp] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await produtosApi.obter(slug)
        setProduto(data)
        if (data.variantes?.length > 0) setVarianteSelecionada(data.variantes[0])
      } catch (_e) {
        router.push("/")
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [slug, router])

  useEffect(() => {
    if (!produto?.imagens) return
    const sorted = [...produto.imagens].sort((a, b) => a.ordem - b.ordem)
    const principalIdx = sorted.findIndex((img) => img.principal)
    setImagemAtiva(principalIdx >= 0 ? principalIdx : 0)
  }, [produto])

  useEffect(() => {
    if (!produto) return
    const loadWpp = async () => {
      setLoadingWpp(true)
      try {
        const { url } = await produtosApi.gerarLinkWhatsApp(slug, varianteSelecionada?.id)
        setWhatsappUrl(url)
      } catch (_e) {
        setWhatsappUrl(`https://wa.me/5511934855599?text=Olá! Tenho interesse no produto: ${produto.nome}`)
      } finally {
        setLoadingWpp(false)
      }
    }
    loadWpp()
  }, [slug, varianteSelecionada, produto])

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white/20 text-sm animate-pulse" style={{ fontFamily: MONTSERRAT }}>
          Carregando...
        </div>
      </div>
    )
  }

  if (!produto) return null

  const imagens = produto.imagens?.sort((a, b) => a.ordem - b.ordem) ?? []
  const clampedIndex = Math.min(imagemAtiva, Math.max(0, imagens.length - 1))
  const imagemPrincipal = imagens[clampedIndex]?.url ?? null

  const tamanhos = [...new Set(produto.variantes.map((v) => v.tamanho))].filter((t): t is string => t != null)
  const cores = [...new Set(produto.variantes.map((v) => v.cor))].filter((c): c is string => c != null)

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[11px] text-white/30 mb-8 uppercase tracking-widest" style={{ fontFamily: MONTSERRAT }}>
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <ChevronRight size={10} />
          <Link href="/produtos" className="hover:text-white transition-colors">Produtos</Link>
          <ChevronRight size={10} />
          <span className="text-white/60 line-clamp-1">{produto.nome}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Imagens */}
          <div className="space-y-3">
            <div className="aspect-square relative overflow-hidden rounded-2xl bg-neutral-900">
              {imagemPrincipal ? (
                <Image src={imagemPrincipal} alt={produto.nome} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/20 text-sm">
                  Sem imagem
                </div>
              )}
            </div>
            {imagens.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {imagens.map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => setImagemAtiva(i)}
                    className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                      clampedIndex === i ? "border-white" : "border-white/10 hover:border-white/30"
                    }`}
                  >
                    <Image src={img.url} alt="" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-6">
            <div>
              <h1
                className="text-2xl md:text-3xl font-black uppercase tracking-wide mb-3"
                style={{ fontFamily: MONTSERRAT }}
              >
                {produto.nome}
              </h1>
              <p
                className="text-3xl md:text-4xl font-black text-white"
                style={{ fontFamily: MONTSERRAT }}
              >
                <span className="text-base align-top text-white/50 mr-1">R$</span>
                {Number(produto.preco).toFixed(2).replace(".", ",")}
              </p>
              <p className="text-[11px] text-white/30 mt-2 uppercase tracking-widest" style={{ fontFamily: MONTSERRAT }}>
                Em até 12x no cartão
              </p>
            </div>

            {produto.descricao && (
              <p className="text-neutral-400 text-sm leading-relaxed">
                {produto.descricao}
              </p>
            )}

            {/* Tamanhos */}
            {tamanhos.length > 0 && (
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-white/40 mb-3" style={{ fontFamily: MONTSERRAT }}>
                  Tamanho
                </p>
                <div className="flex gap-2 flex-wrap">
                  {tamanhos.map((tam) => {
                    const variante = produto.variantes?.find(
                      (v) => v.tamanho === tam && (varianteSelecionada?.cor ? v.cor === varianteSelecionada.cor : true)
                    )
                    const semEstoque = variante ? variante.qtd_estoque === 0 : false
                    const selecionado = varianteSelecionada?.tamanho === tam
                    return (
                      <button
                        key={tam}
                        onClick={() => variante && setVarianteSelecionada(variante)}
                        disabled={semEstoque}
                        className={`w-11 h-11 text-xs font-bold rounded-lg border transition-all ${
                          selecionado
                            ? "bg-white text-black border-white"
                            : semEstoque
                            ? "border-white/10 text-white/20 cursor-not-allowed line-through"
                            : "border-white/20 text-white hover:border-white"
                        }`}
                        style={{ fontFamily: MONTSERRAT }}
                      >
                        {tam}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Cores */}
            {cores.length > 0 && (
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-white/40 mb-3" style={{ fontFamily: MONTSERRAT }}>
                  Cor
                </p>
                <div className="flex gap-2 flex-wrap">
                  {cores.map((cor) => {
                    const selecionado = varianteSelecionada?.cor === cor
                    return (
                      <button
                        key={cor}
                        onClick={() => {
                          const v = produto.variantes?.find((vv) => vv.cor === cor)
                          if (v) setVarianteSelecionada(v)
                        }}
                        className={`px-4 py-2 text-xs font-bold rounded-lg border transition-all ${
                          selecionado
                            ? "bg-white text-black border-white"
                            : "border-white/20 text-white hover:border-white"
                        }`}
                        style={{ fontFamily: MONTSERRAT }}
                      >
                        {cor}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Estoque */}
            {varianteSelecionada && (
              <p className="text-xs text-white/30" style={{ fontFamily: MONTSERRAT }}>
                {varianteSelecionada.qtd_estoque > 0
                  ? `${varianteSelecionada.qtd_estoque} unidades disponíveis`
                  : "Fora de estoque"}
              </p>
            )}

            {/* WhatsApp CTA */}
            <a
              href={whatsappUrl ?? "https://wa.me/5511934855599"}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center justify-center gap-3 w-full py-4 rounded-full font-bold text-base transition-colors ${
                loadingWpp
                  ? "bg-[#25D366]/50 cursor-wait"
                  : "bg-[#25D366] hover:bg-[#1ebe5d] shadow-lg shadow-[#25D366]/20"
              } text-white`}
              style={{ fontFamily: MONTSERRAT }}
            >
              <MessageCircle size={22} />
              {loadingWpp ? "Preparando..." : "Comprar pelo WhatsApp"}
            </a>

            <p className="text-[11px] text-white/20 text-center" style={{ fontFamily: MONTSERRAT }}>
              Atendimento rápido e seguro via WhatsApp
            </p>

            {/* Back */}
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-xs text-white/30 hover:text-white transition-colors"
              style={{ fontFamily: MONTSERRAT }}
            >
              <ArrowLeft size={14} />
              Voltar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
