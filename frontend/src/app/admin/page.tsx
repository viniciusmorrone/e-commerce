'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'
const FONT = "'Montserrat', sans-serif"

interface Produto {
  id: string
  nome: string
  slug: string
  preco: number
  ativo: boolean
  imagem_principal?: string
}

export default function AdminPage() {
  const router = useRouter()
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) { router.push('/login'); return }

    axios
      .get<Produto[]>(`${API_URL}/produtos`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(r => setProdutos(r.data))
      .catch(e => {
        if (axios.isAxiosError(e) && e.response?.status === 401) {
          localStorage.clear()
          router.push('/login')
        } else {
          setErro('Erro ao carregar produtos.')
        }
      })
      .finally(() => setLoading(false))
  }, [router])

  function logout() {
    localStorage.clear()
    router.push('/login')
  }

  return (
    <div style={{ fontFamily: FONT, minHeight: '100vh', background: '#0a0a0a', color: '#fff' }}>
      <header className="flex items-center justify-between px-8 py-5 border-b border-white/10">
        <span className="text-lg font-bold tracking-widest">
          <span style={{ color: '#003087' }}>JEH</span>
          <span style={{ color: '#ffffff' }}>FASH</span>
          <span style={{ color: '#C8102E' }}>ION</span>
          <span className="text-white/40 text-xs font-normal ml-3 uppercase tracking-[0.2em]">Admin</span>
        </span>
        <button
          onClick={logout}
          className="text-white/40 hover:text-white text-xs uppercase tracking-widest transition-colors"
        >
          Sair
        </button>
      </header>

      <main className="max-w-5xl mx-auto px-8 py-10">
        <h2 className="text-xl font-semibold tracking-wider mb-8 text-white/80">Produtos</h2>

        {loading && (
          <p className="text-white/40 text-sm">Carregando…</p>
        )}

        {erro && (
          <p className="text-red-400 text-sm bg-red-400/10 px-4 py-3 rounded border border-red-400/20">{erro}</p>
        )}

        {!loading && !erro && produtos.length === 0 && (
          <p className="text-white/30 text-sm">Nenhum produto cadastrado.</p>
        )}

        {!loading && produtos.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {produtos.map(p => (
              <div key={p.id} className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
                {p.imagem_principal && (
                  <img src={p.imagem_principal} alt={p.nome} className="w-full h-40 object-cover" />
                )}
                <div className="p-4">
                  <p className="font-semibold text-sm text-white/90 truncate">{p.nome}</p>
                  <p className="text-white/50 text-xs mt-1">
                    R$ {Number(p.preco).toFixed(2).replace('.', ',')}
                  </p>
                  <span className={`inline-block mt-2 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded ${p.ativo ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {p.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
