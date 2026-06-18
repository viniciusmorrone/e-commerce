from pydantic import BaseModel, Field, field_validator, field_serializer, model_validator
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

    @field_serializer("preco")
    def serialize_preco(self, value: Decimal) -> Optional[float]:
        return float(value) if value is not None else None


class ProdutoImagemInput(BaseModel):
    imagem_principal: Optional[str] = None
    imagens_secundarias: List[str] = Field(default_factory=list)

    @field_validator("imagem_principal", mode="before")
    @classmethod
    def normalize_imagem_principal(cls, value):
        if value is None:
            return None
        if not isinstance(value, str):
            return value

        value = value.strip()
        return value or None

    @field_validator("imagens_secundarias", mode="before")
    @classmethod
    def normalize_imagens_secundarias(cls, value):
        if value is None:
            return []
        if isinstance(value, str):
            value = [value]

        normalized = []
        seen = set()
        for item in value:
            if item is None:
                continue
            if not isinstance(item, str):
                normalized.append(item)
                continue

            item = item.strip()
            if item and item not in seen:
                normalized.append(item)
                seen.add(item)

        return normalized

    @model_validator(mode="after")
    def remove_main_from_secondaries(self):
        if self.imagem_principal:
            self.imagens_secundarias = [
                url for url in self.imagens_secundarias if url != self.imagem_principal
            ]

        if len(self.imagens_secundarias) > 3:
            raise ValueError("Máximo de 3 imagens secundárias")

        return self


class ProdutoImagemOutput(BaseModel):
    imagem_principal: Optional[str] = None
    imagens_secundarias: List[str] = Field(default_factory=list)


class ProdutoCreate(ProdutoBase, ProdutoImagemInput):
    variantes: List[VarianteCreate] = Field(default_factory=list)


class ProdutoUpdate(ProdutoImagemInput):
    nome: Optional[str] = None
    slug: Optional[str] = None
    descricao: Optional[str] = None
    preco: Optional[Decimal] = None
    categoria_id: Optional[uuid.UUID] = None
    ativo: Optional[bool] = None


class ProdutoResponse(ProdutoBase, ProdutoImagemOutput):
    id: uuid.UUID
    criado_em: datetime
    atualizado_em: datetime
    variantes: List[VarianteResponse] = Field(default_factory=list)
    imagens: List[ImagemResponse] = Field(default_factory=list)
    
    class Config:
        from_attributes = True


class ProdutoListResponse(ProdutoImagemOutput):
    id: uuid.UUID
    nome: str
    slug: str
    descricao: Optional[str] = None
    preco: Decimal
    ativo: bool
    categoria_id: uuid.UUID

    @field_serializer("preco")
    def serialize_preco(self, value: Decimal) -> Optional[float]:
        return float(value) if value is not None else None

    class Config:
        from_attributes = True
