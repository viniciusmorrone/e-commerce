from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.redis_client import get_redis
from app.schemas.produto import ProdutoListResponse, VarianteCreate, VarianteResponse
from app.models.produto import Produto, Variante
from app.api.deps import get_current_admin
import uuid

router = APIRouter()


@router.get("", response_model=list[ProdutoListResponse])
def listar_produtos_admin(
    db: Session = Depends(get_db),
    _: object = Depends(get_current_admin),
):
    produtos = db.query(Produto).order_by(Produto.criado_em.desc()).all()
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

    return result


@router.post("/{produto_id}/variantes", response_model=VarianteResponse, status_code=status.HTTP_201_CREATED)
def adicionar_variante(
    produto_id: uuid.UUID,
    variante_data: VarianteCreate,
    db: Session = Depends(get_db),
    redis=Depends(get_redis),
    _: object = Depends(get_current_admin),
):
    produto = db.query(Produto).filter(Produto.id == produto_id).first()
    if not produto:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Produto não encontrado")

    variante = Variante(**variante_data.model_dump(), produto_id=produto_id)
    db.add(variante)
    db.commit()
    db.refresh(variante)

    try:
        keys = redis.keys("produtos:*")
        if keys:
            redis.delete(*keys)
    except Exception:
        pass

    return variante
