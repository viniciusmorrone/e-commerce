import cloudinary
import cloudinary.uploader
from app.core.config import settings

cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET
)


def upload_image(file, folder: str = "jehfashion/produtos"):
    try:
        result = cloudinary.uploader.upload(
            file,
            folder=folder,
            transformation=[
                {"quality": "auto", "fetch_format": "auto"},
                {"width": 1200, "height": 1200, "crop": "limit"}
            ]
        )
        return result["secure_url"]
    except Exception as e:
        raise Exception(f"Erro ao fazer upload da imagem: {str(e)}")


def delete_image(public_id: str):
    try:
        result = cloudinary.uploader.destroy(public_id)
        return result
    except Exception as e:
        raise Exception(f"Erro ao deletar imagem: {str(e)}")
