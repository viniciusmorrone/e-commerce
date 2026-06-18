"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { produtosApi, type ProdutoListItem } from "@/lib/api"

const MONTSERRAT = "'Montserrat', sans-serif"

export default function UltimasPecasPage() {
  const [produtos, setProdutos] = useState<ProdutoListItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await produtosApi.listar({ ordenar: "criado_em", ordem: "desc" })
        setProdutos(data)
      } catch (_e) {
        /* silently ignore */
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container py-12">
        <nav className="flex items-center gap-2 text-[11px] text-white/30 mb-8 uppercase tracking-widest" style={{ fontFamily: MONTSERRAT }}>
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <span>/</span>
          <span className="text-white/60">Últimas Peças</span>
        </nav>

        <h1
          className="text-2xl font-black uppercase tracking-[0.25em] text-white mb-10"
          style={{ fontFamily: MONTSERRAT }}
        >
          ÚLTIMAS PEÇAS!
          {!loading && (
            <span className="ml-3 text-sm font-normal text-white/30 tracking-normal">
              ({produtos.length} {produtos.length === 1 ? "peça" : "peças"})
            </span>
          )}
        </h1>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-8">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square bg-neutral-900 rounded-xl mb-3" />
                <div className="h-2.5 bg-neutral-900 rounded mb-2 w-3/4" />
                <div className="h-2.5 bg-neutral-900 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : produtos.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-white/20 text-sm mb-6" style={{ fontFamily: MONTSERRAT }}>
              Em breve, novas peças aqui!
            </p>
            <Link href="/" className="text-xs font-bold text-white/40 uppercase tracking-widest hover:text-white transition-colors" style={{ fontFamily: MONTSERRAT }}>
              ← Voltar para a Home
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-8">
            {produtos.map((produto) => (
              <Link key={produto.id} href={`/produtos/${produto.slug}`} className="group">
                <div className="aspect-square relative overflow-hidden rounded-xl bg-neutral-900 mb-3">
                  {produto.imagem_principal ? (
                    <Image src={produto.imagem_principal} alt={produto.nome} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/20 text-[10px]">Sem imagem</div>
                  )}
                </div>
                <h3 className="text-white text-[11px] font-semibold uppercase tracking-wide mb-1 group-hover:text-white/60 transition-colors line-clamp-2" style={{ fontFamily: MONTSERRAT }}>
                  {produto.nome}
                </h3>
                <p className="text-white text-sm font-bold">R$ {Number(produto.preco).toFixed(2).replace(".", ",")}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
