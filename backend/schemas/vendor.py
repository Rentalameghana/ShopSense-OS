from pydantic import BaseModel, EmailStr, Field


class VendorCreate(BaseModel):
    business_name: str = Field(..., min_length=2, description="Registered business or brand name", examples=["Acme Electronics"])
    corporate_email: EmailStr = Field(..., description="Official business contact email", examples=["contact@acme.com"])


class VendorResponse(BaseModel):
    id: int = Field(..., description="Unique vendor ID", examples=[1])
    business_name: str = Field(..., description="Registered business name", examples=["Acme Electronics"])
    corporate_email: EmailStr = Field(..., description="Official contact email", examples=["contact@acme.com"])
    status: str = Field(..., description="Vendor onboarding status (e.g. Pending, Approved, Suspended)", examples=["Pending"])

    class Config:
        from_attributes = True


class VendorStatusUpdate(BaseModel):
    status: str = Field(..., min_length=1, description="New status value (e.g. Approved, Suspended, Pending)", examples=["Approved"])


class ActiveVendorCountResponse(BaseModel):
    active_vendors: int = Field(..., description="Total count of active (Approved) vendors", examples=[4])
