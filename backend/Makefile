.PHONY: help install dev up down logs migrate seed admin clean

help:
	@echo "JehFashion - Comandos disponíveis:"
	@echo "  make install    - Instalar dependências"
	@echo "  make dev        - Iniciar servidor de desenvolvimento"
	@echo "  make up         - Subir containers Docker"
	@echo "  make down       - Parar containers Docker"
	@echo "  make logs       - Ver logs dos containers"
	@echo "  make migrate    - Executar migrations"
	@echo "  make seed       - Popular banco com categorias"
	@echo "  make admin      - Criar admin inicial"
	@echo "  make clean      - Limpar cache e arquivos temporários"

install:
	pip install -r requirements.txt

dev:
	uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

up:
	docker-compose up -d

down:
	docker-compose down

logs:
	docker-compose logs -f

migrate:
	alembic upgrade head

seed:
	python scripts/seed_categories.py

admin:
	python scripts/create_admin.py

clean:
	find . -type d -name __pycache__ -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete
	find . -type f -name "*.pyo" -delete
