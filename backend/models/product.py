from sqlalchemy import Column, Integer, String, Float

from backend.database.database import Base


class Product(Base):

    __tablename__ = "products"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    product_name = Column(
        String,
        nullable=False
    )

    category = Column(
        String,
        nullable=False
    )

    price = Column(
        Float,
        nullable=False
    )

    stock_quantity = Column(
        Integer,
        nullable=False,
        default=0
    )

    image_url = Column(
        String,
        nullable=True
    )