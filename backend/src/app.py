from contextlib import asynccontextmanager

from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware
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

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

app.mount('/static', StaticFiles(directory='static'), name='static')

app.include_router(router)
