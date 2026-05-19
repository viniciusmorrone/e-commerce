from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from app.core.config import settings
from app.db.database import engine, Base
from app.api.routes import auth, categorias, produtos, imagens, estoque, whatsapp, admin_produtos, setup
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    redirect_slashes=False,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

logger.info(f"CORS_ORIGINS loaded: {settings.CORS_ORIGINS}")

@app.middleware("http")
async def log_requests(request, call_next):
    origin = request.headers.get("origin", "NO-ORIGIN")
    logging.warning(f"Origin recebida: {origin}")
    logger.info(f"Request: {request.method} {request.url.path} - Origin: {origin}")
    response = await call_next(request)
    logger.info(f"Response: {response.status_code} - Headers: {dict(response.headers)}")
    return response

logging.warning(f"CORS_ORIGINS configurado: {settings.CORS_ORIGINS}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)


@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)

app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/admin/auth", tags=["auth"])
app.include_router(setup.router, prefix=f"{settings.API_V1_STR}/setup", tags=["setup"])
app.include_router(categorias.router, prefix=f"{settings.API_V1_STR}/categorias", tags=["categorias"])
app.include_router(produtos.router, prefix=f"{settings.API_V1_STR}/produtos", tags=["produtos"])
app.include_router(imagens.router, prefix=f"{settings.API_V1_STR}/admin/produtos", tags=["imagens"])
app.include_router(estoque.router, prefix=f"{settings.API_V1_STR}/admin/estoque", tags=["estoque"])
app.include_router(admin_produtos.router, prefix=f"{settings.API_V1_STR}/admin/produtos", tags=["admin-produtos"])
app.include_router(whatsapp.router, prefix=f"{settings.API_V1_STR}/produtos", tags=["whatsapp"])


@app.get("/")
def root():
    return {
        "message": "JehFashion API",
        "version": settings.VERSION,
        "docs": f"{settings.API_V1_STR}/docs"
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}


@app.get("/cors-test")
def cors_test():
    return {"cors": "working", "origins": settings.CORS_ORIGINS}
