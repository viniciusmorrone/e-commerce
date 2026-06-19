from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.db.redis_client import get_redis
from app.schemas.produto import ImagemResponse
from app.models.produto import Produto, Imagem
from app.services.cloudinary_service import upload_image, delete_image
from app.api.deps import get_current_admin
import uuid
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


def _upload_error_detail(error: Exception) -> str:
    message = str(error)
    lowered = message.lower()
    if "api key" in lowered or "api_key" in lowered or "signature" in lowered or "unauthorized" in lowered:
        return (
            "Falha na autenticação com o Cloudinary. "
            "Verifique CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY e CLOUDINARY_API_SECRET."
        )
    return f"Erro ao fazer upload da imagem: {message}"


@router.post("/upload", status_code=status.HTTP_201_CREATED)
async def upload_imagem_avulsa(
    file: UploadFile = File(...),
    _: object = Depends(get_current_admin),
):
    if not file.content_type or not file.content_type.startswith('image/'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Arquivo deve ser uma imagem"
        )

    try:
        contents = await file.read()
        url = upload_image(contents)
        return {"url": url}
    except Exception as e:
        logger.exception("Falha no upload de imagem avulsa")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=_upload_error_detail(e)
        )


@router.post("/{produto_id}/imagens", response_model=ImagemResponse, status_code=status.HTTP_201_CREATED)
async def upload_imagem_produto(
    produto_id: uuid.UUID,
    file: UploadFile = File(...),
    ordem: int = Form(0),
    principal: bool = Form(False),
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
    
    if not file.content_type.startswith('image/'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Arquivo deve ser uma imagem"
        )
    
    try:
        contents = await file.read()
        url = upload_image(contents, folder=f"jehfashion/produtos/{produto.slug}")
        
        if principal:
            db.query(Imagem).filter(
                Imagem.produto_id == produto_id,
                Imagem.principal == True
            ).update({"principal": False})
        
        imagem = Imagem(
            produto_id=produto_id,
            url=url,
            ordem=ordem,
            principal=principal
        )
        
        db.add(imagem)
        db.commit()
        db.refresh(imagem)
        
        redis.delete("produtos:*")
        
        return imagem
        
    except Exception as e:
        logger.exception("Falha no upload de imagem do produto")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=_upload_error_detail(e)
        )


@router.delete("/{produto_id}/imagens/{imagem_id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar_imagem_produto(
    produto_id: uuid.UUID,
    imagem_id: uuid.UUID,
    db: Session = Depends(get_db),
    redis = Depends(get_redis),
    _: object = Depends(get_current_admin),
):
    imagem = db.query(Imagem).filter(
        Imagem.id == imagem_id,
        Imagem.produto_id == produto_id
    ).first()
    
    if not imagem:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Imagem não encontrada"
        )
    
    db.delete(imagem)
    db.commit()
    
    redis.delete("produtos:*")
    
    return None


@router.put("/{produto_id}/imagens/{imagem_id}/principal", response_model=ImagemResponse)
def definir_imagem_principal(
    produto_id: uuid.UUID,
    imagem_id: uuid.UUID,
    db: Session = Depends(get_db),
    redis = Depends(get_redis),
    _: object = Depends(get_current_admin),
):
    imagem = db.query(Imagem).filter(
        Imagem.id == imagem_id,
        Imagem.produto_id == produto_id
    ).first()
    
    if not imagem:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Imagem não encontrada"
        )
    
    db.query(Imagem).filter(
        Imagem.produto_id == produto_id,
        Imagem.principal == True
    ).update({"principal": False})
    
    imagem.principal = True
    db.commit()
    db.refresh(imagem)
    
    redis.delete("produtos:*")
    
    return imagem
