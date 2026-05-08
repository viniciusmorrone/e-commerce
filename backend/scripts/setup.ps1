Write-Host "🚀 JehFashion - Setup Inicial" -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan
Write-Host ""

Write-Host "1️⃣  Criando arquivo .env..." -ForegroundColor Yellow
if (-not (Test-Path .env)) {
    Copy-Item .env.example .env
    Write-Host "✅ Arquivo .env criado! Configure suas credenciais." -ForegroundColor Green
} else {
    Write-Host "⚠️  Arquivo .env já existe." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "2️⃣  Instalando dependências..." -ForegroundColor Yellow
pip install -r requirements.txt

Write-Host ""
Write-Host "3️⃣  Subindo containers Docker..." -ForegroundColor Yellow
Set-Location ..
docker-compose up -d postgres redis

Write-Host ""
Write-Host "⏳ Aguardando PostgreSQL iniciar..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host ""
Write-Host "4️⃣  Executando migrations..." -ForegroundColor Yellow
Set-Location backend
alembic upgrade head

Write-Host ""
Write-Host "5️⃣  Criando categorias iniciais..." -ForegroundColor Yellow
python scripts/seed_categories.py

Write-Host ""
Write-Host "6️⃣  Criando admin inicial..." -ForegroundColor Yellow
python scripts/create_admin.py

Write-Host ""
Write-Host "✅ Setup concluído!" -ForegroundColor Green
Write-Host ""
Write-Host "Para iniciar o servidor:" -ForegroundColor Cyan
Write-Host "  uvicorn app.main:app --reload" -ForegroundColor White
Write-Host ""
Write-Host "Acesse:" -ForegroundColor Cyan
Write-Host "  API: http://localhost:8000" -ForegroundColor White
Write-Host "  Docs: http://localhost:8000/api/v1/docs" -ForegroundColor White
