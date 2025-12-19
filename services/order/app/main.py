from asyncio import get_running_loop
from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.endpoints import router
from app.outbox import start_outbox_processor
from utils.database_manager import db_manager


@asynccontextmanager
async def _lifespan(app_: FastAPI):
    async with db_manager.lifespan():
        loop = get_running_loop()
        loop.create_task(start_outbox_processor())
        yield


app = FastAPI(
    title='Order Service',
    lifespan=_lifespan,
    redoc_url=None,
)

app.include_router(router)



