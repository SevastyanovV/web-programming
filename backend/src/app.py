from contextlib import asynccontextmanager

from fastapi import FastAPI
from starlette.staticfiles import StaticFiles

from src.views import router
from utils.database_manager import db_manager


@asynccontextmanager
async def _lifespan(app_: FastAPI):
    async with db_manager.lifespan():
        yield


app = FastAPI(
    title='Purchasing seats',
    lifespan=_lifespan,
    redoc_url=None,
)

app.mount('/static', StaticFiles(directory='static'), name='static')

app.include_router(router)
