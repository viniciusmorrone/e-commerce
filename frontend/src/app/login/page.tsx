"use client"

import { useState, useEffect, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, LogIn } from "lucide-react"
import { authApi } from "@/lib/api"

const MONTSERRAT = "'Montserrat', sans-serif"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem("access_token")) {
      router.replace("/admin")
    }
  }, [router])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const { access_token, refresh_token } = await authApi.login({ email, password })
      localStorage.setItem("access_token", access_token)
      localStorage.setItem("refresh_token", refresh_token)
      router.push("/admin")
    } catch (_e: unknown) {
      setError("Email ou senha incorretos.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[200] bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <h1
            className="text-3xl font-black tracking-widest uppercase"
            style={{ fontFamily: MONTSERRAT }}
          >
            <span style={{ color: "#002395" }}>JEH</span>
            <span style={{ color: "#FFFFFF" }}>FASH</span>
            <span style={{ color: "#ED2939" }}>ION</span>
          </h1>
          <p className="text-white/30 text-[11px] tracking-[0.3em] uppercase mt-2" style={{ fontFamily: MONTSERRAT }}>
            Painel Administrativo
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-widest text-white/40 mb-2" style={{ fontFamily: MONTSERRAT }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full bg-transparent border border-white/20 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-white/60 transition-colors placeholder:text-white/20"
              placeholder="admin@jehfashion.com"
              style={{ fontFamily: MONTSERRAT }}
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-widest text-white/40 mb-2" style={{ fontFamily: MONTSERRAT }}>
              Senha
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full bg-transparent border border-white/20 rounded-lg px-4 py-3 pr-11 text-white text-sm focus:outline-none focus:border-white/60 transition-colors placeholder:text-white/20"
                placeholder="••••••••"
                style={{ fontFamily: MONTSERRAT }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-red-400 text-xs text-center py-2 bg-red-500/10 rounded-lg border border-red-500/20" style={{ fontFamily: MONTSERRAT }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-white text-black font-black text-sm uppercase tracking-widest py-3.5 rounded-full hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            style={{ fontFamily: MONTSERRAT }}
          >
            <LogIn size={16} />
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="text-white/15 text-[10px] text-center mt-8 uppercase tracking-widest" style={{ fontFamily: MONTSERRAT }}>
          Acesso restrito
        </p>
      </div>
    </div>
  )
}
