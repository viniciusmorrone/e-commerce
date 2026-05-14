from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.admin import AdminLogin, TokenResponse
from app.models.admin import Admin
from app.core.security import verify_password, create_access_token, create_refresh_token

router = APIRouter()


@router.options("/login")
async def login_options():
    return {"message": "OK"}


@router.post("/login", response_model=TokenResponse)
def login(credentials: AdminLogin, db: Session = Depends(get_db)):
    admin = db.query(Admin).filter(Admin.email == credentials.email).first()

    if not admin or not verify_password(credentials.password, admin.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou senha incorretos",
        )

    if not admin.ativo:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Conta desativada")

    return TokenResponse(
        access_token=create_access_token({"sub": str(admin.id)}),
        refresh_token=create_refresh_token({"sub": str(admin.id)}),
    )
