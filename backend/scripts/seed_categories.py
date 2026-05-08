import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.db.database import SessionLocal
from app.models.categoria import Categoria
from slugify import slugify


def create_categories():
    db = SessionLocal()
    try:
        categories_data = [
            {"nome": "Feminino", "slug": "feminino", "pai_id": None},
            {"nome": "Masculino", "slug": "masculino", "pai_id": None},
            {"nome": "Acessórios", "slug": "acessorios", "pai_id": None},
            {"nome": "Calçados", "slug": "calcados", "pai_id": None},
        ]
        
        created_categories = {}
        
        for cat_data in categories_data:
            existing = db.query(Categoria).filter(Categoria.slug == cat_data["slug"]).first()
            if not existing:
                categoria = Categoria(**cat_data)
                db.add(categoria)
                db.flush()
                created_categories[cat_data["nome"]] = categoria
                print(f"✅ Categoria criada: {cat_data['nome']}")
            else:
                created_categories[cat_data["nome"]] = existing
                print(f"⚠️  Categoria já existe: {cat_data['nome']}")
        
        subcategories = [
            {"nome": "Vestidos", "slug": "vestidos", "pai": "Feminino"},
            {"nome": "Blusas", "slug": "blusas", "pai": "Feminino"},
            {"nome": "Calças", "slug": "calcas-feminino", "pai": "Feminino"},
            {"nome": "Camisetas", "slug": "camisetas-masculino", "pai": "Masculino"},
            {"nome": "Calças", "slug": "calcas-masculino", "pai": "Masculino"},
            {"nome": "Jaquetas", "slug": "jaquetas", "pai": "Masculino"},
            {"nome": "Bolsas", "slug": "bolsas", "pai": "Acessórios"},
            {"nome": "Relógios", "slug": "relogios", "pai": "Acessórios"},
            {"nome": "Tênis", "slug": "tenis", "pai": "Calçados"},
            {"nome": "Botas", "slug": "botas", "pai": "Calçados"},
        ]
        
        for subcat in subcategories:
            pai_categoria = created_categories.get(subcat["pai"])
            if pai_categoria:
                existing = db.query(Categoria).filter(Categoria.slug == subcat["slug"]).first()
                if not existing:
                    categoria = Categoria(
                        nome=subcat["nome"],
                        slug=subcat["slug"],
                        pai_id=pai_categoria.id
                    )
                    db.add(categoria)
                    print(f"✅ Subcategoria criada: {subcat['nome']} ({subcat['pai']})")
                else:
                    print(f"⚠️  Subcategoria já existe: {subcat['nome']}")
        
        db.commit()
        print("\n🎉 Categorias criadas com sucesso!")
        
    except Exception as e:
        print(f"❌ Erro ao criar categorias: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    create_categories()
