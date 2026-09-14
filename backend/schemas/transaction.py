from pydantic import BaseModel, Field


class TransactionCreate(BaseModel):
    customer_name: str = Field(..., min_length=2, description="Name of the purchasing customer", examples=["John Doe"])
    product_name: str = Field(..., min_length=1, description="Name of the purchased product", examples=["Laptop"])
    amount: float = Field(..., gt=0, description="Transaction purchase amount in INR", examples=[50000.0])
    transaction_date: str = Field(..., description="Transaction date in YYYY-MM-DD format", examples=["2026-03-01"])
    vendor_id: int = Field(..., description="ID of the selling vendor", examples=[1])


class TransactionResponse(BaseModel):
    id: int = Field(..., description="Unique transaction ID", examples=[1])
    customer_name: str = Field(..., description="Customer name", examples=["John Doe"])
    product_name: str = Field(..., description="Product name", examples=["Laptop"])
    amount: float = Field(..., description="Transaction amount in INR", examples=[50000.0])
    transaction_date: str = Field(..., description="Transaction date string", examples=["2026-03-01"])
    vendor_id: int = Field(..., description="Vendor ID", examples=[1])

    class Config:
        from_attributes = True


class TransactionCountResponse(BaseModel):
    total_transactions: int = Field(..., description="Total count of recorded transactions", examples=[25])


class TotalRevenueResponse(BaseModel):
    total_revenue: float = Field(..., description="Cumulative total revenue in INR", examples=[125000.0])
