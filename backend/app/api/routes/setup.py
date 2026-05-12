from fastapi import APIRouter, HTTPException
from app.db.database import SessionLocal, engine, Base
from app.models.admin import Admin
from app.models.categoria import Categoria
from app.models.produto import Produto, Variante, Imagem
from app.core.security import get_password_hash
from app.core.config import settings
from slugify import slugify

router = APIRouter()


@router.post("/init-database")
def init_database():
    try:
        Base.metadata.create_all(bind=engine)
        return {"message": "Tabelas criadas com sucesso!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/seed-categories")
def seed_categories():
    db = SessionLocal()
    try:
        categorias_data = [
            {"nome": "Feminino", "subcategorias": ["Camisetas", "Calças", "Vestidos", "Saias", "Blusas"]},
            {"nome": "Masculino", "subcategorias": ["Camisetas", "Calças", "Camisas", "Bermudas", "Moletons"]},
            {"nome": "Acessórios", "subcategorias": ["Bonés", "Bolsas", "Cintos", "Óculos", "Relógios"]},
            {"nome": "Calçados", "subcategorias": ["Tênis", "Sandálias", "Botas", "Chinelos", "Sapatos"]},
        ]
        for cat_data in categorias_data:
            cat_slug = slugify(cat_data["nome"])
            if not db.query(Categoria).filter(Categoria.slug == cat_slug).first():
                categoria = Categoria(nome=cat_data["nome"], slug=cat_slug)
                db.add(categoria)
                db.flush()
                for sub_nome in cat_data["subcategorias"]:
                    sub_slug = slugify(sub_nome)
                    if not db.query(Categoria).filter(Categoria.slug == sub_slug).first():
                        db.add(Categoria(nome=sub_nome, slug=sub_slug, pai_id=categoria.id))
        db.commit()
        return {"message": "Categorias criadas com sucesso!"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()


@router.post("/create-admin")
def create_admin():
    db = SessionLocal()
    try:
        if db.query(Admin).filter(Admin.email == settings.ADMIN_EMAIL).first():
            return {"message": f"Admin '{settings.ADMIN_EMAIL}' já existe!"}
        admin = Admin(
            email=settings.ADMIN_EMAIL,
            hashed_password=get_password_hash(settings.ADMIN_PASSWORD),
            nome="Administrador",
            ativo=True,
        )
        db.add(admin)
        db.commit()
        return {"message": f"Admin '{settings.ADMIN_EMAIL}' criado com sucesso!"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()


@router.post("/reset-admin-password")
def reset_admin_password():
    db = SessionLocal()
    try:
        admin = db.query(Admin).filter(Admin.email == settings.ADMIN_EMAIL).first()
        if not admin:
            raise HTTPException(status_code=404, detail="Admin não encontrado. Execute /create-admin primeiro.")
        admin.hashed_password = get_password_hash(settings.ADMIN_PASSWORD)
        db.commit()
        return {"message": f"Senha de '{settings.ADMIN_EMAIL}' atualizada com sucesso!"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()


@router.post("/setup-all")
def setup_all():
    results = []
    for step, fn in [
        ("Init DB", init_database),
        ("Seed Categories", seed_categories),
        ("Create Admin", create_admin),
        ("Reset Password", reset_admin_password),
    ]:
        try:
            results.append({step: fn()})
        except Exception as e:
            results.append({step: {"error": str(e)}})
    return {"results": results}
