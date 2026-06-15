# 🚀 Deploy (API no Render + Banco no Supabase)

## Pré-requisitos

1. Conta no [Render](https://render.com) (para a API)
2. Conta no [Supabase](https://supabase.com) (para o banco PostgreSQL)
3. Conta no [Cloudinary](https://cloudinary.com) (para imagens)
4. Repositório Git (GitHub, GitLab ou Bitbucket)

## Passo a Passo

### 1. Configurar Cloudinary

1. Acesse https://cloudinary.com
2. Crie uma conta gratuita
3. No dashboard, copie:
   - Cloud Name
   - API Key
   - API Secret

### 2. Criar Banco de Dados no Supabase

1. Acesse https://supabase.com e clique em **New Project**
2. Configure:
   - **Name**: `jehfashion`
   - **Database Password**: defina uma senha forte (anote!)
   - **Region**: a mais próxima dos seus usuários
3. Aguarde a criação do projeto
4. Vá em **Project Settings → Database → Connection string → URI**
5. Copie a URI. Recomenda-se a opção **Connection pooling** (porta `6543`). Formato:
   ```
   postgresql://postgres.<project-ref>:<SUA-SENHA>@aws-0-<regiao>.pooler.supabase.com:6543/postgres
   ```

> **Redis**: não é necessário. O cache é opcional e a aplicação funciona sem ele (Supabase não oferece Redis). Para habilitar cache, use um serviço externo como Upstash e preencha `REDIS_URL`.

### 3. Deploy da API

1. No Render Dashboard, clique em **New +**
2. Selecione **Web Service**
3. Conecte seu repositório Git
4. Configure:
   - **Name**: `jehfashion-api`
   - **Region**: Oregon
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### 4. Configurar Variáveis de Ambiente

Na seção **Environment**, adicione:

```
DATABASE_URL=<URI de conexão do Supabase>
SECRET_KEY=<gerar chave aleatória segura>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
CLOUDINARY_CLOUD_NAME=<seu cloud name>
CLOUDINARY_API_KEY=<sua api key>
CLOUDINARY_API_SECRET=<seu api secret>
WHATSAPP_NUMBER=5511934855599
ADMIN_EMAIL=jeh@gmail.com
ADMIN_PASSWORD=<senha segura>
CORS_ORIGINS=https://seu-dominio.com
PYTHON_VERSION=3.11.0
```

**Gerar SECRET_KEY:**
```python
import secrets
print(secrets.token_urlsafe(32))
```

### 5. Deploy

1. Clique em **Create Web Service**
2. Aguarde o build e deploy (5-10 minutos)
3. Acesse a URL fornecida: `https://jehfashion-api.onrender.com`

### 6. Executar Migrations

Após o primeiro deploy:

1. No Render Dashboard, acesse seu serviço
2. Vá em **Shell**
3. Execute:
```bash
alembic upgrade head
python scripts/create_admin.py
python scripts/seed_categories.py
```

### 7. Testar API

Acesse: `https://jehfashion-api.onrender.com/api/v1/docs`

## Comandos Úteis

**Ver logs:**
```bash
# No Render Dashboard > Logs
```

**Executar migrations:**
```bash
# No Shell do Render
alembic upgrade head
```

**Criar admin:**
```bash
python scripts/create_admin.py
```

**Popular categorias:**
```bash
python scripts/seed_categories.py
```

## Domínio Customizado

1. No Render Dashboard, acesse seu serviço
2. Vá em **Settings > Custom Domain**
3. Adicione seu domínio
4. Configure DNS:
   - Type: CNAME
   - Name: api (ou @)
   - Value: `jehfashion-api.onrender.com`

## Monitoramento

- **Health Check**: `https://seu-dominio.com/health`
- **Docs**: `https://seu-dominio.com/api/v1/docs`
- **Logs**: Render Dashboard > Logs

## Custos

- **Supabase Free**: 500MB de banco, projeto pausado após inatividade prolongada
- **Render Web Service Free**: 512MB RAM, suspende após 15min inatividade

Para produção, considere planos pagos para melhor performance.

## Troubleshooting

**Erro de conexão com banco:**
- Verifique se a `DATABASE_URL` (URI do Supabase) está correta, incluindo a senha
- Em caso de erro de SSL, adicione `?sslmode=require` ao final da URI
- Confirme que está usando a porta correta do pooler (`6543`) ou conexão direta (`5432`)

**Erro ao fazer upload de imagens:**
- Verifique credenciais do Cloudinary
- Teste no dashboard do Cloudinary

**API não responde:**
- Verifique logs no Render Dashboard
- Confirme que o PORT está sendo usado corretamente
