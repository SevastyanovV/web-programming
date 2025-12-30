from contextlib import asynccontextmanager
from json import dumps, loads
from os import getenv

from asyncpg import Pool, create_pool, Connection


class _DatabaseManager:
    def __init__(self):
        self.pool: Pool | None = None

    @asynccontextmanager
    async def lifespan(self):
        """
        Контекстный менеджер для управления временем жизни пула соединений с БД.
        """
        async with create_pool(
                host=getenv('POSTGRES_HOST'),
                port=int(getenv('POSTGRES_PORT')),
                database=getenv('POSTGRES_DB'),
                user=getenv('POSTGRES_USER'),
                password=getenv('POSTGRES_PASSWORD'),
                init=self.__init_connection,
        ) as pool:
            self.pool = pool
            yield
            self.pool = None

    @staticmethod
    async def __init_connection(conn: Connection) -> None:
        """
        Инициализация соединения: установка пользовательского кодека.

        Args:
            conn: объект соединения из asyncpg

        Returns:
            None
        """
        await conn.set_type_codec(
            'json',
            encoder=dumps,
            decoder=loads,
            schema='pg_catalog',
        )
        await conn.set_type_codec(
            'jsonb',
            encoder=dumps,
            decoder=loads,
            schema='pg_catalog',
        )


db_manager = _DatabaseManager()
