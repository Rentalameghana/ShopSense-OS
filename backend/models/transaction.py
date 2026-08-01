from sqlalchemy import Column, Integer, String, Float

from backend.database.database import Base


class Transaction(Base):

    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)

    customer_name = Column(String, nullable=False)

    product_name = Column(String, nullable=False)

    amount = Column(Float, nullable=False)

    transaction_date = Column(String, nullable=False)