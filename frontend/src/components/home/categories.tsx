import Link from "next/link"
import { ArrowRight } from "lucide-react"

const categories = [
  {
    name: "Masculino",
    slug: "masculino",
    image: "https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=800&h=600&fit=crop",
    description: "Roupas e looks masculinos exclusivos",
  },
  {
    name: "Acessórios",
    slug: "acessorios",
    image: "https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?w=800&h=600&fit=crop",
    description: "Relógios, óculos e muito mais",
  },
]

export function Categories() {
  return (
    <section className="py-16 bg-neutral-50">
      <div className="container">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Explore por Categoria
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/produtos?categoria=${category.slug}`}
              className="group relative overflow-hidden rounded-lg aspect-[3/4] bg-neutral-200"
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-110"
                style={{ backgroundImage: `url(${category.image})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h3 className="text-2xl font-bold mb-1">{category.name}</h3>
                <p className="text-sm text-neutral-300 mb-2">{category.description}</p>
                <div className="flex items-center gap-2 text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                  Ver produtos
                  <ArrowRight size={16} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
