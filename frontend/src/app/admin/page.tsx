"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { LogOut, Package, Tag, BarChart2, Plus, RefreshCw } from "lucide-react"
import { produtosApi, type ProdutoListItem } from "@/lib/api"

const MONTSERRAT = "'Montserrat', sans-serif"

export default function AdminPage() {
  const router = useRouter()
  const [produtos, setProdutos] = useState<ProdutoListItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (typeof window !== "undefined" && !localStorage.getItem("access_token")) {
      router.replace("/login")
      return
    }
    const loadData = async () => {
      try {
        const data = await produtosApi.listar({ ordenar: "criado_em", ordem: "desc" })
        setProdutos(data)
      } catch (_e) {
        /* ignore */
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
    router.push("/login")
  }

  return (
    <div className="fixed inset-0 z-[200] bg-neutral-950 text-white overflow-auto">
      {/* Sidebar + Main layout */}
      <div className="flex h-full">
        {/* Sidebar */}
        <aside className="w-56 bg-black border-r border-white/5 flex flex-col shrink-0">
          <div className="px-6 py-6 border-b border-white/5">
            <h1 className="text-lg font-black tracking-widest uppercase" style={{ fontFamily: MONTSERRAT }}>
              <span style={{ color: "#002395" }}>JEH</span>
              <span style={{ color: "#FFFFFF" }}>FASH</span>
              <span style={{ color: "#ED2939" }}>ION</span>
            </h1>
            <p className="text-white/25 text-[10px] mt-0.5 uppercase tracking-widest" style={{ fontFamily: MONTSERRAT }}>Admin</p>
          </div>

          <nav className="flex-1 px-3 py-4 space-y-1">
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/5 text-white text-xs font-bold uppercase tracking-widest cursor-default" style={{ fontFamily: MONTSERRAT }}>
              <Package size={14} />
              Produtos
            </div>
            <Link
              href="/produtos?categoria=camisetas"
              target="_blank"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 text-xs font-bold uppercase tracking-widest transition-colors"
              style={{ fontFamily: MONTSERRAT }}
            >
              <Tag size={14} />
              Ver Loja
            </Link>
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/20 text-xs font-bold uppercase tracking-widest cursor-not-allowed" style={{ fontFamily: MONTSERRAT }}>
              <BarChart2 size={14} />
              Relatórios
              <span className="ml-auto text-[9px] bg-white/10 px-1.5 py-0.5 rounded">em breve</span>
            </div>
          </nav>

          <div className="px-3 py-4 border-t border-white/5">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/5 text-xs font-bold uppercase tracking-widest transition-colors"
              style={{ fontFamily: MONTSERRAT }}
            >
              <LogOut size={14} />
              Sair
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 overflow-auto">
          {/* Top bar */}
          <div className="px-8 py-5 border-b border-white/5 flex items-center justify-between">
            <h2 className="text-sm font-black uppercase tracking-widest text-white" style={{ fontFamily: MONTSERRAT }}>
              Produtos
              {!loading && <span className="ml-2 text-white/30 font-normal text-xs">({produtos.length})</span>}
            </h2>
            <div className="flex items-center gap-3">
              <button
                onClick={() => { setLoading(true); produtosApi.listar({ ordenar: "criado_em", ordem: "desc" }).then(setProdutos).finally(() => setLoading(false)) }}
                className="flex items-center gap-1.5 text-white/30 hover:text-white text-xs transition-colors"
                style={{ fontFamily: MONTSERRAT }}
              >
                <RefreshCw size={13} />
                Atualizar
              </button>
              <a
                href="https://wa.me/5511934855599"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 bg-white text-black text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full hover:bg-white/90 transition-colors"
                style={{ fontFamily: MONTSERRAT }}
              >
                <Plus size={13} />
                Novo Produto
              </a>
            </div>
          </div>

          {/* Products table */}
          <div className="px-8 py-6">
            {loading ? (
              <div className="space-y-3">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-14 bg-white/5 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : produtos.length === 0 ? (
              <div className="text-center py-20">
                <Package size={40} className="text-white/10 mx-auto mb-4" />
                <p className="text-white/20 text-sm" style={{ fontFamily: MONTSERRAT }}>Nenhum produto cadastrado</p>
              </div>
            ) : (
              <div className="rounded-xl border border-white/5 overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/[0.02]">
                      <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-white/30" style={{ fontFamily: MONTSERRAT }}>Produto</th>
                      <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-white/30 hidden md:table-cell" style={{ fontFamily: MONTSERRAT }}>Slug</th>
                      <th className="text-right px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-white/30" style={{ fontFamily: MONTSERRAT }}>Preço</th>
                      <th className="text-right px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-white/30" style={{ fontFamily: MONTSERRAT }}>Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {produtos.map((p, i) => (
                      <tr key={p.id} className={`border-b border-white/5 hover:bg-white/[0.02] transition-colors ${i % 2 === 0 ? "" : "bg-white/[0.01]"}`}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-neutral-900 overflow-hidden shrink-0 relative">
                              {p.imagem_principal ? (
                                <Image src={p.imagem_principal} alt={p.nome} fill className="object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package size={12} className="text-white/20" />
                                </div>
                              )}
                            </div>
                            <span className="text-white text-xs font-semibold line-clamp-1" style={{ fontFamily: MONTSERRAT }}>{p.nome}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <span className="text-white/30 text-[11px] font-mono">{p.slug}</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-white text-xs font-bold">R$ {p.preco.toFixed(2).replace(".", ",")}</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link
                            href={`/produtos/${p.slug}`}
                            target="_blank"
                            className="text-white/30 hover:text-white text-[11px] transition-colors"
                            style={{ fontFamily: MONTSERRAT }}
                          >
                            Ver →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
