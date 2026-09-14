from pydantic import BaseModel, EmailStr, Field


class CustomerCreate(BaseModel):
    customer_name: str = Field(..., min_length=2, description="Full name of the customer", examples=["John Doe"])
    email: EmailStr = Field(..., description="Unique customer email address", examples=["john@example.com"])
    phone: str = Field(..., min_length=10, max_length=15, description="Customer contact phone number", examples=["9876543210"])


class CustomerResponse(BaseModel):
    id: int = Field(..., description="Unique customer ID", examples=[1])
    customer_name: str = Field(..., description="Customer full name", examples=["John Doe"])
    email: EmailStr = Field(..., description="Customer email address", examples=["john@example.com"])
    phone: str = Field(..., description="Customer phone number", examples=["9876543210"])

    class Config:
        from_attributes = True


class CustomerCountResponse(BaseModel):
    total_customers: int = Field(..., description="Total count of registered customers", examples=[10])


class CustomerSegmentResponse(CustomerResponse):
    total_spending: float = Field(..., description="Lifetime total purchase amount in INR", examples=[4500.0])
    segment: str = Field(..., description="Customer value tier ('Low Spender', 'Medium Spender', 'High Spender')", examples=["Medium Spender"])
