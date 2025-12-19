from asyncio import sleep
from json import dumps

from aiokafka import AIOKafkaProducer

from utils.database_manager import db_manager


producer: AIOKafkaProducer | None = None


async def start_outbox_processor():
    global producer
    producer = AIOKafkaProducer(
        bootstrap_servers='kafka:9092',
    )
    await producer.start()

    while True:
        await process_outbox()
        await sleep(1)


async def process_outbox():
    async with db_manager.pool.acquire() as conn:
        records = await conn.fetch(
            '''
            select
                id, event_type, payload
            from
                outbox
            where
                not processed
            '''
        )
        for record in records:
            await producer.send_and_wait(
                get_topic_for_event(record['event_type']),
                dumps(record['payload']).encode()
            )
            await conn.execute(
                'update outbox set processed = true where id = $1',
                record['id'],
            )


def get_topic_for_event(event_type: str) -> str:
    if event_type == 'order_created':
        return 'order_created'
    if event_type == 'payment_initiated':
        return 'payment_initiated'
    raise ValueError(f'Unknown event type: {event_type}')
