# JehFashion - Backend API

API REST.

## Stack

- **FastAPI** - Framework web async
- **SQLAlchemy** - ORM
- **PostgreSQL** - Banco de dados
- **Redis** - Cache e rate limiting
- **Alembic** - Migrations
- **JWT** - Autenticação

## Setup

1. **Criar ambiente virtual**
```bash
python -m venv venv
venv\Scripts\activate  # Windows
```

2. **Instalar dependências**
```bash
pip install -r requirements.txt
```

3. **Configurar variáveis de ambiente**
```bash
cp .env.example .env
# Editar .env com suas credenciais
```

4. **Inicializar banco de dados**
```bash
# Criar migration inicial
alembic revision --autogenerate -m "initial migration"

# Aplicar migrations
alembic upgrade head
```

5. **Criar admin inicial**
```bash
python scripts/create_admin.py
```

6. **Executar servidor**
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Endpoints

- **Docs**: http://localhost:8000/api/v1/docs
- **Health**: http://localhost:8000/health
- **Login**: POST http://localhost:8000/api/v1/admin/auth/login

## Admin Padrão

- **Email**: jeh@gmail.com
- **Senha**: Configurar no .env (ADMIN_PASSWORD)
