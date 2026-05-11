import Link from "next/link"

const MONTSERRAT = "'Montserrat', sans-serif"

const colecoes = [
  {
    name: "CAMISETAS",
    slug: "camisetas",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=560&fit=crop",
  },
  {
    name: "CALÇAS",
    slug: "calcas",
    image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=560&fit=crop",
  },
  {
    name: "CHINELOS",
    slug: "chinelos",
    image: "https://images.unsplash.com/photo-1603487742131-4160ec999306?w=400&h=560&fit=crop",
  },
  {
    name: "BONÉS",
    slug: "bones",
    image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400&h=560&fit=crop",
  },
  {
    name: "ACESSÓRIOS",
    slug: "acessorios",
    image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=400&h=560&fit=crop",
  },
]

export function Categories() {
  return (
    <section className="py-16 bg-black">
      <div className="container">
        <p
          className="text-center text-xs font-bold tracking-[0.35em] text-white/40 mb-10 uppercase"
          style={{ fontFamily: MONTSERRAT }}
        >
          COLEÇÕES
        </p>

        <div className="flex gap-3 justify-center flex-wrap md:flex-nowrap">
          {colecoes.map((col) => (
            <Link
              key={col.slug}
              href={`/produtos?categoria=${col.slug}`}
              className="group relative overflow-hidden rounded-2xl flex-shrink-0 w-[178px] h-[240px] bg-neutral-900 cursor-pointer transition-all duration-300 ease-out hover:-translate-y-[10px] hover:shadow-[0_24px_60px_rgba(255,255,255,0.07)]"
            >
              {/* Product image */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                style={{ backgroundImage: `url(${col.image})` }}
              />
              {/* Dark overlay */}
              <div className="absolute inset-0 bg-black/52 group-hover:bg-black/38 transition-colors duration-300" />

              {/* Big watermark text stacked - style Boneti */}
              <div className="absolute inset-0 flex flex-col justify-center overflow-hidden pointer-events-none select-none">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="block text-white font-black leading-none w-full text-left px-1"
                    style={{
                      fontFamily: MONTSERRAT,
                      fontSize: "2.4rem",
                      opacity: 0.16,
                      letterSpacing: "-0.03em",
                    }}
                  >
                    {col.name}
                  </span>
                ))}
              </div>

              {/* Bottom label */}
              <div className="absolute bottom-0 left-0 right-0 px-4 pb-4">
                <span
                  className="block text-white font-black text-sm tracking-widest uppercase"
                  style={{ fontFamily: MONTSERRAT }}
                >
                  {col.name}
                </span>
                <span className="block text-white/40 text-[10px] mt-0.5 group-hover:text-white/60 transition-colors">
                  Ver coleção →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
