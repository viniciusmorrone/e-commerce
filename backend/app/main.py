from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from app.core.config import settings
from app.db.database import engine, Base
from app.api.routes import auth, categorias, produtos, imagens, estoque, whatsapp, admin_produtos, setup

limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    redirect_slashes=False,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)

# CORS middleware - validates origins explicitly
@app.middleware("http")
async def cors_middleware(request: Request, call_next):
    # Only handle CORS for OPTIONS preflight requests with Origin header
    if request.method == "OPTIONS" and "origin" in request.headers:
        origin = request.headers.get("origin", "")
        allowed = origin in settings.CORS_ORIGINS
        
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
            # Origin NOT allowed - return 200 WITHOUT CORS headers
            response = Response(status_code=200, content="")
        
        return response
    
    # For all other requests, process normally
    response = await call_next(request)
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
