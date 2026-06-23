from fastapi import APIRouter, HTTPException
from app.db.database import SessionLocal, engine, Base
from app.models.admin import Admin
from app.models.categoria import Categoria
from app.models.produto import Produto, Variante, Imagem
from app.core.security import get_password_hash
from app.core.config import settings

router = APIRouter()

CATEGORIAS_DATA = [
    {
        "nome": "Marcas de Artista!",
        "slug": "marcas",
        "subcategorias": [],
    },
    {
        "nome": "Camisetas",
        "slug": "camisetas",
        "subcategorias": [
            {"nome": "Polo", "slug": "polo"},
            {"nome": "Griffe", "slug": "griffe"},
            {"nome": "Time", "slug": "time"},
        ],
    },
    {
        "nome": "Calças",
        "slug": "calcas",
        "subcategorias": [
            {"nome": "Jeans", "slug": "jeans"},
            {"nome": "Alfaiataria", "slug": "alfaiataria"},
            {"nome": "Skinny", "slug": "skinny"},
            {"nome": "Reta", "slug": "reta"},
        ],
    },
    {
        "nome": "Chinelos",
        "slug": "chinelos",
        "subcategorias": [],
    },
    {
        "nome": "Acessórios",
        "slug": "acessorios",
        "subcategorias": [
            {"nome": "Relógios", "slug": "relogios"},
            {"nome": "Carteiras", "slug": "carteiras"},
            {"nome": "Bonés", "slug": "bones"},
        ],
    },
    {
        "nome": "Blusas",
        "slug": "blusas",
        "subcategorias": [],
    },
    {
        "nome": "Tênis",
        "slug": "tenis",
        "subcategorias": [],
    },
]


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
        for cat_data in CATEGORIAS_DATA:
            if not db.query(Categoria).filter(Categoria.slug == cat_data["slug"]).first():
                categoria = Categoria(nome=cat_data["nome"], slug=cat_data["slug"])
                db.add(categoria)
                db.flush()
                for sub in cat_data["subcategorias"]:
                    if not db.query(Categoria).filter(Categoria.slug == sub["slug"]).first():
                        db.add(Categoria(nome=sub["nome"], slug=sub["slug"], pai_id=categoria.id))
        db.commit()
        return {"message": "Categorias criadas com sucesso!"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()


@router.post("/reset-categories")
def reset_categories():
    db = SessionLocal()
    try:
        new_slugs: set = set()
        for cat in CATEGORIAS_DATA:
            new_slugs.add(cat["slug"])
            for sub in cat["subcategorias"]:
                new_slugs.add(sub["slug"])

        cat_map: dict = {}
        for cat_data in CATEGORIAS_DATA:
            obj = db.query(Categoria).filter(Categoria.slug == cat_data["slug"]).first()
            if not obj:
                obj = Categoria(nome=cat_data["nome"], slug=cat_data["slug"], pai_id=None)
                db.add(obj)
                db.flush()
            else:
                obj.nome = cat_data["nome"]
                obj.pai_id = None
                db.flush()
            cat_map[cat_data["slug"]] = obj

            for sub_data in cat_data["subcategorias"]:
                sub_obj = db.query(Categoria).filter(Categoria.slug == sub_data["slug"]).first()
                if not sub_obj:
                    sub_obj = Categoria(nome=sub_data["nome"], slug=sub_data["slug"], pai_id=obj.id)
                    db.add(sub_obj)
                    db.flush()
                else:
                    sub_obj.nome = sub_data["nome"]
                    sub_obj.pai_id = obj.id
                    db.flush()
                cat_map[sub_data["slug"]] = sub_obj

        all_cats = db.query(Categoria).all()
        old_cats = [c for c in all_cats if c.slug not in new_slugs]

        if old_cats:
            default_id = cat_map["marcas"].id
            for old_cat in old_cats:
                best_id = default_id
                for slug, new_cat in cat_map.items():
                    if slug in old_cat.slug or old_cat.slug in slug:
                        best_id = new_cat.id
                        break
                db.query(Produto).filter(Produto.categoria_id == old_cat.id).update(
                    {"categoria_id": best_id}, synchronize_session=False
                )
            db.flush()

            old_leaves = [c for c in old_cats if c.pai_id is not None]
            old_roots = [c for c in old_cats if c.pai_id is None]
            for c in old_leaves:
                db.delete(c)
            db.flush()
            for c in old_roots:
                db.delete(c)

        db.commit()
        return {"message": "Categorias resetadas com sucesso! Reatribua os produtos no painel."}
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
