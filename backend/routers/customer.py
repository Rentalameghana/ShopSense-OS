from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.crud.customer import (
    create_customer,
    get_all_customers,
    get_customer_count
)

from backend.schemas.customer import (
    CustomerCreate,
    CustomerResponse
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


@router.post("/", response_model=CustomerResponse)
def add_customer(
    customer: CustomerCreate,
    db: Session = Depends(get_db)
):
    return create_customer(db, customer)


@router.get("/", response_model=list[CustomerResponse])
def list_customers(
    db: Session = Depends(get_db)
):
    return get_all_customers(db)


@router.get("/count")
def customer_count(
    db: Session = Depends(get_db)
):
    return {
        "total_customers": get_customer_count(db)
    }