import uuid
from sqlalchemy import Column, String, Text, Numeric, Boolean, DateTime, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.database import Base


class Produto(Base):
    __tablename__ = "produtos"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nome = Column(String, nullable=False)
    slug = Column(String, unique=True, index=True, nullable=False)
    descricao = Column(Text, nullable=True)
    preco = Column(Numeric(10, 2), nullable=False)
    categoria_id = Column(UUID(as_uuid=True), ForeignKey("categorias.id"), nullable=False)
    ativo = Column(Boolean, default=True)
    criado_em = Column(DateTime, default=datetime.utcnow)
    atualizado_em = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    categoria = relationship("Categoria", back_populates="produtos")
    variantes = relationship("Variante", back_populates="produto", cascade="all, delete-orphan")
    imagens = relationship("Imagem", back_populates="produto", cascade="all, delete-orphan")


class Variante(Base):
    __tablename__ = "variantes"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    produto_id = Column(UUID(as_uuid=True), ForeignKey("produtos.id"), nullable=False)
    tamanho = Column(String, nullable=True)
    cor = Column(String, nullable=True)
    qtd_estoque = Column(Integer, default=0)
    sku = Column(String, unique=True, index=True, nullable=False)
    criado_em = Column(DateTime, default=datetime.utcnow)
    
    produto = relationship("Produto", back_populates="variantes")


class Imagem(Base):
    __tablename__ = "imagens"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    produto_id = Column(UUID(as_uuid=True), ForeignKey("produtos.id"), nullable=False)
    url = Column(String, nullable=False)
    ordem = Column(Integer, default=0)
    principal = Column(Boolean, default=False)
    criado_em = Column(DateTime, default=datetime.utcnow)
    
    produto = relationship("Produto", back_populates="imagens")
