from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.schemas.categoria import CategoriaResponse, CategoriaCreate, CategoriaUpdate
from app.models.categoria import Categoria
from app.api.deps import get_current_admin
import uuid

router = APIRouter()


@router.get("/", response_model=List[CategoriaResponse])
def listar_categorias(db: Session = Depends(get_db)):
    categorias = db.query(Categoria).filter(Categoria.pai_id == None).all()
    return categorias


@router.get("/{categoria_id}", response_model=CategoriaResponse)
def obter_categoria(categoria_id: uuid.UUID, db: Session = Depends(get_db)):
    categoria = db.query(Categoria).filter(Categoria.id == categoria_id).first()
    if not categoria:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Categoria não encontrada"
        )
    return categoria


@router.post("/", response_model=CategoriaResponse, status_code=status.HTTP_201_CREATED)
def criar_categoria(
    categoria_data: CategoriaCreate,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin),
):
    existing = db.query(Categoria).filter(Categoria.slug == categoria_data.slug).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Categoria com este slug já existe"
        )
    
    categoria = Categoria(**categoria_data.model_dump())
    db.add(categoria)
    db.commit()
    db.refresh(categoria)
    return categoria


@router.put("/{categoria_id}", response_model=CategoriaResponse)
def atualizar_categoria(
    categoria_id: uuid.UUID,
    categoria_data: CategoriaUpdate,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin),
):
    categoria = db.query(Categoria).filter(Categoria.id == categoria_id).first()
    if not categoria:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Categoria não encontrada"
        )
    
    update_data = categoria_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(categoria, field, value)
    
    db.commit()
    db.refresh(categoria)
    return categoria


@router.delete("/{categoria_id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar_categoria(
    categoria_id: uuid.UUID,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin),
):
    categoria = db.query(Categoria).filter(Categoria.id == categoria_id).first()
    if not categoria:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Categoria não encontrada"
        )
    
    db.delete(categoria)
    db.commit()
    return None
