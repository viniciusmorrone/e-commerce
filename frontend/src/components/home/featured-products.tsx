"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { produtosApi, type ProdutoListItem } from "@/lib/api"
import { Button } from "@/components/ui/button"

export function FeaturedProducts() {
  const [produtos, setProdutos] = useState<ProdutoListItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProdutos = async () => {
      try {
        const data = await produtosApi.listar({ limite: 8, ordenar: "criado_em", ordem: "desc" })
        setProdutos(data)
      } catch (error) {
        console.error("Erro ao carregar produtos:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProdutos()
  }, [])

  if (loading) {
    return (
      <section className="py-16">
        <div className="container">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Produtos em Destaque
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square bg-neutral-200 rounded-lg mb-4" />
                <div className="h-4 bg-neutral-200 rounded mb-2" />
                <div className="h-4 bg-neutral-200 rounded w-2/3" />
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16">
      <div className="container">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Produtos em Destaque
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {produtos.map((produto) => (
            <Link
              key={produto.id}
              href={`/produtos/${produto.slug}`}
              className="group"
            >
              <div className="aspect-square relative overflow-hidden rounded-lg bg-neutral-100 mb-4">
                {produto.imagem_principal ? (
                  <Image
                    src={produto.imagem_principal}
                    alt={produto.nome}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-neutral-400">
                    Sem imagem
                  </div>
                )}
              </div>
              <h3 className="font-semibold mb-1 group-hover:underline">
                {produto.nome}
              </h3>
              <p className="text-lg font-bold">
                R$ {produto.preco.toFixed(2).replace('.', ',')}
              </p>
            </Link>
          ))}
        </div>
        <div className="text-center mt-12">
          <Button asChild size="lg" variant="outline">
            <Link href="/produtos">Ver Todos os Produtos</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
