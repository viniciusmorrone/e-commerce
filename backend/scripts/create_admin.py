import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.db.database import SessionLocal
from app.models.admin import Admin
from app.core.security import get_password_hash
from app.core.config import settings


def create_initial_admin():
    db = SessionLocal()
    try:
        existing_admin = db.query(Admin).filter(Admin.email == settings.ADMIN_EMAIL).first()
        
        if existing_admin:
            print(f"Admin já existe: {settings.ADMIN_EMAIL}")
            return
        
        admin = Admin(
            email=settings.ADMIN_EMAIL,
            hashed_password=get_password_hash(settings.ADMIN_PASSWORD),
            nome="Administrador",
            ativo=True
        )
        
        db.add(admin)
        db.commit()
        db.refresh(admin)
        
        print(f"✅ Admin criado com sucesso!")
        print(f"Email: {admin.email}")
        print(f"ID: {admin.id}")
        
    except Exception as e:
        print(f"❌ Erro ao criar admin: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    create_initial_admin()
