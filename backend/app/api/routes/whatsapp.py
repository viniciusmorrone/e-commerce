from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from app.db.database import get_db
from app.models.produto import Produto, Variante
from app.core.config import settings
import uuid
import urllib.parse

router = APIRouter()


class WhatsAppLinkResponse(BaseModel):
    url: str
    mensagem: str


@router.get("/{slug}/whatsapp", response_model=WhatsAppLinkResponse)
def gerar_link_whatsapp(
    slug: str,
    variante_id: Optional[uuid.UUID] = Query(None),
    db: Session = Depends(get_db)
):
    produto = db.query(Produto).filter(
        Produto.slug == slug,
        Produto.ativo == True
    ).first()
    
    if not produto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Produto não encontrado"
        )
    
    mensagem_partes = [
        f"Olá! Tenho interesse no produto:",
        f"📦 *{produto.nome}*"
    ]
    
    if variante_id:
        variante = db.query(Variante).filter(
            Variante.id == variante_id,
            Variante.produto_id == produto.id
        ).first()
        
        if variante:
            detalhes = []
            if variante.cor:
                detalhes.append(f"Cor: {variante.cor}")
            if variante.tamanho:
                detalhes.append(f"Tamanho: {variante.tamanho}")
            
            if detalhes:
                mensagem_partes.append(f"🎨 {' | '.join(detalhes)}")
            
            if variante.qtd_estoque == 0:
                mensagem_partes.append(f"⚠️ Gostaria de consultar disponibilidade")
    
    mensagem_partes.append(f"\n🔗 Link: https://jehfashion.com/produtos/{slug}")
    
    mensagem = "\n".join(mensagem_partes)
    mensagem_encoded = urllib.parse.quote(mensagem)
    
    whatsapp_url = f"https://wa.me/{settings.WHATSAPP_NUMBER}?text={mensagem_encoded}"
    
    return WhatsAppLinkResponse(
        url=whatsapp_url,
        mensagem=mensagem
    )
