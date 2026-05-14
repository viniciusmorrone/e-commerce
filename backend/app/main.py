from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.database import engine, Base
from app.api.routes import auth, categorias, produtos, imagens, estoque, whatsapp, admin_produtos, setup
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
)

logger.info(f"CORS_ORIGINS loaded: {settings.CORS_ORIGINS}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)


@app.middleware("http")
async def options_middleware(request: Request, call_next):
    if request.method == "OPTIONS":
        response = Response(status_code=200)
        origin = request.headers.get("origin", "")
        
        if origin in settings.CORS_ORIGINS or any(origin.endswith(".vercel.app") for origin in settings.CORS_ORIGINS):
            response.headers["Access-Control-Allow-Origin"] = origin
        else:
            response.headers["Access-Control-Allow-Origin"] = "*"
        
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, PATCH"
        response.headers["Access-Control-Allow-Headers"] = "*"
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Max-Age"] = "3600"
        return response
    
    return await call_next(request)


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
