from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import uuid


class CategoriaBase(BaseModel):
    nome: str
    slug: str
    pai_id: Optional[uuid.UUID] = None


class CategoriaCreate(CategoriaBase):
    pass


class CategoriaUpdate(BaseModel):
    nome: Optional[str] = None
    slug: Optional[str] = None
    pai_id: Optional[uuid.UUID] = None


class CategoriaResponse(CategoriaBase):
    id: uuid.UUID
    criado_em: datetime
    subcategorias: List["CategoriaResponse"] = []
    
    class Config:
        from_attributes = True
