from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.database.database import SessionLocal

from backend.crud.analytics import (
    get_sales_data,
    get_product_data
)


router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"]
)


def get_db():

    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()



@router.get("/sales")
def sales_analytics(
    db: Session = Depends(get_db)
):

    return get_sales_data(db)



@router.get("/products")
def product_analytics(
    db: Session = Depends(get_db)
):

    return get_product_data(db)