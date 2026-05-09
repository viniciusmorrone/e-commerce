import Link from "next/link"
import { Instagram, Facebook, Mail } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t bg-muted/40">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4">JehFashion</h3>
            <p className="text-sm text-muted-foreground">
              Moda que inspira. Estilo que transforma.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Categorias</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/produtos?categoria=masculino" className="text-muted-foreground hover:text-foreground">
                  Masculino
                </Link>
              </li>
              <li>
                <Link href="/produtos?categoria=acessorios" className="text-muted-foreground hover:text-foreground">
                  Acessórios
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Atendimento</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://wa.me/5511934855599"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground"
                >
                  WhatsApp
                </a>
              </li>
              <li>
                <Link href="/sobre" className="text-muted-foreground hover:text-foreground">
                  Sobre Nós
                </Link>
              </li>
              <li>
                <Link href="/contato" className="text-muted-foreground hover:text-foreground">
                  Contato
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Redes Sociais</h4>
            <div className="flex gap-4">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground"
              >
                <Instagram size={20} />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground"
              >
                <Facebook size={20} />
              </a>
              <a
                href="mailto:contato@jehfashion.com"
                className="text-muted-foreground hover:text-foreground"
              >
                <Mail size={20} />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} JehFashion. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
