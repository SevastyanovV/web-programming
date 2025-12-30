from fastapi import WebSocket, APIRouter, Depends

from src.schemas import EventBase, EventDetail, OrderRequest, OrderResponse
from src.services import (
    get_event_service,
    get_events_service,
    create_order_service,
    websocket_event_service,
)

router = APIRouter()


def get_current_user_id() -> int:
    """
    Получение ID пользователя, так как авторизация не предусмотрена, в качестве
    заглушки всегда возвращаем тестового юзера с ID 1
    """
    return 1


@router.get('/events', response_model=dict[str, list[EventBase]])
async def get_events() -> dict[str, list[EventBase]]:
    return await get_events_service()


@router.get('/event/{event_id}', response_model=EventDetail)
async def get_event(event_id: int) -> EventDetail:
    return await get_event_service(event_id)


@router.post('/event/{event_id}/orders', response_model=OrderResponse)
async def create_order(
        event_id: int,
        order_data: OrderRequest,
        user_id: int = Depends(get_current_user_id),
) -> OrderResponse:
    return await create_order_service(event_id, order_data, user_id)


@router.websocket('/ws/event/{event_id}')
async def websocket_event(websocket: WebSocket, event_id: int) -> None:
    await websocket_event_service(websocket, event_id)
