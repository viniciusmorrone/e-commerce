import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.db.database import engine, Base
from app.models.admin import Admin
from app.models.categoria import Categoria
from app.models.produto import Produto, Variante, Imagem


def init_database():
    print("🔧 Criando tabelas no banco de dados...")
    Base.metadata.create_all(bind=engine)
    print("✅ Tabelas criadas com sucesso!")


if __name__ == "__main__":
    init_database()
