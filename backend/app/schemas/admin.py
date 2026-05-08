from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
import uuid


class AdminLogin(BaseModel):
    email: EmailStr
    password: str


class AdminCreate(BaseModel):
    email: EmailStr
    password: str
    nome: Optional[str] = None


class AdminResponse(BaseModel):
    id: uuid.UUID
    email: str
    nome: Optional[str]
    ativo: bool
    criado_em: datetime
    
    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
