from fastapi import APIRouter

from app.models import Order
from app.schemas import OrderCreate, PayOrder
from utils.database_manager import db_manager

router = APIRouter()


@router.get('/get-orders')
async def get_orders(user_id: int):
    return await db_manager.pool.fetch(
        'select * from orders where user_id = $1',
        user_id,
    )


@router.post('/create-order')
async def create_order(order_data: OrderCreate):
    async with db_manager.pool.acquire() as conn:
        order = Order(**await conn.fetchrow(
            '''
            insert into
                orders (user_id, items, status)
            values
                ($1, $2, $3)
            returning
                id, user_id, items, status, created_at
            ''',
            order_data.user_id,
            [dict(val) for val in order_data.items],
            'created',
        ))
        cost = sum(item['price'] * item['quantity'] for item in order.items)
        await conn.execute(
            '''
            insert into
                outbox (event_type, payload)
            values
                ($1, $2)
            ''',
            'order_created',
            {
                'order_id': order.id,
                'user_id': order.user_id,
                'items': order.items,
                'total_amount': cost,
            }
        )
    return {'id': order.id, 'status': order.status, 'cost': cost}


@router.post('/pay-order')
async def pay_order(pay_data: PayOrder):
    async with db_manager.pool.acquire() as conn:
        status = 'payment_initiated'
        await conn.execute(
            'update orders set status = $2 where id = $1',
            pay_data.order_id,
            status,
        )
        await conn.execute(
            '''
            insert into
                outbox (event_type, payload)
            values
                ($1, $2)
            ''',
            'payment_initiated',
            {
                'order_id': pay_data.order_id,
                'amount': pay_data.amount,
            }
        )
    return {'status': status}
