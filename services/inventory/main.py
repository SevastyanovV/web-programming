from asyncio import get_running_loop, run, sleep
from math import inf

from app.inventory import consume_order_created
from utils.database_manager import db_manager


async def app_lifespan() -> None:
    async with db_manager.lifespan():
        loop = get_running_loop()
        loop.create_task(consume_order_created())
        await sleep(inf)


if __name__ == '__main__':
    run(app_lifespan())
