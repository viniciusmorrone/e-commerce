# 👗 JehFashion

E-commerce moderno de moda.

## 🎨 Design

- **Estilo**: Minimalista, moderno, clean
- **Cores**: Preto, branco, cinza com toques terrosos
- **UX**: Navegação fluida, foco em produto, conversão via WhatsApp

## 🛠️ Stack

### Backend
- **FastAPI** - Framework web async
- **PostgreSQL** - Banco de dados relacional
- **Redis** - Cache e rate limiting
- **SQLAlchemy** - ORM
- **Alembic** - Migrations
- **JWT** - Autenticação
- **Cloudinary** - Storage de imagens

### Frontend
- **Next.js 14** - React framework com App Router
- **TypeScript** - Type safety
- **TailwindCSS** - Styling
- **shadcn/ui** - Componentes
- **Lucide** - Ícones

## 🚀 Quick Start

### Pré-requisitos
- Python 3.11+
- Docker & Docker Compose
- Node.js 18+

### Setup Backend

```bash
cd backend

# Windows
.\scripts\setup.ps1

# Linux/Mac
chmod +x scripts/setup.sh
./scripts/setup.sh
```

### Configurar .env

```bash
cp backend/.env.example backend/.env
# Editar .env com suas credenciais
```

### Iniciar Desenvolvimento

```bash
# Subir banco de dados
docker-compose up -d postgres redis

# Iniciar API
cd backend
uvicorn app.main:app --reload
```

Acesse:
- **API**: http://localhost:8000
- **Docs**: http://localhost:8000/api/v1/docs

## 📱 Integração WhatsApp

Número configurado: **5511934855599**

Fluxo:
1. Cliente clica em "Tenho Interesse"
2. API gera link `wa.me/5511972648135?text=...`
3. Mensagem pré-formatada com produto, preço e variante

## 🔐 Admin Padrão

- **Email**: jeh@gmail.com
- **Senha**: Configurar no `.env`

## 📦 Estrutura do Projeto

```
loja_jeh/
├── backend/              # FastAPI
│   ├── app/
│   │   ├── api/         # Rotas
│   │   ├── core/        # Config, segurança
│   │   ├── db/          # Database
│   │   ├── models/      # SQLAlchemy models
│   │   ├── schemas/     # Pydantic schemas
│   │   └── services/    # Lógica de negócio
│   ├── alembic/         # Migrations
│   └── scripts/         # Utilitários
├── frontend/            # Next.js (próxima fase)
└── docker-compose.yml
```

## 🎯 Roadmap

- [x] Fase 1: Backend & API
- [x] Fase 2: Banco de Dados & Infra
- [ ] Fase 3: Endpoints REST
- [ ] Fase 4: Integração WhatsApp
- [ ] Fase 5: Frontend Next.js
- [ ] Fase 6: Deploy

## 📄 Licença

Projeto privado - JehFashion © 2026
