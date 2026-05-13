from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.redis_client import get_redis
from app.schemas.produto import VarianteCreate, VarianteResponse
from app.models.produto import Produto, Variante
import uuid

router = APIRouter()


@router.post("/{produto_id}/variantes", response_model=VarianteResponse, status_code=status.HTTP_201_CREATED)
def adicionar_variante(
    produto_id: uuid.UUID,
    variante_data: VarianteCreate,
    db: Session = Depends(get_db),
    redis=Depends(get_redis),
):
    produto = db.query(Produto).filter(Produto.id == produto_id).first()
    if not produto:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Produto não encontrado")

    variante = Variante(**variante_data.model_dump(), produto_id=produto_id)
    db.add(variante)
    db.commit()
    db.refresh(variante)
    redis.delete("produtos:*")
    return variante
