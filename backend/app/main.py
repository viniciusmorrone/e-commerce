from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
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


class CustomCORSMiddleware:
    def __init__(self, app):
        self.app = app
        self.allow_origins = settings.CORS_ORIGINS
        self.allow_credentials = True
        self.allow_methods = ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"]
        self.allow_headers = ["*"]
        self.max_age = 3600
    
    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return
        
        request = Request(scope, receive)
        origin = request.headers.get("origin", "")
        
        # Verificar se a origem é permitida
        is_allowed = origin in self.allow_origins
        
        # Se não está na lista exata, verificar se é um domínio vercel.app
        if not is_allowed and origin:
            is_allowed = origin.endswith(".vercel.app") or any(
                allowed in origin for allowed in self.allow_origins if "vercel" in allowed
            )
        
        if request.method == "OPTIONS":
            # Responder preflight diretamente
            headers = {
                b"access-control-allow-origin": origin.encode() if is_allowed else b"*",
                b"access-control-allow-methods": b"GET, POST, PUT, DELETE, OPTIONS, PATCH",
                b"access-control-allow-headers": b"*",
                b"access-control-allow-credentials": b"true",
                b"access-control-max-age": b"3600",
                b"content-type": b"application/json",
            }
            
            await send({
                "type": "http.response.start",
                "status": 200,
                "headers": list(headers.items()),
            })
            await send({
                "type": "http.response.body",
                "body": b'{"message": "OK"}',
            })
            return
        
        # Para requisições normais, adicionar headers CORS na resposta
        async def custom_send(message):
            if message["type"] == "http.response.start":
                headers = list(message.get("headers", []))
                
                # Adicionar headers CORS
                if is_allowed:
                    headers.append((b"access-control-allow-origin", origin.encode()))
                else:
                    headers.append((b"access-control-allow-origin", b"*"))
                
                headers.append((b"access-control-allow-credentials", b"true"))
                headers.append((b"access-control-allow-methods", b"GET, POST, PUT, DELETE, OPTIONS, PATCH"))
                headers.append((b"access-control-allow-headers", b"*"))
                headers.append((b"access-control-max-age", b"3600"))
                
                message["headers"] = headers
            
            await send(message)
        
        await self.app(scope, receive, custom_send)


# Adicionar middleware customizado ANTES do CORSMiddleware nativo
app.add_middleware(CustomCORSMiddleware)

# Manter CORSMiddleware nativo como backup
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
