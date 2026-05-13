from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.db.database import get_db
from app.db.redis_client import get_redis
from app.schemas.produto import VarianteResponse, VarianteUpdate
from app.models.produto import Variante
from app.api.deps import get_current_admin
import uuid

router = APIRouter()


class EstoqueUpdate(BaseModel):
    qtd_estoque: int


@router.put("/{variante_id}", response_model=VarianteResponse)
def atualizar_estoque(
    variante_id: uuid.UUID,
    estoque_data: EstoqueUpdate,
    db: Session = Depends(get_db),
    redis = Depends(get_redis),
    _: object = Depends(get_current_admin),
):
    variante = db.query(Variante).filter(Variante.id == variante_id).first()
    if not variante:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Variante não encontrada"
        )
    
    if estoque_data.qtd_estoque < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Quantidade em estoque não pode ser negativa"
        )
    
    variante.qtd_estoque = estoque_data.qtd_estoque
    db.commit()
    db.refresh(variante)
    
    redis.delete("produtos:*")
    
    return variante


@router.put("/{variante_id}/detalhes", response_model=VarianteResponse)
def atualizar_variante(
    variante_id: uuid.UUID,
    variante_data: VarianteUpdate,
    db: Session = Depends(get_db),
    redis = Depends(get_redis),
    _: object = Depends(get_current_admin),
):
    variante = db.query(Variante).filter(Variante.id == variante_id).first()
    if not variante:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Variante não encontrada"
        )
    
    update_data = variante_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(variante, field, value)
    
    db.commit()
    db.refresh(variante)
    
    redis.delete("produtos:*")
    
    return variante
