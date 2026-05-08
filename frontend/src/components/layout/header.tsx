"use client"

import Link from "next/link"
import { Menu, Search, ShoppingBag, X } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <button
            className="lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <Link href="/" className="text-2xl font-bold tracking-tight">
            JehFashion
          </Link>

          <nav className="hidden lg:flex items-center gap-6">
            <Link href="/produtos" className="text-sm font-medium hover:underline">
              Todos os Produtos
            </Link>
            <Link href="/produtos?categoria=feminino" className="text-sm font-medium hover:underline">
              Feminino
            </Link>
            <Link href="/produtos?categoria=masculino" className="text-sm font-medium hover:underline">
              Masculino
            </Link>
            <Link href="/produtos?categoria=acessorios" className="text-sm font-medium hover:underline">
              Acessórios
            </Link>
            <Link href="/produtos?categoria=calcados" className="text-sm font-medium hover:underline">
              Calçados
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon">
            <Search size={20} />
          </Button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden border-t">
          <nav className="container py-4 flex flex-col gap-4">
            <Link
              href="/produtos"
              className="text-sm font-medium hover:underline"
              onClick={() => setMobileMenuOpen(false)}
            >
              Todos os Produtos
            </Link>
            <Link
              href="/produtos?categoria=feminino"
              className="text-sm font-medium hover:underline"
              onClick={() => setMobileMenuOpen(false)}
            >
              Feminino
            </Link>
            <Link
              href="/produtos?categoria=masculino"
              className="text-sm font-medium hover:underline"
              onClick={() => setMobileMenuOpen(false)}
            >
              Masculino
            </Link>
            <Link
              href="/produtos?categoria=acessorios"
              className="text-sm font-medium hover:underline"
              onClick={() => setMobileMenuOpen(false)}
            >
              Acessórios
            </Link>
            <Link
              href="/produtos?categoria=calcados"
              className="text-sm font-medium hover:underline"
              onClick={() => setMobileMenuOpen(false)}
            >
              Calçados
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
