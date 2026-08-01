from pydantic import BaseModel


class TransactionCreate(BaseModel):

    customer_name: str

    product_name: str

    amount: float

    transaction_date: str


class TransactionResponse(BaseModel):

    id: int

    customer_name: str

    product_name: str

    amount: float

    transaction_date: str

    class Config:
        from_attributes = True