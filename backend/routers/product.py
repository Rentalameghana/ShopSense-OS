from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from backend.crud.product import (
    create_product,
    get_all_products,
    get_product_count,
    get_product_recommendations
)
from backend.schemas.product import (
    ProductCountResponse,
    ProductCreate,
    ProductResponse,
    ProductRecommendationResponse
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


@router.post(
    "/",
    response_model=ProductResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add Product to Catalog",
    description="Adds a new product to the catalog with name, category, unit price, stock quantity, and optional image URL.",
    response_description="Created product record"
)
def add_product(
    product: ProductCreate,
    db: Session = Depends(get_db)
):
    """
    Insert a new product record into the database catalog.
    """
    return create_product(
        db,
        product
    )


@router.get(
    "/",
    response_model=list[ProductResponse],
    summary="List All Products",
    description="Retrieves the full list of products available in the catalog.",
    response_description="Array of product objects"
)
def list_products(
    db: Session = Depends(get_db)
):
    """
    Fetch all products currently stored in the database.
    """
    return get_all_products(db)


@router.get(
    "/count",
    response_model=ProductCountResponse,
    summary="Get Total Product Count",
    description="Returns the total number of distinct products registered across all categories.",
    response_description="Total count of products"
)
def product_count(
    db: Session = Depends(get_db)
):
    """
    Return total product count.
    """
    return {
        "total_products": get_product_count(db)
    }


@router.get(
    "/recommendations",
    response_model=ProductRecommendationResponse,
    summary="Get Product Recommendations",
    description="Returns intelligent product recommendations based on historical sales transaction volume. Optionally pass a `product_id` to receive category-filtered recommendations.",
    response_description="Ranked product recommendations with sales statistics"
)
def product_recommendations(
    product_id: int | None = Query(default=None, description="Optional product ID to get category-relevant recommendations", examples=[1]),
    db: Session = Depends(get_db)
):
    """
    Compute sales-driven product recommendations.
    """
    return get_product_recommendations(
        db,
        product_id=product_id
    )
