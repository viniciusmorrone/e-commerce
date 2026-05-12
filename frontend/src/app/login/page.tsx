'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'
const FONT = "'Montserrat', sans-serif"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPass, setShowPass] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await axios.post(`${API_URL}/admin/auth/login`, { email, password })
      localStorage.setItem('access_token', data.access_token)
      localStorage.setItem('refresh_token', data.refresh_token)
      router.push('/admin')
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        if (!err.response) {
          setError('Não foi possível conectar ao servidor.')
        } else if (err.response.status === 401 || err.response.status === 403) {
          setError('Email ou senha incorretos.')
        } else {
          setError(`Erro ${err.response.status}: tente novamente.`)
        }
      } else {
        setError('Erro inesperado. Tente novamente.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{ fontFamily: FONT, minHeight: '100vh', background: '#0a0a0a' }}
      className="flex items-center justify-center px-4"
    >
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold tracking-widest mb-1" style={{ letterSpacing: '0.25em' }}>
            <span style={{ color: '#003087' }}>JEH</span>
            <span style={{ color: '#ffffff' }}>FASH</span>
            <span style={{ color: '#C8102E' }}>ION</span>
          </h1>
          <p className="text-white/40 text-xs uppercase tracking-[0.3em] mt-2">Painel Administrativo</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white/60 text-xs uppercase tracking-widest mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full bg-white/5 border border-white/10 rounded text-white px-4 py-3 text-sm outline-none focus:border-white/30 transition-colors"
            />
          </div>

          <div>
            <label className="block text-white/60 text-xs uppercase tracking-widest mb-2">Senha</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full bg-white/5 border border-white/10 rounded text-white px-4 py-3 text-sm outline-none focus:border-white/30 transition-colors pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPass(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 text-xs uppercase tracking-wider transition-colors"
              >
                {showPass ? 'ocultar' : 'ver'}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-red-400 text-xs text-center py-2 bg-red-400/10 rounded border border-red-400/20">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black font-semibold py-3 rounded text-sm uppercase tracking-widest hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading ? 'Entrando…' : 'Entrar'}
          </button>
        </form>

        <p className="text-white/15 text-[10px] text-center mt-8 uppercase tracking-widest">Acesso restrito</p>
      </div>
    </div>
  )
}
