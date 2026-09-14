from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from backend.crud.customer import (
    create_customer,
    get_all_customers,
    get_customer_count,
    get_customer_segments
)
from backend.schemas.customer import (
    CustomerCountResponse,
    CustomerCreate,
    CustomerResponse,
    CustomerSegmentResponse
)
from backend.database.database import SessionLocal


router = APIRouter(
    prefix="/customers",
    tags=["Customers"]
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post(
    "/",
    response_model=CustomerResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register New Customer",
    description="Registers a new customer profile. Email address must be unique across the platform.",
    response_description="Created customer record",
    responses={
        400: {"description": "Customer with this email already exists"}
    }
)
def add_customer(
    customer: CustomerCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new customer profile with validated email and phone number.
    """
    return create_customer(db, customer)


@router.get(
    "/",
    response_model=list[CustomerResponse],
    summary="List All Customers",
    description="Retrieves a list of all registered customers with contact details.",
    response_description="Array of customer profiles"
)
def list_customers(
    db: Session = Depends(get_db)
):
    """
    Fetch all customer records.
    """
    return get_all_customers(db)


@router.get(
    "/count",
    response_model=CustomerCountResponse,
    summary="Get Total Customer Count",
    description="Returns the total number of registered customers.",
    response_description="Total customer count"
)
def customer_count(
    db: Session = Depends(get_db)
):
    """
    Retrieve the count of all registered customers.
    """
    return {
        "total_customers": get_customer_count(db)
    }


@router.get(
    "/segments",
    response_model=list[CustomerSegmentResponse],
    summary="Get Customer Spending Segments",
    description="Analyzes customer transaction histories and classifies each customer into spending tiers: 'Low Spender' (< ₹1,000), 'Medium Spender' (₹1,000 - ₹5,000), or 'High Spender' (> ₹5,000).",
    response_description="List of customers with total spending and segment category"
)
def customer_segments(
    db: Session = Depends(get_db)
):
    """
    Classify customers by lifetime spending amount.
    """
    return get_customer_segments(db)
