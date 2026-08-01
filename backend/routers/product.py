from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.crud.product import (
    create_product,
    get_all_products,
    get_product_count
)

from backend.schemas.product import (
    ProductCreate,
    ProductResponse
)

from backend.database.database import SessionLocal


router = APIRouter(
    prefix="/products",
    tags=["Products"]
)


def get_db():

    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()



@router.post("/", response_model=ProductResponse)
def add_product(
    product: ProductCreate,
    db: Session = Depends(get_db)
):

    return create_product(
        db,
        product
    )



@router.get("/", response_model=list[ProductResponse])
def list_products(
    db: Session = Depends(get_db)
):

    return get_all_products(db)



@router.get("/count")
def product_count(
    db: Session = Depends(get_db)
):

    return {
        "total_products": get_product_count(db)
    }