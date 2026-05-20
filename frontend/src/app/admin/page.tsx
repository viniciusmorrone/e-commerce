'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { Plus, X, Check, Trash2, Eye, EyeOff, ChevronDown, ImagePlus } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'
const FONT = "'Montserrat', sans-serif"
const TAMANHOS = ['P', 'M', 'G', 'GG']
const SLUGS_SEM_TAMANHO = new Set(['chinelos', 'bones', 'acessorios', 'relogios'])

function precisaTamanho(slug: string): boolean {
  return !SLUGS_SEM_TAMANHO.has(slug)
}

function gerarSlug(nome: string): string {
  return nome
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

function gerarSku(slug: string, sufixo: string): string {
  return `${slug}-${sufixo.toLowerCase()}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
}

interface Produto {
  id: string
  nome: string
  slug: string
  ativo: boolean
  imagem_principal?: string
}

interface Categoria {
  id: string
  nome: string
  slug: string
  subcategorias: Categoria[]
}

interface CatFlat {
  id: string
  nome: string
  slug: string
  nivel: number
}

interface FormState {
  nome: string
  descricao: string
  categoria_id: string
  categoria_slug: string
  tamanhos: string[]
  imagens: File[]
  previews: string[]
}

const FORM_VAZIO: FormState = {
  nome: '',
  descricao: '',
  categoria_id: '',
  categoria_slug: '',
  tamanhos: ['P', 'M', 'G', 'GG'],
  imagens: [],
  previews: [],
}

function flatCats(cats: Categoria[]): CatFlat[] {
  const result: CatFlat[] = []
  for (const c of cats) {
    result.push({ id: c.id, nome: c.nome, slug: c.slug, nivel: 0 })
    for (const s of c.subcategorias ?? []) {
      result.push({ id: s.id, nome: s.nome, slug: s.slug, nivel: 1 })
    }
  }
  return result
}

export default function AdminPage() {
  const router = useRouter()
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState('')
  const [drawer, setDrawer] = useState(false)
  const [form, setForm] = useState<FormState>(FORM_VAZIO)
  const [enviando, setEnviando] = useState(false)
  const [erroForm, setErroForm] = useState('')
  const [okMsg, setOkMsg] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const token = () => (typeof window !== 'undefined' ? localStorage.getItem('access_token') : null)

  useEffect(() => {
    const tk = token()
    if (!tk) { router.replace('/login'); return }

    Promise.all([
      axios.get<Produto[]>(`${API_URL}/produtos`, { headers: { Authorization: `Bearer ${tk}` } }),
      axios.get<Categoria[]>(`${API_URL}/categorias`),
    ])
      .then(([rP, rC]) => { setProdutos(rP.data); setCategorias(rC.data) })
      .catch(e => {
        if (axios.isAxiosError(e) && e.response?.status === 401) {
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          router.replace('/login')
        } else {
          setErro('Erro ao carregar dados.')
        }
      })
      .finally(() => setLoading(false))
  }, [router])

  function logout() {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    router.replace('/login')
  }

  function abrirDrawer() {
    setForm(FORM_VAZIO)
    setErroForm('')
    setOkMsg('')
    setDrawer(true)
  }

  function fecharDrawer() {
    form.previews.forEach(p => URL.revokeObjectURL(p))
    setDrawer(false)
  }

  function onCategoria(id: string) {
    const cat = flatCats(categorias).find(c => c.id === id)
    const slug = cat?.slug ?? ''
    setForm(f => ({
      ...f,
      categoria_id: id,
      categoria_slug: slug,
      tamanhos: precisaTamanho(slug) ? ['P', 'M', 'G', 'GG'] : [],
    }))
  }

  function toggleTamanho(t: string) {
    setForm(f => ({
      ...f,
      tamanhos: f.tamanhos.includes(t) ? f.tamanhos.filter(x => x !== t) : [...f.tamanhos, t],
    }))
  }

  function onFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    const novos = Array.from(files)
    const prevs = novos.map(f => URL.createObjectURL(f))
    setForm(f => ({ ...f, imagens: [...f.imagens, ...novos], previews: [...f.previews, ...prevs] }))
    if (fileRef.current) fileRef.current.value = ''
  }

  function removerImagem(i: number) {
    setForm(f => {
      URL.revokeObjectURL(f.previews[i])
      return {
        ...f,
        imagens: f.imagens.filter((_, idx) => idx !== i),
        previews: f.previews.filter((_, idx) => idx !== i),
      }
    })
  }

  async function toggleAtivo(p: Produto) {
    const tk = token()
    try {
      await axios.put(`${API_URL}/produtos/${p.id}`, { ativo: !p.ativo }, { headers: { Authorization: `Bearer ${tk}` } })
      setProdutos(ps => ps.map(x => x.id === p.id ? { ...x, ativo: !x.ativo } : x))
    } catch { /* silently ignore */ }
  }

  async function deletar(p: Produto) {
    if (!confirm(`Inativar "${p.nome}"?`)) return
    const tk = token()
    try {
      await axios.delete(`${API_URL}/produtos/${p.id}`, { headers: { Authorization: `Bearer ${tk}` } })
      setProdutos(ps => ps.filter(x => x.id !== p.id))
    } catch { /* silently ignore */ }
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    setErroForm('')
    if (!form.nome.trim()) { setErroForm('Nome é obrigatório.'); return }
    if (!form.categoria_id) { setErroForm('Selecione uma categoria.'); return }

    const tk = token()
    if (!tk) { router.replace('/login'); return }
    setEnviando(true)

    const slug = gerarSlug(form.nome)
    const temTamanho = precisaTamanho(form.categoria_slug)

    const variantes = temTamanho && form.tamanhos.length > 0
      ? form.tamanhos.map(t => ({ tamanho: t, qtd_estoque: 0, sku: gerarSku(slug, t) }))
      : [{ qtd_estoque: 0, sku: gerarSku(slug, 'un') }]

    try {
      const { data: novo } = await axios.post(
        `${API_URL}/produtos`,
        { nome: form.nome.trim(), slug, descricao: form.descricao.trim() || undefined, preco: 0, categoria_id: form.categoria_id, variantes },
        { headers: { Authorization: `Bearer ${tk}` } }
      )

      for (let i = 0; i < form.imagens.length; i++) {
        const fd = new FormData()
        fd.append('file', form.imagens[i])
        fd.append('ordem', String(i))
        fd.append('principal', i === 0 ? 'true' : 'false')
        await axios.post(`${API_URL}/admin/produtos/${novo.id}/imagens`, fd, {
          headers: { Authorization: `Bearer ${tk}`, 'Content-Type': 'multipart/form-data' },
        })
      }

      const { data: lista } = await axios.get<Produto[]>(`${API_URL}/produtos`, { headers: { Authorization: `Bearer ${tk}` } })
      setProdutos(lista)
      setOkMsg(`"${form.nome}" adicionado!`)
      setForm(FORM_VAZIO)
      setTimeout(() => { fecharDrawer(); setOkMsg('') }, 1600)
    } catch (e) {
      if (axios.isAxiosError(e) && e.response?.status === 401) {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        router.replace('/login')
        return
      }
      setErroForm(axios.isAxiosError(e) ? (e.response?.data?.detail ?? 'Erro ao criar produto.') : 'Erro inesperado.')
    } finally {
      setEnviando(false)
    }
  }

  const cats = flatCats(categorias)
  const mostraTamanho = form.categoria_slug ? precisaTamanho(form.categoria_slug) : true

  return (
    <div style={{ fontFamily: FONT, minHeight: '100vh', background: '#0a0a0a', color: '#fff' }}>

      {/* Header */}
      <header className="flex items-center justify-between px-8 py-5 border-b border-white/10">
        <span className="text-lg font-bold tracking-widest">
          <span style={{ color: '#003087' }}>JEH</span>
          <span style={{ color: '#ffffff' }}>FASH</span>
          <span style={{ color: '#C8102E' }}>ION</span>
          <span className="text-white/40 text-xs font-normal ml-3 uppercase tracking-[0.2em]">Admin</span>
        </span>
        <button onClick={logout} className="text-white/40 hover:text-white/80 text-xs uppercase tracking-widest transition-colors">
          Sair
        </button>
      </header>

      {/* Main */}
      <main className="max-w-5xl mx-auto px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-semibold tracking-wider text-white/80">Produtos</h2>
          <button
            onClick={abrirDrawer}
            className="flex items-center gap-2 bg-white text-black text-xs font-bold uppercase tracking-widest px-5 py-2.5 rounded-lg hover:bg-white/90 transition-colors"
          >
            <Plus size={14} />
            Novo Produto
          </button>
        </div>

        {loading && <p className="text-white/40 text-sm">Carregando…</p>}
        {erro && <p className="text-red-400 text-sm bg-red-400/10 px-4 py-3 rounded border border-red-400/20">{erro}</p>}
        {!loading && !erro && produtos.length === 0 && (
          <p className="text-white/30 text-sm">Nenhum produto. Clique em &quot;Novo Produto&quot; para começar.</p>
        )}

        {!loading && produtos.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {produtos.map(p => (
              <div key={p.id} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                {p.imagem_principal ? (
                  <img src={p.imagem_principal} alt={p.nome} className="w-full h-44 object-cover" />
                ) : (
                  <div className="w-full h-44 flex items-center justify-center text-white/15 text-xs bg-white/[0.02]">
                    Sem imagem
                  </div>
                )}
                <div className="p-4">
                  <p className="font-semibold text-sm text-white/90 truncate mb-3">{p.nome}</p>
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded font-semibold ${p.ativo ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'}`}>
                      {p.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                    <div className="flex items-center gap-3">
                      <button onClick={() => toggleAtivo(p)} title={p.ativo ? 'Inativar' : 'Ativar'} className="text-white/30 hover:text-white/70 transition-colors">
                        {p.ativo ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                      <button onClick={() => deletar(p)} title="Remover" className="text-white/30 hover:text-red-400 transition-colors">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Drawer overlay */}
      {drawer && (
        <>
          <div className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm" onClick={fecharDrawer} />

          <div className="fixed right-0 top-0 h-full w-full max-w-[420px] bg-[#111111] border-l border-white/10 z-50 flex flex-col shadow-2xl">

            {/* Drawer header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 shrink-0">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-white/70">Novo Produto</span>
              <button onClick={fecharDrawer} className="text-white/40 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Scrollable form */}
            <form id="form-produto" onSubmit={salvar} className="flex-1 overflow-y-auto px-6 py-6 space-y-6">

              {/* Nome */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-white/40 mb-2">Nome *</label>
                <input
                  type="text"
                  value={form.nome}
                  onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
                  placeholder="Ex: Camiseta Polo Armani"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-colors"
                  required
                />
              </div>

              {/* Categoria */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-white/40 mb-2">Categoria *</label>
                <div className="relative">
                  <select
                    value={form.categoria_id}
                    onChange={e => onCategoria(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-white/30 transition-colors appearance-none cursor-pointer"
                    required
                  >
                    <option value="" className="bg-[#111]">Selecione uma categoria</option>
                    {cats.map(c => (
                      <option key={c.id} value={c.id} className="bg-[#111]">
                        {c.nivel === 1 ? `   └ ${c.nome}` : c.nome}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
                </div>
              </div>

              {/* Tamanhos — só para roupas */}
              {form.categoria_id && mostraTamanho && (
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-white/40 mb-3">Tamanhos</label>
                  <div className="flex gap-2">
                    {TAMANHOS.map(t => {
                      const sel = form.tamanhos.includes(t)
                      return (
                        <button
                          key={t}
                          type="button"
                          onClick={() => toggleTamanho(t)}
                          className={`w-12 h-12 text-xs font-bold rounded-lg border transition-all ${
                            sel ? 'bg-white text-black border-white' : 'border-white/20 text-white/50 hover:border-white/50 hover:text-white/80'
                          }`}
                        >
                          {t}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Descrição */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-white/40 mb-2">Descrição</label>
                <textarea
                  value={form.descricao}
                  onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))}
                  placeholder="Descrição opcional do produto…"
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-colors resize-none"
                />
              </div>

              {/* Imagens */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-white/40 mb-2">Imagens</label>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="w-full border border-dashed border-white/20 rounded-xl py-7 flex flex-col items-center gap-2.5 text-white/30 hover:border-white/40 hover:text-white/50 transition-colors"
                >
                  <ImagePlus size={26} />
                  <span className="text-[11px] tracking-wide">Clique para adicionar imagens</span>
                </button>
                <input ref={fileRef} type="file" multiple accept="image/*" className="hidden" onChange={e => onFiles(e.target.files)} />

                {form.previews.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    {form.previews.map((src, i) => (
                      <div key={i} className="relative group/img aspect-square rounded-lg overflow-hidden bg-white/5 border border-white/10">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={src} alt="" className="w-full h-full object-cover" />
                        {i === 0 && (
                          <span className="absolute bottom-1 left-1 bg-white/90 text-black text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide">
                            Principal
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => removerImagem(i)}
                          className="absolute top-1 right-1 bg-black/80 text-white rounded-full p-0.5 opacity-0 group-hover/img:opacity-100 transition-opacity"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {erroForm && (
                <p className="text-red-400 text-xs bg-red-400/10 px-3 py-2.5 rounded-lg border border-red-400/20">
                  {erroForm}
                </p>
              )}
              {okMsg && (
                <p className="text-green-400 text-xs bg-green-400/10 px-3 py-2.5 rounded-lg border border-green-400/20 flex items-center gap-2">
                  <Check size={13} /> {okMsg}
                </p>
              )}
            </form>

            {/* Footer CTA */}
            <div className="px-6 py-5 border-t border-white/10 shrink-0">
              <button
                type="submit"
                form="form-produto"
                disabled={enviando}
                className={`w-full py-4 rounded-xl font-bold text-sm uppercase tracking-widest transition-all ${
                  enviando ? 'bg-white/20 text-white/40 cursor-wait' : 'bg-white text-black hover:bg-white/90 active:scale-[0.98]'
                }`}
              >
                {enviando ? 'Salvando…' : 'Salvar Produto'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
