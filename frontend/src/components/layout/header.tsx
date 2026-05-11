"use client"

import Link from "next/link"
import { Search, X, ChevronDown, Menu } from "lucide-react"
import { useState, useEffect, useRef } from "react"

const MONTSERRAT = "'Montserrat', sans-serif"

const navItems = [
  {
    label: "MARCAS DE ARTISTA!",
    slug: "marcas",
    href: "/produtos?categoria=marcas",
    hasDropdown: true,
    items: [
      { label: "VEJA TODAS AS MARCAS", href: "/produtos?categoria=marcas" },
    ],
  },
  {
    label: "CAMISETAS",
    slug: "camisetas",
    href: "/produtos?categoria=camisetas",
    hasDropdown: true,
    items: [
      { label: "POLO", href: "/produtos?categoria=polo" },
      { label: "GRIFFE", href: "/produtos?categoria=griffe" },
      { label: "TIME", href: "/produtos?categoria=time" },
      { label: "DE ARTISTA", href: "/produtos?categoria=de-artista" },
      { label: "TODAS AS CAMISETAS", href: "/produtos?categoria=camisetas" },
    ],
  },
  {
    label: "CALÇAS",
    slug: "calcas",
    href: "/produtos?categoria=calcas",
    hasDropdown: true,
    items: [
      { label: "JEANS", href: "/produtos?categoria=jeans" },
      { label: "ALFAIATARIA", href: "/produtos?categoria=alfaiataria" },
      { label: "SKINNY", href: "/produtos?categoria=skinny" },
      { label: "RETA", href: "/produtos?categoria=reta" },
      { label: "TODAS AS CALÇAS", href: "/produtos?categoria=calcas" },
    ],
  },
  {
    label: "CHINELOS",
    slug: "chinelos",
    href: "/produtos?categoria=chinelos",
    hasDropdown: false,
  },
  {
    label: "BONÉS",
    slug: "bones",
    href: "/produtos?categoria=bones",
    hasDropdown: false,
  },
  {
    label: "ACESSÓRIOS",
    slug: "acessorios",
    href: "/produtos?categoria=acessorios",
    hasDropdown: true,
    items: [
      { label: "RELÓGIOS", href: "/produtos?categoria=relogios" },
    ],
  },
]

export function Header() {
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [visible, setVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [mobileOpen, setMobileOpen] = useState(false)
  const dropdownTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      setVisible(y < lastScrollY || y < 80)
      if (y > lastScrollY) setActiveDropdown(null)
      setLastScrollY(y)
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [lastScrollY])

  const openDD = (slug: string) => {
    if (dropdownTimer.current) clearTimeout(dropdownTimer.current)
    setActiveDropdown(slug)
  }
  const closeDD = () => {
    dropdownTimer.current = setTimeout(() => setActiveDropdown(null), 130)
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 bg-black transition-transform duration-300 ${
        visible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      {/* Row 1: search | LOGO | mobile toggle */}
      <div className="container relative flex h-14 items-center justify-between">
        {/* Search — expands to the right, white, no blue */}
        <div className="flex items-center w-52">
          {searchOpen ? (
            <div className="flex items-center gap-2 animate-search-open">
              <Search size={16} className="text-white shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Escape" && setSearchOpen(false)}
                className="w-36 bg-transparent border border-white rounded-md px-2 py-1 text-white text-xs focus:outline-none placeholder:text-white/30"
                autoFocus
              />
              <button
                onClick={() => { setSearchOpen(false); setSearchQuery("") }}
                className="text-white/60 hover:text-white transition-colors"
              >
                <X size={15} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setSearchOpen(true)}
              className="text-white/70 hover:text-white transition-colors"
              aria-label="Buscar"
            >
              <Search size={20} />
            </button>
          )}
        </div>

        {/* Logo — absolutely centered */}
        <Link
          href="/"
          className="absolute left-1/2 -translate-x-1/2 text-2xl font-black tracking-widest text-white uppercase whitespace-nowrap"
          style={{ fontFamily: MONTSERRAT }}
        >
          <span style={{ color: "#002395" }}>JEH</span>
          <span style={{ color: "#FFFFFF" }}>FASH</span>
          <span style={{ color: "#ED2939" }}>ION</span>
        </Link>

        {/* Mobile hamburger */}
        <button
          className="lg:hidden text-white/70 hover:text-white w-52 flex justify-end"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
        <div className="hidden lg:block w-52" />
      </div>

      {/* Row 2: Desktop nav */}
      <div className="hidden lg:block border-t border-white/10">
        <nav className="container flex items-center justify-center gap-7 h-11">
          {navItems.map((item) => (
            <div
              key={item.slug}
              className="relative"
              onMouseEnter={() => item.hasDropdown ? openDD(item.slug) : undefined}
              onMouseLeave={item.hasDropdown ? closeDD : undefined}
            >
              <Link
                href={item.href}
                className="flex items-center gap-0.5 text-[11px] font-bold text-white uppercase tracking-wider hover:text-white/60 transition-colors whitespace-nowrap"
                style={{ fontFamily: MONTSERRAT }}
              >
                {item.label}
                {item.hasDropdown && (
                  <ChevronDown size={11} className="text-white/50 mt-0.5" />
                )}
              </Link>

              {item.hasDropdown && activeDropdown === item.slug && (
                <div
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-black border border-white/15 rounded-md shadow-2xl z-50 min-w-[200px] py-1 overflow-hidden"
                  onMouseEnter={() => openDD(item.slug)}
                  onMouseLeave={closeDD}
                >
                  {item.items?.map((sub) => (
                    <Link
                      key={sub.href}
                      href={sub.href}
                      className="block px-5 py-2.5 text-[11px] font-semibold text-white/65 uppercase tracking-wide hover:bg-white/5 hover:text-white transition-colors"
                      style={{ fontFamily: MONTSERRAT }}
                    >
                      {sub.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-white/10 bg-black">
          <nav className="container py-4 flex flex-col gap-1">
            {navItems.map((item) => (
              <Link
                key={item.slug}
                href={item.href}
                className="py-2.5 text-xs font-bold text-white uppercase tracking-wider hover:text-white/60 transition-colors border-b border-white/5"
                style={{ fontFamily: MONTSERRAT }}
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}
