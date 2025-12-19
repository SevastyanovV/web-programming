import json
from contextlib import asynccontextmanager
from os import getenv

from asyncpg import Pool, create_pool
from asyncpg.connection import Connection


class _DatabaseManager:

    def __init__(self):
        self.__pool: Pool | None = None

    @property
    def pool(self) -> Pool:
        """
        Получить пул соединений для выполнения CRUD операций с базой данных.

        Returns:
            Объект класса Pool из asyncpg
        """
        return self.__pool

    @asynccontextmanager
    async def lifespan(self):
        """
        Контекстный менеджер для управления временем жизни пула соединений.
        Использовать только для инициализации и завершения работы приложения.
        """
        await self.__create_pool()
        try:
            yield
        finally:
            await self.__close_pool()

    async def __create_pool(self) -> None:
        """
        Создать пул соединений для выполнения CRUD операций с базой данных.

        Returns:
            None
        """
        self.__pool = await create_pool(
            host=getenv('POSTGRES_HOST'),
            port=int(getenv('POSTGRES_PORT')),
            database=getenv('POSTGRES_DB'),
            user=getenv('POSTGRES_USER'),
            password=getenv('POSTGRES_PASSWORD'),
            init=self.__init_connection,
        )

    async def __close_pool(self) -> None:
        """
        Закрыть пул соединений с базой данных.

        Returns:
            None
        """
        await self.__pool.close()
        self.__pool = None

    @staticmethod
    async def __init_connection(conn: Connection) -> None:
        """
        Инициализация соединения: установка пользовательского кодека.

        Args:
            conn: Объект соединения из asyncpg

        Returns:
            None
        """
        await conn.set_type_codec(
            'json',
            encoder=json.dumps,
            decoder=json.loads,
            schema='pg_catalog',
        )
        await conn.set_type_codec(
            'jsonb',
            encoder=json.dumps,
            decoder=json.loads,
            schema='pg_catalog',
        )


db_manager = _DatabaseManager()
