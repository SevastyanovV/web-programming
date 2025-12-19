from json import loads

from aiokafka import AIOKafkaConsumer

from utils.database_manager import db_manager


async def consume_payment_initiated():
    consumer = AIOKafkaConsumer(
        'payment_initiated',
        bootstrap_servers='kafka:9092',
        group_id='payment-service',
    )
    await consumer.start()

    try:
        async for msg in consumer:
            await process_payment(loads(msg.value))
    finally:
        await consumer.stop()


async def process_payment(order_data):
    async with db_manager.pool.acquire() as conn:
        payment_successful = await check_payment(order_data)

        if payment_successful:
            await conn.execute(
                'update orders set status = $2, payment = $3 where id = $1',
                order_data['order_id'],
                'paid',
                order_data['amount'],
            )


async def check_payment(order_data) -> bool:
    # Здесь должна быть логика проверки платежа
    return True  # упрощенная реализация
