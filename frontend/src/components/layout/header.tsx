"use client"

import Link from "next/link"
import { Menu, Search, X } from "lucide-react"
import { useState } from "react"

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      <div className="container flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <button
            className="lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <Link href="/" className="text-2xl font-bold tracking-tight shrink-0">
            <span className="text-[#002395]">Jeh</span><span className="text-[#ED2939]">Fashion</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-6">
            <Link href="/produtos" className="text-sm font-medium hover:text-[#002395] transition-colors">
              Todos os Produtos
            </Link>
            <Link href="/produtos?categoria=masculino" className="text-sm font-medium hover:text-[#002395] transition-colors">
              Masculino
            </Link>
            <Link href="/produtos?categoria=acessorios" className="text-sm font-medium hover:text-[#002395] transition-colors">
              Acessórios
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {searchOpen ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Buscar produtos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 md:w-64 px-3 py-1.5 text-sm border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#002395]"
                autoFocus
              />
              <button
                className="p-1.5 bg-[#002395] text-white rounded-md hover:bg-[#001a7a] transition-colors"
              >
                <Search size={16} />
              </button>
              <button
                onClick={() => { setSearchOpen(false); setSearchQuery("") }}
                className="p-1.5 text-neutral-500 hover:text-neutral-800"
              >
                <X size={18} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-neutral-500 border border-neutral-200 rounded-md hover:border-neutral-400 transition-colors"
            >
              <Search size={16} />
              <span className="hidden md:inline">Buscar...</span>
            </button>
          )}
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden border-t bg-white">
          <nav className="container py-4 flex flex-col gap-4">
            <Link
              href="/produtos"
              className="text-sm font-medium hover:text-[#002395]"
              onClick={() => setMobileMenuOpen(false)}
            >
              Todos os Produtos
            </Link>
            <Link
              href="/produtos?categoria=masculino"
              className="text-sm font-medium hover:text-[#002395]"
              onClick={() => setMobileMenuOpen(false)}
            >
              Masculino
            </Link>
            <Link
              href="/produtos?categoria=acessorios"
              className="text-sm font-medium hover:text-[#002395]"
              onClick={() => setMobileMenuOpen(false)}
            >
              Acessórios
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
