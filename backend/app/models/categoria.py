import uuid
from sqlalchemy import Column, String, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.database import Base


class Categoria(Base):
    __tablename__ = "categorias"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nome = Column(String, nullable=False)
    slug = Column(String, unique=True, index=True, nullable=False)
    pai_id = Column(UUID(as_uuid=True), ForeignKey("categorias.id"), nullable=True)
    criado_em = Column(DateTime, default=datetime.utcnow)
    
    pai = relationship("Categoria", remote_side=[id], backref="subcategorias")
    produtos = relationship("Produto", back_populates="categoria")
