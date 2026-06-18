"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { produtosApi, type ProdutoListItem } from "@/lib/api"

const MONTSERRAT = "'Montserrat', sans-serif"

export function FeaturedProducts() {
  const [produtos, setProdutos] = useState<ProdutoListItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await produtosApi.listar({ limite: 15, ordenar: "criado_em", ordem: "desc" })
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
    <section className="py-16 bg-black border-t border-white/5">
      <div className="container">
        <p
          className="text-center text-xs font-bold tracking-[0.35em] text-white/40 mb-10 uppercase"
          style={{ fontFamily: MONTSERRAT }}
        >
          ÚLTIMAS PEÇAS!
        </p>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-4 gap-y-8">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square bg-neutral-900 rounded-xl mb-3" />
                <div className="h-2.5 bg-neutral-900 rounded mb-2 w-3/4" />
                <div className="h-2.5 bg-neutral-900 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : produtos.length === 0 ? (
          <p className="text-center text-white/20 py-16 text-sm">Em breve, novas peças aqui!</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-4 gap-y-8">
            {produtos.map((produto) => (
              <Link key={produto.id} href={`/produtos/${produto.slug}`} className="group">
                <div className="aspect-square relative overflow-hidden rounded-xl bg-neutral-900 mb-3">
                  {produto.imagem_principal ? (
                    <Image
                      src={produto.imagem_principal}
                      alt={produto.nome}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/20 text-[10px]">
                      Sem imagem
                    </div>
                  )}
                </div>
                <h3
                  className="text-white text-[11px] font-semibold uppercase tracking-wide mb-1 group-hover:text-white/60 transition-colors line-clamp-2"
                  style={{ fontFamily: MONTSERRAT }}
                >
                  {produto.nome}
                </h3>
                <p className="text-white text-sm font-bold">
                  R$ {Number(produto.preco).toFixed(2).replace(".", ",")}
                </p>
              </Link>
            ))}
          </div>
        )}

        <div className="flex justify-center mt-12">
          <Link
            href="/ultimas-pecas"
            className="inline-flex items-center justify-center px-10 py-3 bg-blue-600 text-white text-xs font-bold uppercase tracking-[0.2em] rounded-full hover:bg-blue-700 transition-colors"
            style={{ fontFamily: MONTSERRAT }}
          >
            VER MAIS
          </Link>
        </div>
      </div>
    </section>
  )
}
