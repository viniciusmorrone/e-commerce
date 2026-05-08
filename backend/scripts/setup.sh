#!/bin/bash

echo "🚀 JehFashion - Setup Inicial"
echo "=============================="

echo ""
echo "1️⃣  Criando arquivo .env..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Arquivo .env criado! Configure suas credenciais."
else
    echo "⚠️  Arquivo .env já existe."
fi

echo ""
echo "2️⃣  Instalando dependências..."
pip install -r requirements.txt

echo ""
echo "3️⃣  Subindo containers Docker..."
cd ..
docker-compose up -d postgres redis

echo ""
echo "⏳ Aguardando PostgreSQL iniciar..."
sleep 5

echo ""
echo "4️⃣  Executando migrations..."
cd backend
alembic upgrade head

echo ""
echo "5️⃣  Criando categorias iniciais..."
python scripts/seed_categories.py

echo ""
echo "6️⃣  Criando admin inicial..."
python scripts/create_admin.py

echo ""
echo "✅ Setup concluído!"
echo ""
echo "Para iniciar o servidor:"
echo "  uvicorn app.main:app --reload"
echo ""
echo "Acesse:"
echo "  API: http://localhost:8000"
echo "  Docs: http://localhost:8000/api/v1/docs"
