from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional
from app.db.database import get_db
from app.db.redis_client import get_redis
from app.schemas.produto import (
    ProdutoResponse, 
    ProdutoCreate, 
    ProdutoUpdate,
    ProdutoListResponse
)
from app.models.produto import Produto, Variante, Imagem
from app.api.deps import get_current_admin
import uuid
import json

router = APIRouter()


@router.get("/", response_model=List[ProdutoListResponse])
def listar_produtos(
    categoria_id: Optional[uuid.UUID] = None,
    cor: Optional[str] = None,
    tamanho: Optional[str] = None,
    ordenar: Optional[str] = Query("criado_em", regex="^(preco|nome|criado_em)$"),
    ordem: Optional[str] = Query("desc", regex="^(asc|desc)$"),
    limite: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    redis = Depends(get_redis)
):
    cache_key = f"produtos:{categoria_id}:{cor}:{tamanho}:{ordenar}:{ordem}:{limite}:{offset}"
    
    cached = redis.get(cache_key)
    if cached:
        return json.loads(cached)
    
    query = db.query(Produto).filter(Produto.ativo == True)
    
    if categoria_id:
        query = query.filter(Produto.categoria_id == categoria_id)
    
    if cor or tamanho:
        query = query.join(Variante)
        if cor:
            query = query.filter(Variante.cor.ilike(f"%{cor}%"))
        if tamanho:
            query = query.filter(Variante.tamanho.ilike(f"%{tamanho}%"))
    
    if ordem == "asc":
        query = query.order_by(getattr(Produto, ordenar).asc())
    else:
        query = query.order_by(getattr(Produto, ordenar).desc())
    
    produtos = query.offset(offset).limit(limite).all()
    
    result = []
    for produto in produtos:
        imagem_principal = db.query(Imagem).filter(
            Imagem.produto_id == produto.id,
            Imagem.principal == True
        ).first()
        
        if not imagem_principal:
            imagem_principal = db.query(Imagem).filter(
                Imagem.produto_id == produto.id
            ).order_by(Imagem.ordem).first()
        
        result.append(ProdutoListResponse(
            id=produto.id,
            nome=produto.nome,
            slug=produto.slug,
            preco=produto.preco,
            ativo=produto.ativo,
            imagem_principal=imagem_principal.url if imagem_principal else None
        ))
    
    redis.setex(cache_key, 300, json.dumps([r.model_dump(mode='json') for r in result], default=str))
    
    return result


@router.get("/{slug}", response_model=ProdutoResponse)
def obter_produto(slug: str, db: Session = Depends(get_db)):
    produto = db.query(Produto).filter(
        Produto.slug == slug,
        Produto.ativo == True
    ).first()
    
    if not produto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Produto não encontrado"
        )
    
    return produto


@router.post("/", response_model=ProdutoResponse, status_code=status.HTTP_201_CREATED)
def criar_produto(
    produto_data: ProdutoCreate,
    db: Session = Depends(get_db),
    redis = Depends(get_redis),
    admin = Depends(get_current_admin)
):
    existing = db.query(Produto).filter(Produto.slug == produto_data.slug).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Produto com este slug já existe"
        )
    
    variantes_data = produto_data.variantes
    produto_dict = produto_data.model_dump(exclude={'variantes'})
    
    produto = Produto(**produto_dict)
    db.add(produto)
    db.flush()
    
    for variante_data in variantes_data:
        variante = Variante(**variante_data.model_dump(), produto_id=produto.id)
        db.add(variante)
    
    db.commit()
    db.refresh(produto)
    
    redis.delete("produtos:*")
    
    return produto


@router.put("/{produto_id}", response_model=ProdutoResponse)
def atualizar_produto(
    produto_id: uuid.UUID,
    produto_data: ProdutoUpdate,
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
    
    update_data = produto_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(produto, field, value)
    
    db.commit()
    db.refresh(produto)
    
    redis.delete("produtos:*")
    
    return produto


@router.delete("/{produto_id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar_produto(
    produto_id: uuid.UUID,
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
    
    produto.ativo = False
    db.commit()
    
    redis.delete("produtos:*")
    
    return None
