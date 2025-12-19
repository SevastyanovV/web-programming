from pydantic import BaseModel


class ItemSchema(BaseModel):
    product_id: int
    quantity: int
    price: float


class OrderCreate(BaseModel):
    user_id: int
    items: list[ItemSchema]


class PayOrder(BaseModel):
    order_id: int
    amount: float
