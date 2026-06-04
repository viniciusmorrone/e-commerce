'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { adminProdutosApi, categoriasApi, type Categoria, type ProdutoFormPayload, type ProdutoListItem } from '@/lib/api'
import { cn } from '@/lib/utils'

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

interface ProdutoFormState {
  nome: string
  slug: string
  descricao: string
  preco: string
  categoria_id: string
  ativo: boolean
  imagem_principal: string
  imagens_secundarias: string[]
}

const initialFormState: ProdutoFormState = {
  nome: '',
  slug: '',
  descricao: '',
  preco: '',
  categoria_id: '',
  ativo: true,
  imagem_principal: '',
  imagens_secundarias: ['', '', ''],
}

function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function StatCard({ label, value, accent = false }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className={cn(
      "bg-white/5 border border-white/10 rounded-xl px-5 py-4 flex flex-col gap-1",
      accent && "border-[#C8102E]/30 bg-[#C8102E]/5"
    )}>
      <span className="text-white/40 text-[10px] uppercase tracking-[0.2em] font-medium">{label}</span>
      <span className={cn(
        "text-3xl font-bold tracking-tight",
        accent ? "text-[#C8102E]" : "text-white"
      )}>
        {value}
      </span>
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="block text-[10px] uppercase tracking-[0.25em] font-semibold text-white/30 mb-3">
      {children}
    </span>
  )
}

