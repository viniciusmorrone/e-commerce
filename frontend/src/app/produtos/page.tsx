"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useState, Suspense } from "react"
import Link from "next/link"
import Image from "next/image"
import { produtosApi, categoriasApi, type ProdutoListItem } from "@/lib/api"

const MONTSERRAT = "'Montserrat', sans-serif"

function ProductCard({ produto }: { produto: ProdutoListItem }) {
  const [imgError, setImgError] = useState(false)
  return (
    <Link href={`/produtos/${produto.slug}`} className="group">
      <div className="aspect-square relative overflow-hidden rounded-xl bg-neutral-900 mb-3">
        {produto.imagem_principal && !imgError ? (
          <Image
            src={produto.imagem_principal}
            alt={produto.nome}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImgError(true)}
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
    </Link>
  )
}

const CATEGORIA_LABELS: Record<string, string> = {
  camisetas: "CAMISETAS",
  calcas: "CALÇAS",
  chinelos: "CHINELOS",
  bones: "BONÉS",
  acessorios: "ACESSÓRIOS",
  marcas: "MARCAS DE ARTISTA!",
  polo: "POLO",
  griffe: "GRIFFE",
  time: "TIME",
  jeans: "JEANS",
  alfaiataria: "ALFAIATARIA",
  skinny: "SKINNY",
  reta: "RETA",
  relogios: "RELÓGIOS",
  carteiras: "CARTEIRAS",
  tenis: "TÊNIS",
  blusas: "BLUSAS",
}

function ProdutosContent() {
  const searchParams = useSearchParams()
  const categoriaSlug = searchParams.get("categoria") ?? undefined
  const buscaQuery = searchParams.get("busca") ?? undefined
  const [produtos, setProdutos] = useState<ProdutoListItem[]>([])
  const [loading, setLoading] = useState(true)

  const titulo = buscaQuery
    ? `RESULTADOS PARA "${buscaQuery.toUpperCase()}"`
    : categoriaSlug
    ? (CATEGORIA_LABELS[categoriaSlug] ?? categoriaSlug.toUpperCase())
    : "TODOS OS PRODUTOS"

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        let categoriaId: string | undefined

        if (categoriaSlug && !buscaQuery) {
          const categorias = await categoriasApi.listar()
          for (const cat of categorias) {
            if (cat.slug === categoriaSlug) { categoriaId = cat.id; break }
            const sub = cat.subcategorias?.find((s) => s.slug === categoriaSlug)
            if (sub) { categoriaId = sub.id; break }
          }
        }

        const data = await produtosApi.listar({
          categoria_id: categoriaId,
          busca: buscaQuery,
          ordenar: "criado_em",
          ordem: "desc",
        })
        setProdutos(data)
      } catch (_e) {
        /* silently ignore */
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [categoriaSlug, buscaQuery])

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[11px] text-white/30 mb-8 uppercase tracking-widest" style={{ fontFamily: MONTSERRAT }}>
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <span>/</span>
          <span className="text-white/60">{titulo}</span>
        </nav>

        {/* Title */}
        <h1
          className="text-2xl font-black uppercase tracking-[0.25em] text-white mb-10"
          style={{ fontFamily: MONTSERRAT }}
        >
          {titulo}
          {!loading && (
            <span className="ml-3 text-sm font-normal text-white/30 tracking-normal">
              ({produtos.length} {produtos.length === 1 ? "peça" : "peças"})
            </span>
          )}
        </h1>

        {/* Grid */}
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
              Nenhuma peça encontrada nesta coleção ainda.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-bold text-white/40 uppercase tracking-widest hover:text-white transition-colors"
              style={{ fontFamily: MONTSERRAT }}
            >
              ← Voltar para a Home
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-8">
            {produtos.map((produto) => (
              <ProductCard key={produto.id} produto={produto} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function ProdutosPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white/20 text-sm" style={{ fontFamily: MONTSERRAT }}>Carregando...</div>
      </div>
    }>
      <ProdutosContent />
    </Suspense>
  )
}
