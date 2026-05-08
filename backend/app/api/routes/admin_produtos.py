from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.db.redis_client import get_redis
from app.schemas.produto import ProdutoResponse, ProdutoCreate, ProdutoUpdate, VarianteCreate
from app.models.produto import Produto, Variante
from app.api.deps import get_current_admin
import uuid

router = APIRouter()


@router.get("/", response_model=List[ProdutoResponse])
def listar_todos_produtos(
    incluir_inativos: bool = False,
    db: Session = Depends(get_db),
    admin = Depends(get_current_admin)
):
    query = db.query(Produto)
    if not incluir_inativos:
        query = query.filter(Produto.ativo == True)
    
    produtos = query.order_by(Produto.criado_em.desc()).all()
    return produtos


@router.post("/{produto_id}/variantes", status_code=status.HTTP_201_CREATED)
def adicionar_variante(
    produto_id: uuid.UUID,
    variante_data: VarianteCreate,
    db: Session = Depends(get_db),
    redis = Depends(get_redis),
    admin = Depends(get_current_admin)
):
    produto = db.query(Produto).filter(Produto.id == produto_id).first()
    if not produto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Produto não encontrado"
        )
    
    existing_sku = db.query(Variante).filter(Variante.sku == variante_data.sku).first()
    if existing_sku:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="SKU já existe"
        )
    
    variante = Variante(**variante_data.model_dump(), produto_id=produto_id)
    db.add(variante)
    db.commit()
    db.refresh(variante)
    
    redis.delete("produtos:*")
    
    return variante


@router.delete("/{produto_id}/variantes/{variante_id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar_variante(
    produto_id: uuid.UUID,
    variante_id: uuid.UUID,
    db: Session = Depends(get_db),
    redis = Depends(get_redis),
    admin = Depends(get_current_admin)
):
    variante = db.query(Variante).filter(
        Variante.id == variante_id,
        Variante.produto_id == produto_id
    ).first()
    
    if not variante:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Variante não encontrada"
        )
    
    db.delete(variante)
    db.commit()
    
    redis.delete("produtos:*")
    
    return None
