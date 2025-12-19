from json import loads

from aiokafka import AIOKafkaConsumer

from utils.database_manager import db_manager


async def consume_order_created():
    consumer = AIOKafkaConsumer(
        'order_created',
        bootstrap_servers='kafka:9092',
        group_id='inventory-service',
    )
    await consumer.start()

    try:
        async for msg in consumer:
            await reserve_inventory(loads(msg.value))
    finally:
        await consumer.stop()


async def reserve_inventory(order_data):
    async with db_manager.pool.acquire() as conn:
        # *Логика проверки возможности резервации и её осуществление*
        await db_manager.pool.execute(
            'update orders set status = $2 where id = $1',
            order_data['order_id'],
            'reserved',
        )
