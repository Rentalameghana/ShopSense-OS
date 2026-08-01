

from sqlalchemy.orm import Session

from backend.models.product import Product
from backend.schemas.product import ProductCreate


def create_product(db: Session, product: ProductCreate):

    new_product = Product(
        product_name=product.product_name,
        category=product.category,
        price=product.price
    )

    db.add(new_product)
    db.commit()
    db.refresh(new_product)

    return new_product


def get_all_products(db: Session):

    return db.query(Product).all()


def get_product_count(db: Session):

    return db.query(Product).count()