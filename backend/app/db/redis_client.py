import redis
from app.core.config import settings

redis_client = None
if settings.REDIS_URL:
    try:
        redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)
    except Exception:
        redis_client = None


class _NoopRedis:
    def get(self, *args, **kwargs):
        return None

    def setex(self, *args, **kwargs):
        return None

    def delete(self, *args, **kwargs):
        return None

    def keys(self, *args, **kwargs):
        return []


def get_redis():
    return redis_client if redis_client is not None else _NoopRedis()
