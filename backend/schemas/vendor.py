from pydantic import BaseModel, EmailStr


class VendorCreate(BaseModel):
    business_name: str
    corporate_email: EmailStr


class VendorResponse(BaseModel):
    id: int
    business_name: str
    corporate_email: EmailStr
    status: str

    class Config:
        from_attributes = True


class VendorStatusUpdate(BaseModel):
    status: str