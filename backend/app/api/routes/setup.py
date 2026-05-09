from fastapi import APIRouter, HTTPException
from sqlalchemy.orm import Session
from app.db.database import SessionLocal, engine, Base
from app.models.admin import Admin
from app.models.categoria import Categoria
from app.models.produto import Produto, Variante, Imagem
from app.core.security import hash_password
from app.core.config import settings
from slugify import slugify

router = APIRouter()

@router.post("/init-database")
def init_database():
    """Criar todas as tabelas"""
    try:
        Base.metadata.create_all(bind=engine)
        return {"message": "Tabelas criadas com sucesso!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/seed-categories")
def seed_categories():
    """Popular categorias iniciais"""
    db = SessionLocal()
    try:
        categorias_data = [
            {"nome": "Feminino", "subcategorias": ["Camisetas", "Calças", "Vestidos", "Saias", "Blusas"]},
            {"nome": "Masculino", "subcategorias": ["Camisetas", "Calças", "Camisas", "Bermudas", "Moletons"]},
            {"nome": "Acessórios", "subcategorias": ["Bonés", "Bolsas", "Cintos", "Óculos", "Relógios"]},
            {"nome": "Calçados", "subcategorias": ["Tênis", "Sandálias", "Botas", "Chinelos", "Sapatos"]}
        ]
        
        for cat_data in categorias_data:
            cat_slug = slugify(cat_data["nome"])
            categoria_existente = db.query(Categoria).filter(Categoria.slug == cat_slug).first()
            
            if not categoria_existente:
                categoria = Categoria(nome=cat_data["nome"], slug=cat_slug)
                db.add(categoria)
                db.flush()
                
                for subcat_nome in cat_data["subcategorias"]:
                    subcat_slug = slugify(subcat_nome)
                    subcat_existente = db.query(Categoria).filter(Categoria.slug == subcat_slug).first()
                    
                    if not subcat_existente:
                        subcategoria = Categoria(
                            nome=subcat_nome,
                            slug=subcat_slug,
                            pai_id=categoria.id
                        )
                        db.add(subcategoria)
        
        db.commit()
        return {"message": "Categorias criadas com sucesso!"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

@router.post("/create-admin")
def create_admin():
    """Criar usuário admin inicial"""
    db = SessionLocal()
    try:
        admin_existente = db.query(Admin).filter(Admin.email == settings.ADMIN_EMAIL).first()
        
        if admin_existente:
            return {"message": "Admin já existe!"}
        
        admin = Admin(
            email=settings.ADMIN_EMAIL,
            hashed_password=hash_password(settings.ADMIN_PASSWORD),
            nome="Administrador",
            ativo=True
        )
        db.add(admin)
        db.commit()
        
        return {"message": f"Admin criado: {settings.ADMIN_EMAIL}"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

@router.post("/setup-all")
def setup_all():
    """Executar todos os setups de uma vez"""
    results = []
    
    try:
        init_result = init_database()
        results.append(init_result)
    except Exception as e:
        results.append({"error": f"Init DB: {str(e)}"})
    
    try:
        seed_result = seed_categories()
        results.append(seed_result)
    except Exception as e:
        results.append({"error": f"Seed Categories: {str(e)}"})
    
    try:
        admin_result = create_admin()
        results.append(admin_result)
    except Exception as e:
        results.append({"error": f"Create Admin: {str(e)}"})
    
    return {"results": results}