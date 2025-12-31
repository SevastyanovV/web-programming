from collections import defaultdict
from datetime import datetime
from os import getenv
from uuid import uuid4

from asyncpg import Connection
from starlette.exceptions import HTTPException
from starlette.websockets import WebSocket, WebSocketDisconnect

from src.schemas import EventBase, EventDetail, OrderRequest, OrderResponse
from utils.database_manager import db_manager
from utils.logger import get_error_logger

error_logger = get_error_logger('services')

active_connections: defaultdict[int, set[WebSocket]] = defaultdict(set)
self_url = getenv('SELF_URL')


async def get_events_service() -> dict[str, list[EventBase]]:
    events = await db_manager.pool.fetch(
        '''
        select
            et."type",
            e.id,
            e."name",
            e.datetime,
            e.author,
            e.img_name,
            e.price,
            e.rating,
            e.discount
        from
            events e
        join
            event_types et on et.id = e.type_id
        where
            e.datetime > $1
        order by
            e.datetime
        ''',
        datetime.now(),
    )
    res = defaultdict(list)
    for event in events:
        res[event[0]].append(EventBase(
            id=event[1],
            title=event[2],
            datetime=event[3],
            author=event[4],
            img_url=f'{self_url}/static/{event[5]}',
            price=event[6],
            rating=event[7],
            discount=event[8],
        ))
    return res


async def get_event_service(event_id: int) -> EventDetail:
    event = await db_manager.pool.fetchrow(
        '''
        select 
            id,
            name,
            datetime,
            author,
            img_name,
            price,
            rating,
            discount,
            coalesce(tags, array[]::text[]) tags
        from
            events
        where
            id = $1
        ''',
        event_id,
    )

    if event:
        return EventDetail(
            id=event[0],
            title=event[1],
            datetime=event[2],
            author=event[3],
            img_url=f'{self_url}/static/{event[4]}',
            price=event[5],
            rating=event[6],
            discount=event[7],
            tags=event[8],
        )

    raise HTTPException(status_code=404, detail='Event not found')


async def create_order_service(
        event_id: int,
        order_data: OrderRequest,
        user_id: int,
) -> OrderResponse:
    async with db_manager.pool.acquire() as connection:
        async with connection.transaction():
            event = await connection.fetchrow(
                'select price, datetime from events where id = $1',
                event_id,
            )
            if not event:
                return OrderResponse(
                    status='denied',
                    reason='Мероприятие не найдено',
                    ticket=None,
                )

            if event['datetime'] < datetime.now():
                return OrderResponse(
                    status='denied',
                    reason='Мероприятие уже началось или закончилось',
                    ticket=None,
                )

            price = float(event['price'])
            cost = 0.
            for seat in order_data.seats:
                if seat.startswith('A'):
                    cost += price + 1500.
                elif seat.startswith('B'):
                    cost += price + 1000.
                elif seat.startswith('C'):
                    cost += price
                else:
                    return OrderResponse(
                        status='denied',
                        reason=f'Неверное ID места: {seat}',
                        ticket=None,
                    )

            if abs(order_data.payment - float(cost)) > 1e-6:
                return OrderResponse(
                    status='denied',
                    reason='Некорректная сумма оплаты',
                    ticket=None,
                )

            occupied = await connection.fetchval(
                '''
                select
                    array_agg(seat_id order by seat_id)
                from
                    occupied_seats 
                where
                    event_id = $1 and seat_id = any($2)
                ''',
                event_id,
                order_data.seats,
            )
            if occupied:
                return OrderResponse(
                    status='denied',
                    reason=f'Эти места уже заняты: {", ".join(occupied)}',
                    ticket=None,
                )

            ticket_code = str(uuid4())[:32]
            while await _is_ticket_code_exists(ticket_code, connection):
                ticket_code = str(uuid4())[:32]

            order_id = await connection.fetchval(
                '''
                insert into
                    orders (user_id, event_id, payment, ticket_code)
                values
                    ($1, $2, $3, $4)
                returning
                    id
                ''',
                user_id,
                event_id,
                order_data.payment,
                ticket_code,
            )

            await connection.executemany(
                '''
                insert into
                    occupied_seats (event_id, seat_id, order_id)
                values
                    ($1, $2, $3)
                ''',
                [(event_id, seat_id, order_id) for seat_id in order_data.seats],
            )

            await _broadcast_occupied_seats(event_id, order_data.seats)

            return OrderResponse(
                status='bought',
                reason=None,
                ticket=ticket_code,
            )


async def websocket_event_service(websocket: WebSocket, event_id: int) -> None:
    await websocket.accept()
    active_connections[event_id].add(websocket)

    try:
        await websocket.send_json(
            await db_manager.pool.fetchval(
                '''
                select
                    array_agg(seat_id order by seat_id)
                from
                    occupied_seats
                where
                    event_id = $1
                ''',
                event_id,
            ) or []
        )

        while True:
            data = await websocket.receive()
            if data.get('type') == 'websocket.disconnect':
                break

    except WebSocketDisconnect:
        pass

    except Exception as e:
        error_logger.exception(f'Unexpected error: {e}')

    finally:
        event_connections = active_connections[event_id]
        event_connections.remove(websocket)
        if not event_connections:
            del active_connections[event_id]


async def _is_ticket_code_exists(
        ticket_code: str,
        connection: Connection,
) -> bool | None:
    return await connection.fetchval(
        'select true from orders where ticket_code = $1',
        ticket_code,
    )


async def _broadcast_occupied_seats(event_id: int, seat_ids: list[str]) -> None:
    event_connections = active_connections.get(event_id)
    if event_connections:
        for websocket in event_connections:
            try:
                await websocket.send_json(seat_ids)
            except:
                pass
