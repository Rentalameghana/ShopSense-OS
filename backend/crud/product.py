from sqlalchemy import func
from sqlalchemy.orm import Session

from backend.models.product import Product
from backend.models.transaction import Transaction
from backend.schemas.product import ProductCreate


def create_product(
    db: Session,
    product: ProductCreate
):

    db_product = Product(
        product_name=product.product_name,
        category=product.category,
        price=product.price,
        stock_quantity=product.stock_quantity,
        image_url=product.image_url
    )

    db.add(db_product)

    db.commit()

    db.refresh(db_product)

    return db_product


def get_all_products(db: Session):

    return db.query(Product).all()


def get_product_count(db: Session):

    return db.query(Product).count()


def get_product_recommendations(
    db: Session,
    product_id: int | None = None,
    limit: int = 5
):

    selected_product = None

    if product_id is not None:
        selected_product = db.query(Product).filter(
            Product.id == product_id
        ).first()

    normalized_product = func.lower(func.trim(Product.product_name))
    normalized_transaction = func.lower(func.trim(Transaction.product_name))
    sales = (
        db.query(
            normalized_transaction.label("product_key"),
            func.count(Transaction.id).label("sales_count"),
            func.coalesce(func.sum(Transaction.amount), 0.0).label("sales_revenue")
        )
        .group_by(normalized_transaction)
        .subquery()
    )

    query = (
        db.query(
            func.min(Product.id).label("id"),
            Product.product_name,
            Product.category,
            Product.price,
            Product.stock_quantity,
            Product.image_url,
            sales.c.sales_count,
            sales.c.sales_revenue
        )
        .join(
            sales,
            sales.c.product_key == normalized_product
        )
    )

    if selected_product is not None:
        query = query.filter(
            Product.category == selected_product.category,
            normalized_product != selected_product.product_name.strip().lower()
        )

    rows = (
        query
        .group_by(
            Product.product_name,
            Product.category,
            Product.price,
            Product.stock_quantity,
            Product.image_url,
            sales.c.sales_count,
            sales.c.sales_revenue
        )
        .order_by(
            sales.c.sales_count.desc(),
            sales.c.sales_revenue.desc(),
            func.min(Product.id)
        )
        .limit(limit)
        .all()
    )

    recommendations = [
        {
            "id": row.id,
            "product_name": row.product_name,
            "category": row.category,
            "price": float(row.price),
            "stock_quantity": row.stock_quantity,
            "image_url": row.image_url,
            "sales_count": row.sales_count,
            "sales_revenue": float(row.sales_revenue or 0)
        }
        for row in rows
    ]

    if recommendations:
        message = "Top-selling products based on historical transactions."
    elif selected_product is not None:
        message = "No other products in this category have recorded sales yet."
    else:
        message = "No product sales history is available yet."

    return {
        "selected_product_id": product_id,
        "category": selected_product.category if selected_product else None,
        "recommendations": recommendations,
        "message": message
    }