from pydantic import BaseModel


class ProductCreate(BaseModel):

    product_name: str

    category: str

    price: float



class ProductResponse(BaseModel):

    id: int

    product_name: str

    category: str

    price: float


    class Config:

        from_attributes = True