function normalizeSecondaryImages(images?: string[]) {
  return Array.from({ length: 3 }, (_, index) => images?.[index] ?? '')
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
  const [produtos, setProdutos] = useState<ProdutoListItem[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [erro, setErro] = useState('')
  const [feedback, setFeedback] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<ProdutoFormState>(initialFormState)

  const categoriasDisponiveis = useMemo(() => {
    const flat: Categoria[] = []

    const visit = (categoria: Categoria) => {
      flat.push(categoria)
      categoria.subcategorias.forEach(visit)
    }

    categorias.forEach(visit)

    return flat
  }, [categorias])

  const stats = useMemo(() => {
    const total = produtos.length
    const ativos = produtos.filter(p => p.ativo).length
    const inativos = total - ativos
    return { total, ativos, inativos }
  }, [produtos])

  useEffect(() => {
    const tk = token()
    if (!tk) { router.replace('/login'); return }

    Promise.all([adminProdutosApi.listar(), categoriasApi.listar()])
      .then(([produtosResponse, categoriasResponse]) => {
        setProdutos(produtosResponse)
        setCategorias(categoriasResponse)
        setForm(current => ({
          ...current,
          categoria_id: current.categoria_id || categoriasResponse[0]?.id || '',
        }))
      })
      .catch(e => {
        if (axios.isAxiosError(e) && e.response?.status === 401) {
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          router.replace('/login')
        } else {
          setErro('Erro ao carregar o painel administrativo.')
        }
      })
      .finally(() => setLoading(false))
  }, [router])

  function resetForm() {
    setEditingId(null)
    setForm({
      ...initialFormState,
      categoria_id: categoriasDisponiveis[0]?.id || '',
      imagens_secundarias: normalizeSecondaryImages(),
    })
  }

  function handleSecondaryImageChange(index: number, value: string) {
    const nextImages = normalizeSecondaryImages(form.imagens_secundarias)
    nextImages[index] = value
    handleFieldChange('imagens_secundarias', nextImages)
  }

  function handleFieldChange<K extends keyof ProdutoFormState>(field: K, value: ProdutoFormState[K]) {
    setForm(current => ({
      ...current,
      [field]: value,
    }))
    setFeedback('')
    setErro('')
  }

  function handleNameChange(value: string) {
    setForm(current => {
      const nextSlug = current.slug === '' || current.slug === slugify(current.nome) ? slugify(value) : current.slug

      return {
        ...current,
        nome: value,
        slug: nextSlug,
      }
    })
    setFeedback('')
    setErro('')
  }

  function startEdit(produto: ProdutoListItem) {
    setEditingId(produto.id)
    setFeedback('')
    setErro('')
    setForm({
      nome: produto.nome,
      slug: produto.slug,
      descricao: produto.descricao ?? '',
      preco: Number(produto.preco).toString(),
      categoria_id: produto.categoria_id,
      ativo: produto.ativo,
      imagem_principal: produto.imagem_principal ?? '',
      imagens_secundarias: normalizeSecondaryImages(produto.imagens_secundarias),
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function reloadProdutos() {
    const produtosResponse = await adminProdutosApi.listar()
    setProdutos(produtosResponse)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!form.categoria_id) {
      setErro('Cadastre ao menos uma categoria antes de salvar produtos.')
      return
    }

    const preco = Number(form.preco)
    if (Number.isNaN(preco) || preco < 0) {
      setErro('Informe um preço válido.')
      return
    }

    const payload: ProdutoFormPayload = {
      nome: form.nome.trim(),
      slug: form.slug.trim(),
      descricao: form.descricao.trim() || undefined,
      preco,
      categoria_id: form.categoria_id,
      ativo: form.ativo,
      imagem_principal: form.imagem_principal.trim() || null,
      imagens_secundarias: form.imagens_secundarias.map(url => url.trim()).filter(url => url !== ''),
    }

    if (!payload.nome || !payload.slug) {
      setErro('Preencha nome e slug do produto.')
      return
    }

    setSaving(true)
    setErro('')
    setFeedback('')

    try {
      if (editingId) {
        await adminProdutosApi.atualizar(editingId, payload)
        setFeedback('Produto atualizado com sucesso.')
      } else {
        await adminProdutosApi.criar(payload)
        setFeedback('Produto criado com sucesso.')
      }

      await reloadProdutos()
      resetForm()
    } catch (e) {
      if (axios.isAxiosError(e)) {
        if (e.response?.status === 401) {
          logout()
          return
        }

        const detail = typeof e.response?.data?.detail === 'string' ? e.response.data.detail : null
        setErro(detail ?? 'Não foi possível salvar o produto.')
      } else {
        setErro('Não foi possível salvar o produto.')
      }
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(produto: ProdutoListItem) {
    if (!window.confirm(`Deseja inativar o produto "${produto.nome}"?`)) {
      return
    }

    setDeletingId(produto.id)
    setErro('')
    setFeedback('')

    try {
      await adminProdutosApi.deletar(produto.id)
      if (editingId === produto.id) {
        resetForm()
      }
      await reloadProdutos()
      setFeedback('Produto inativado com sucesso.')
    } catch (e) {
      if (axios.isAxiosError(e) && e.response?.status === 401) {
        logout()
        return
      }

      setErro('Não foi possível inativar o produto.')
    } finally {
      setDeletingId(null)
    }
  }

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
      <header className="border-b border-white/10 bg-black/20">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="text-lg font-bold tracking-widest">
              <span style={{ color: '#003087' }}>JEH</span>
              <span style={{ color: '#ffffff' }}>FASH</span>
              <span style={{ color: '#C8102E' }}>ION</span>
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-[0.3em] text-white/30 bg-white/5 px-3 py-1 rounded-full">
                Admin
              </span>
            </div>
          </div>
          <button
            onClick={logout}
            className="text-white/30 hover:text-white/70 text-xs uppercase tracking-widest transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sair
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-white">Gestão de Produtos</h1>
          <p className="text-white/40 text-sm mt-1">Cadastre e gerencie os produtos da loja</p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <StatCard label="Total de Produtos" value={stats.total} />
          <StatCard label="Produtos Ativos" value={stats.ativos} accent />
          <StatCard label="Produtos Inativos" value={stats.inativos} />
        </div>

        <div className="grid gap-8 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <div className={cn(
              "bg-white/5 border border-white/10 rounded-2xl p-6 transition-all",
              editingId && "border-[#C8102E]/40"
            )}>
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-base font-semibold tracking-wide text-white">
                    {editingId ? 'Editar produto' : 'Novo produto'}
                  </h2>
                  <p className="text-white/30 text-[11px] mt-1.5">
                    {editingId ? 'Alterando dados existentes' : 'Preencha os dados do produto'}
                  </p>
                </div>
                {editingId && (
                  <span className="text-[10px] uppercase tracking-wider text-[#C8102E] bg-[#C8102E]/10 px-2 py-1 rounded">
                    Editando
                  </span>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <SectionLabel>Informações básicas</SectionLabel>
                  <div className="space-y-4">
                    <label className="block">
                      <span className="block text-white/50 text-[11px] uppercase tracking-wider mb-2">Nome do produto</span>
                      <input
                        value={form.nome}
                        onChange={event => handleNameChange(event.target.value)}
                        required
                        placeholder="Ex: Camiseta Oversized"
                        className="w-full bg-black/40 border border-white/10 rounded-lg text-white px-4 py-2.5 text-sm outline-none focus:border-white/25 transition-colors placeholder:text-white/20"
                      />
                    </label>

                    <label className="block">
                      <span className="block text-white/50 text-[11px] uppercase tracking-wider mb-2">Slug (URL)</span>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 text-sm">/</span>
                        <input
                          value={form.slug}
                          onChange={event => handleFieldChange('slug', slugify(event.target.value))}
                          required
                          placeholder="camiseta-oversized"
                          className="w-full bg-black/40 border border-white/10 rounded-lg text-white pl-7 pr-4 py-2.5 text-sm outline-none focus:border-white/25 transition-colors placeholder:text-white/20"
                        />
                      </div>
                    </label>
                  </div>
                </div>

                <div>
                  <SectionLabel>Detalhes</SectionLabel>
                  <label className="block">
                    <span className="block text-white/50 text-[11px] uppercase tracking-wider mb-2">Descrição</span>
                    <textarea
                      value={form.descricao}
                      onChange={event => handleFieldChange('descricao', event.target.value)}
                      rows={3}
                      placeholder="Descreva as características do produto..."
                      className="w-full bg-black/40 border border-white/10 rounded-lg text-white px-4 py-2.5 text-sm outline-none focus:border-white/25 transition-colors resize-none placeholder:text-white/20"
                    />
                  </label>
                </div>

                <div>
                  <SectionLabel>Preço e categoria</SectionLabel>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="block">
                      <span className="block text-white/50 text-[11px] uppercase tracking-wider mb-2">Preço</span>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-sm">R$</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          inputMode="decimal"
                          value={form.preco}
                          onChange={event => handleFieldChange('preco', event.target.value)}
                          required
                          placeholder="0,00"
                          className="w-full bg-black/40 border border-white/10 rounded-lg text-white pl-9 pr-4 py-2.5 text-sm outline-none focus:border-white/25 transition-colors placeholder:text-white/20"
                        />
                      </div>
                    </label>

                    <label className="block">
                      <span className="block text-white/50 text-[11px] uppercase tracking-wider mb-2">Categoria</span>
                      <select
                        value={form.categoria_id}
                        onChange={event => handleFieldChange('categoria_id', event.target.value)}
                        required
                        disabled={categoriasDisponiveis.length === 0}
                        className="w-full bg-black/40 border border-white/10 rounded-lg text-white px-4 py-2.5 text-sm outline-none focus:border-white/25 transition-colors disabled:opacity-40 cursor-not-allowed"
                      >
                        {categoriasDisponiveis.length === 0 ? (
                          <option value="">Sem categorias</option>
                        ) : (
                          categoriasDisponiveis.map(categoria => (
                            <option key={categoria.id} value={categoria.id}>
                              {categoria.nome}
                            </option>
                          ))
                        )}
                      </select>
                    </label>
                  </div>
                </div>

                <div>
                  <SectionLabel>Visibilidade</SectionLabel>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className={cn(
                      "relative w-10 h-5 rounded-full transition-colors",
                      form.ativo ? "bg-[#C8102E]" : "bg-white/10"
                    )}>
                      <div className={cn(
                        "absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all",
                        form.ativo ? "left-5" : "left-0.5"
                      )} />
                    </div>
                    <input
                      type="checkbox"
                      checked={form.ativo}
                      onChange={event => handleFieldChange('ativo', event.target.checked)}
                      className="sr-only"
                    />
                    <span className="text-sm text-white/60 group-hover:text-white/80 transition-colors">
                      {form.ativo ? 'Produto visível na loja' : 'Produto oculto da loja'}
                    </span>
                  </label>
                </div>

                <div>
                  <SectionLabel>Imagens</SectionLabel>
                  <div className="space-y-3">
                    <label className="block">
                      <span className="block text-white/50 text-[11px] uppercase tracking-wider mb-2">Imagem principal (capa)</span>
                      <input
                        type="url"
                        value={form.imagem_principal}
                        onChange={event => handleFieldChange('imagem_principal', event.target.value)}
                        placeholder="https://exemplo.com/imagem-principal.jpg"
                        className="w-full bg-black/40 border border-white/10 rounded-lg text-white px-4 py-2.5 text-sm outline-none focus:border-white/25 transition-colors placeholder:text-white/20"
                      />
                    </label>

                    <label className="block">
                      <span className="block text-white/50 text-[11px] uppercase tracking-wider mb-2">Imagem secundária 1</span>
                      <input
                        type="url"
                        value={form.imagens_secundarias[0]}
                        onChange={event => handleSecondaryImageChange(0, event.target.value)}
                        placeholder="https://exemplo.com/imagem-secundaria-1.jpg"
                        className="w-full bg-black/40 border border-white/10 rounded-lg text-white px-4 py-2.5 text-sm outline-none focus:border-white/25 transition-colors placeholder:text-white/20"
                      />
                    </label>

                    <label className="block">
                      <span className="block text-white/50 text-[11px] uppercase tracking-wider mb-2">Imagem secundária 2</span>
                      <input
                        type="url"
                        value={form.imagens_secundarias[1]}
                        onChange={event => handleSecondaryImageChange(1, event.target.value)}
                        placeholder="https://exemplo.com/imagem-secundaria-2.jpg"
                        className="w-full bg-black/40 border border-white/10 rounded-lg text-white px-4 py-2.5 text-sm outline-none focus:border-white/25 transition-colors placeholder:text-white/20"
                      />
                    </label>

                    <label className="block">
                      <span className="block text-white/50 text-[11px] uppercase tracking-wider mb-2">Imagem secundária 3</span>
                      <input
                        type="url"
                        value={form.imagens_secundarias[2]}
                        onChange={event => handleSecondaryImageChange(2, event.target.value)}
                        placeholder="https://exemplo.com/imagem-secundaria-3.jpg"
                        className="w-full bg-black/40 border border-white/10 rounded-lg text-white px-4 py-2.5 text-sm outline-none focus:border-white/25 transition-colors placeholder:text-white/20"
                      />
                    </label>
                  </div>
                </div>

                {feedback && (
                  <div className="flex items-center gap-3 text-emerald-400 text-sm bg-emerald-400/10 px-4 py-3 rounded-lg border border-emerald-400/20">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feedback}
                  </div>
                )}

                {erro && (
                  <div className="flex items-center gap-3 text-red-400 text-sm bg-red-400/10 px-4 py-3 rounded-lg border border-red-400/20">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {erro}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={saving || categoriasDisponiveis.length === 0}
                  className="w-full bg-white text-black font-semibold py-3 rounded-lg text-sm uppercase tracking-widest hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Salvando...
                    </>
                  ) : editingId ? (
                    'Salvar alterações'
                  ) : (
                    'Criar produto'
                  )}
                </button>

                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="w-full border border-white/10 text-white/50 py-2.5 rounded-lg text-xs uppercase tracking-widest hover:bg-white/5 hover:text-white/70 transition-colors"
                  >
                    Cancelar edição
                  </button>
                )}
              </form>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-semibold tracking-wide text-white">Produtos</h2>
                <p className="text-white/30 text-[11px] mt-1">Clique em um produto para editar</p>
              </div>
              <span className="text-white/30 text-xs uppercase tracking-wider">
                {produtos.length} {produtos.length === 1 ? 'item' : 'itens'}
              </span>
            </div>

            {loading && (
              <div className="flex items-center justify-center py-16">
                <div className="flex items-center gap-3 text-white/40">
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span className="text-sm">Carregando produtos...</span>
                </div>
              </div>
            )}

            {!loading && produtos.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <p className="text-white/40 text-sm">Nenhum produto cadastrado</p>
                <p className="text-white/20 text-xs mt-1">Use o formulário ao lado para criar o primeiro</p>
              </div>
            )}

            {!loading && produtos.length > 0 && (
              <div className="space-y-3">
                {produtos.map((produto, index) => (
                  <div
                    key={produto.id}
                    onClick={() => startEdit(produto)}
                    className={cn(
                      "bg-white/5 border border-white/10 rounded-xl p-4 cursor-pointer transition-all hover:bg-white/8 hover:border-white/15 group",
                      editingId === produto.id && "border-[#C8102E]/40 bg-[#C8102E]/5",
                      index === 0 && "mt-0"
                    )}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-lg bg-black/30 overflow-hidden flex-shrink-0 border border-white/5">
                        {produto.imagem_principal ? (
                          <img
                            src={produto.imagem_principal}
                            alt={produto.nome}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-white/15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-semibold text-sm text-white/90 truncate">{produto.nome}</p>
                            <p className="text-white/25 text-[11px] mt-0.5 truncate">/{produto.slug}</p>
                          </div>
                          <span className={cn(
                            "flex-shrink-0 text-[10px] uppercase tracking-wider px-2 py-1 rounded-full font-medium",
                            produto.ativo
                              ? 'bg-emerald-500/15 text-emerald-400'
                              : 'bg-red-500/15 text-red-400'
                          )}>
                            {produto.ativo ? 'Ativo' : 'Inativo'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          <p className="text-white/60 text-sm font-medium">
                            R$ {Number(produto.preco).toFixed(2).replace('.', ',')}
                          </p>
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                startEdit(produto)
                              }}
                              className="px-3 py-1.5 rounded-md border border-white/15 text-white/60 hover:text-white hover:border-white/25 text-[11px] uppercase tracking-wider transition-colors"
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDelete(produto)
                              }}
                              disabled={deletingId === produto.id}
                              className="px-3 py-1.5 rounded-md border border-red-500/20 text-red-400/80 hover:text-red-300 hover:border-red-400/40 text-[11px] uppercase tracking-wider transition-colors disabled:opacity-40"
                            >
                              {deletingId === produto.id ? '...' : 'Inativar'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
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
