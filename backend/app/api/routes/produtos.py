from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.database import get_db
from app.db.redis_client import get_redis
from app.api.deps import get_current_admin
from app.schemas.produto import (
    ProdutoResponse, 
    ProdutoCreate, 
    ProdutoUpdate,
    ProdutoListResponse
)
from app.models.produto import Produto, Variante, Imagem
import uuid
import json

router = APIRouter()


def _reescrever_imagens_produto(
    db: Session,
    produto_id: uuid.UUID,
    imagem_principal: Optional[str],
    imagens_secundarias: List[str],
):
    db.query(Imagem).filter(Imagem.produto_id == produto_id).delete(synchronize_session=False)

    novas_imagens = []
    proxima_ordem = 0

    if imagem_principal:
        novas_imagens.append(Imagem(
            produto_id=produto_id,
            url=imagem_principal,
            ordem=0,
            principal=True,
        ))
        proxima_ordem = 1

    for index, url in enumerate(imagens_secundarias, start=proxima_ordem):
        novas_imagens.append(Imagem(
            produto_id=produto_id,
            url=url,
            ordem=index,
            principal=False,
        ))

    if novas_imagens:
        db.add_all(novas_imagens)


def _normalizar_imagens_para_persistencia(
    imagem_principal: Optional[str],
    imagens_secundarias: List[str],
):
    imagens_secundarias_normalizadas = []
    urls_vistas = set()

    for url in imagens_secundarias:
        if not url or url == imagem_principal or url in urls_vistas:
            continue
        imagens_secundarias_normalizadas.append(url)
        urls_vistas.add(url)

    return imagem_principal, imagens_secundarias_normalizadas[:3]


@router.get("", response_model=List[ProdutoListResponse])
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
    
    try:
        cached = redis.get(cache_key)
        if cached:
            return json.loads(cached)
    except Exception:
        pass
    
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
        result.append(ProdutoListResponse(
            id=produto.id,
            nome=produto.nome,
            slug=produto.slug,
            descricao=produto.descricao,
            preco=produto.preco,
            ativo=produto.ativo,
            categoria_id=produto.categoria_id,
            imagem_principal=produto.imagem_principal,
            imagens_secundarias=produto.imagens_secundarias,
        ))
    
    try:
        redis.setex(cache_key, 300, json.dumps([r.model_dump(mode='json') for r in result], default=str))
    except Exception:
        pass
    
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


@router.post("", response_model=ProdutoResponse, status_code=status.HTTP_201_CREATED)
def criar_produto(
    produto_data: ProdutoCreate,
    db: Session = Depends(get_db),
    redis = Depends(get_redis),
    _: object = Depends(get_current_admin),
):
    existing = db.query(Produto).filter(Produto.slug == produto_data.slug).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Produto com este slug já existe"
        )
    
    variantes_data = produto_data.variantes
    produto_dict = produto_data.model_dump(
        exclude={"variantes", "imagem_principal", "imagens_secundarias"}
    )
    
    produto = Produto(**produto_dict)
    db.add(produto)
    db.flush()
    
    for variante_data in variantes_data:
        variante = Variante(**variante_data.model_dump(), produto_id=produto.id)
        db.add(variante)

    imagem_principal, imagens_secundarias = _normalizar_imagens_para_persistencia(
        produto_data.imagem_principal,
        produto_data.imagens_secundarias,
    )

    _reescrever_imagens_produto(
        db=db,
        produto_id=produto.id,
        imagem_principal=imagem_principal,
        imagens_secundarias=imagens_secundarias,
    )
    
    db.commit()
    db.refresh(produto)
    
    try:
        keys = redis.keys("produtos:*")
        if keys:
            redis.delete(*keys)
    except Exception:
        pass
    
    return produto


@router.put("/{produto_id}", response_model=ProdutoResponse)
def atualizar_produto(
    produto_id: uuid.UUID,
    produto_data: ProdutoUpdate,
    db: Session = Depends(get_db),
    redis = Depends(get_redis),
    _: object = Depends(get_current_admin),
):
    produto = db.query(Produto).filter(Produto.id == produto_id).first()
    if not produto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Produto não encontrado"
        )
    
    update_data = produto_data.model_dump(
        exclude_unset=True,
        exclude={"imagem_principal", "imagens_secundarias"},
    )
    for field, value in update_data.items():
        setattr(produto, field, value)

    should_update_images = (
        "imagem_principal" in produto_data.model_fields_set
        or "imagens_secundarias" in produto_data.model_fields_set
    )

    if should_update_images:
        imagem_principal = (
            produto_data.imagem_principal
            if "imagem_principal" in produto_data.model_fields_set
            else produto.imagem_principal
        )
        imagens_secundarias = (
            produto_data.imagens_secundarias
            if "imagens_secundarias" in produto_data.model_fields_set
            else produto.imagens_secundarias
        )

        imagem_principal, imagens_secundarias = _normalizar_imagens_para_persistencia(
            imagem_principal,
            imagens_secundarias,
        )

        _reescrever_imagens_produto(
            db=db,
            produto_id=produto.id,
            imagem_principal=imagem_principal,
            imagens_secundarias=imagens_secundarias,
        )

    db.commit()
    db.refresh(produto)
    
    try:
        keys = redis.keys("produtos:*")
        if keys:
            redis.delete(*keys)
    except Exception:
        pass
    
    return produto


@router.delete("/{produto_id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar_produto(
    produto_id: uuid.UUID,
    db: Session = Depends(get_db),
    redis = Depends(get_redis),
    _: object = Depends(get_current_admin),
):
    produto = db.query(Produto).filter(Produto.id == produto_id).first()
    if not produto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Produto não encontrado"
        )
    
    produto.ativo = False
    db.commit()
    
    try:
        keys = redis.keys("produtos:*")
        if keys:
            redis.delete(*keys)
    except Exception:
        pass
    
    return None
