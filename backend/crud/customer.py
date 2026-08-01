from sqlalchemy.orm import Session

from backend.models.customer import Customer
from backend.schemas.customer import CustomerCreate


def create_customer(db: Session, customer: CustomerCreate):

    new_customer = Customer(
        customer_name=customer.customer_name,
        email=customer.email,
        phone=customer.phone
    )

    db.add(new_customer)
    db.commit()
    db.refresh(new_customer)

    return new_customer


def get_all_customers(db: Session):

    return db.query(Customer).all()


def get_customer_count(db: Session):

    return db.query(Customer).count()