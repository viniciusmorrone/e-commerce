# 🚀 Deploy no Render

## Pré-requisitos

1. Conta no [Render](https://render.com)
2. Conta no [Cloudinary](https://cloudinary.com) (para imagens)
3. Repositório Git (GitHub, GitLab ou Bitbucket)

## Passo a Passo

### 1. Configurar Cloudinary

1. Acesse https://cloudinary.com
2. Crie uma conta gratuita
3. No dashboard, copie:
   - Cloud Name
   - API Key
   - API Secret

### 2. Criar Banco de Dados PostgreSQL

1. No Render Dashboard, clique em **New +**
2. Selecione **PostgreSQL**
3. Configure:
   - **Name**: `jehfashion-db`
   - **Database**: `jehfashion`
   - **User**: `jehfashion`
   - **Region**: Oregon (ou mais próximo)
   - **Plan**: Free
4. Clique em **Create Database**
5. Copie a **Internal Database URL**

### 3. Criar Redis

1. No Render Dashboard, clique em **New +**
2. Selecione **Redis**
3. Configure:
   - **Name**: `jehfashion-redis`
   - **Region**: Oregon
   - **Plan**: Free
4. Clique em **Create Redis**
5. Copie a **Internal Redis URL**

### 4. Deploy da API

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

### 5. Configurar Variáveis de Ambiente

Na seção **Environment**, adicione:

```
DATABASE_URL=<Internal Database URL do PostgreSQL>
REDIS_URL=<Internal Redis URL>
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

### 6. Deploy

1. Clique em **Create Web Service**
2. Aguarde o build e deploy (5-10 minutos)
3. Acesse a URL fornecida: `https://jehfashion-api.onrender.com`

### 7. Executar Migrations

Após o primeiro deploy:

1. No Render Dashboard, acesse seu serviço
2. Vá em **Shell**
3. Execute:
```bash
alembic upgrade head
python scripts/create_admin.py
python scripts/seed_categories.py
```

### 8. Testar API

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

- **PostgreSQL Free**: 256MB RAM, 1GB storage
- **Redis Free**: 25MB
- **Web Service Free**: 512MB RAM, suspende após 15min inatividade

Para produção, considere planos pagos para melhor performance.

## Troubleshooting

**Erro de conexão com banco:**
- Verifique se a DATABASE_URL está correta
- Certifique-se de usar a Internal URL

**Erro ao fazer upload de imagens:**
- Verifique credenciais do Cloudinary
- Teste no dashboard do Cloudinary

**API não responde:**
- Verifique logs no Render Dashboard
- Confirme que o PORT está sendo usado corretamente
