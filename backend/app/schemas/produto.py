from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from decimal import Decimal
import uuid

_ZERO = Decimal('0')


class VarianteBase(BaseModel):
    tamanho: Optional[str] = None
    cor: Optional[str] = None
    qtd_estoque: int = 0
    sku: str


class VarianteCreate(VarianteBase):
    pass


class VarianteUpdate(BaseModel):
    tamanho: Optional[str] = None
    cor: Optional[str] = None
    qtd_estoque: Optional[int] = None


class VarianteResponse(VarianteBase):
    id: uuid.UUID
    produto_id: uuid.UUID
    criado_em: datetime
    
    class Config:
        from_attributes = True


class ImagemBase(BaseModel):
    url: str
    ordem: int = 0
    principal: bool = False


class ImagemCreate(ImagemBase):
    pass


class ImagemResponse(ImagemBase):
    id: uuid.UUID
    produto_id: uuid.UUID
    criado_em: datetime
    
    class Config:
        from_attributes = True


class ProdutoBase(BaseModel):
    nome: str
    slug: str
    descricao: Optional[str] = None
    preco: Decimal = Field(default=_ZERO, ge=0)
    categoria_id: uuid.UUID
    ativo: bool = True


class ProdutoCreate(ProdutoBase):
    variantes: List[VarianteCreate] = []


class ProdutoUpdate(BaseModel):
    nome: Optional[str] = None
    slug: Optional[str] = None
    descricao: Optional[str] = None
    preco: Optional[Decimal] = None
    categoria_id: Optional[uuid.UUID] = None
    ativo: Optional[bool] = None


class ProdutoResponse(ProdutoBase):
    id: uuid.UUID
    criado_em: datetime
    atualizado_em: datetime
    variantes: List[VarianteResponse] = []
    imagens: List[ImagemResponse] = []
    
    class Config:
        from_attributes = True


class ProdutoListResponse(BaseModel):
    id: uuid.UUID
    nome: str
    slug: str
    preco: Decimal
    ativo: bool
    imagem_principal: Optional[str] = None
    
    class Config:
        from_attributes = True
