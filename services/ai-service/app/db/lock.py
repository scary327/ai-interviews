from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from sqlalchemy import func, pool, select
from sqlalchemy.ext.asyncio import create_async_engine

from app.config import settings

lock_engine = create_async_engine(
    settings.db_url, poolclass=pool.NullPool, isolation_level="AUTOCOMMIT"
)


@asynccontextmanager
async def advisory_lock(key: str) -> AsyncIterator[bool]:
    lock_id = func.hashtextextended(key, 0)
    async with lock_engine.connect() as connection:
        locked = bool(await connection.scalar(select(func.pg_try_advisory_lock(lock_id))))
        try:
            yield locked
        finally:
            if locked:
                try:
                    await connection.scalar(select(func.pg_advisory_unlock(lock_id)))
                except BaseException:
                    await connection.invalidate()
                    raise
