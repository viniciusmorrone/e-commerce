# JehFashion - Frontend

Frontend moderno.

## 🎨 Design

- **Estilo**: Minimalista, moderno, clean
- **Cores**: Preto, branco, cinza com toques terrosos
- **Inspiração**: Nike (bold, minimalista) + Monte Leste (elegante, neutro)

## 🛠️ Stack

- **Next.js 14** - React framework com App Router
- **TypeScript** - Type safety
- **TailwindCSS** - Styling
- **Lucide Icons** - Ícones modernos
- **Axios** - HTTP client

## 🚀 Quick Start

### Instalar dependências

```bash
npm install
```

### Configurar variáveis de ambiente

```bash
cp .env.local.example .env.local
# Editar .env.local com a URL da API
```

### Executar em desenvolvimento

```bash
npm run dev
```

Acesse: http://localhost:3000

### Build para produção

```bash
npm run build
npm start
```

## 📁 Estrutura

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Layout principal
│   ├── page.tsx           # Homepage
│   └── globals.css        # Estilos globais
├── components/
│   ├── layout/            # Header, Footer
│   ├── home/              # Componentes da home
│   └── ui/                # Componentes reutilizáveis
└── lib/
    ├── api.ts             # Cliente API
    └── utils.ts           # Utilitários
```

## 🎯 Features

- ✅ Homepage com hero section
- ✅ Categorias com imagens
- ✅ Produtos em destaque
- ✅ Newsletter
- ✅ Header responsivo
- ✅ Footer com links
- ✅ Integração com API
- ✅ Loading states
- ✅ Mobile-first design

## 📱 Páginas

- `/` - Homepage
- `/produtos` - Listagem de produtos
- `/produtos/[slug]` - Detalhes do produto
- `/produtos?categoria=feminino` - Filtro por categoria

## 🔗 API Integration

O frontend consome a API FastAPI:

- `GET /produtos` - Lista produtos
- `GET /produtos/{slug}` - Detalhes
- `GET /produtos/{slug}/whatsapp` - Link WhatsApp
- `GET /categorias` - Categorias

## 🎨 Customização

Edite `tailwind.config.ts` para personalizar cores e temas.

## 📄 Licença

Projeto privado - JehFashion © 2026
