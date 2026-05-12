from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    PROJECT_NAME: str = "JehFashion API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/jehfashion"
    REDIS_URL: str = "redis://localhost:6379/0"
    
    SECRET_KEY: str = "change-this-secret-key-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    CLOUDINARY_CLOUD_NAME: str = ""
    CLOUDINARY_API_KEY: str = ""
    CLOUDINARY_API_SECRET: str = ""
    
    WHATSAPP_NUMBER: str = "5511934855599"

    ADMIN_EMAIL: str = "jeh@gmail.com"
    ADMIN_PASSWORD: str = "vini"

    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "https://loja-jeh.vercel.app",
        "https://loja-2n31p101u-vinicius-morrones.projects.vercel.app",
    ]
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
