from fastapi import FastAPI, Request, Response
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
async def cors_middleware(request: Request, call_next):
    origin = request.headers.get("origin", "")
    allowed = origin in settings.CORS_ORIGINS
    
    if request.method == "OPTIONS" and origin:
        if allowed:
            response = Response(
                status_code=200,
                content="",
                headers={
                    "Access-Control-Allow-Origin": origin,
                    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
                    "Access-Control-Allow-Headers": "*",
                    "Access-Control-Allow-Credentials": "true",
                    "Access-Control-Max-Age": "3600",
                }
            )
        else:
            response = Response(status_code=200, content="")
        
        return response
    
    response = await call_next(request)
    
    if allowed and origin:
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Expose-Headers"] = "*"
    
    return response


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
