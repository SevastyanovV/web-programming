from datetime import datetime

from pydantic import BaseModel


class Order(BaseModel):
    id: int
    user_id: int
    items: list[dict]  # Пример: [{"product_id": 1, "quantity": 2, "price": 100}]
    status: str  # "created", "paid", "completed", "cancelled"
    created_at: datetime | None = None

    # class Config:
    #     orm_mode = True
