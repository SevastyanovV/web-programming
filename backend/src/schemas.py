from datetime import datetime

from pydantic import BaseModel, Field, field_serializer


class EventBase(BaseModel):
    id: int
    title: str
    datetime: datetime
    author: str
    img_url: str
    price: float
    rating: float
    discount: float

    @field_serializer('datetime')
    def serialize_datetime(self, dt: datetime, _info):
        return dt.strftime('%Y-%m-%d %H:%M')


class EventDetail(EventBase):
    tags: list[str]


class OrderRequest(BaseModel):
    seats: list[str] = Field(..., min_items=1)
    payment: float = Field(..., gt=0.)


class OrderResponse(BaseModel):
    status: str  # 'bought' | 'denied'
    reason: str | None = None  # null | <reason>
    ticket: str | None = None  # <ticket> | null
