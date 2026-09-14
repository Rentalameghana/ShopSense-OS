from fastapi import HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from backend.models.customer import Customer
from backend.models.transaction import Transaction
from backend.schemas.customer import CustomerCreate


LOW_SPENDER_MAX = 1000
MEDIUM_SPENDER_MAX = 5000


def create_customer(db: Session, customer: CustomerCreate):

    # Check if email already exists
    existing_customer = db.query(Customer).filter(
        Customer.email == customer.email
    ).first()

    if existing_customer:
        raise HTTPException(
            status_code=400,
            detail="Customer with this email already exists"
        )

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


def get_customer_segments(db: Session):

    total_spending = func.coalesce(func.sum(Transaction.amount), 0.0)

    rows = (
        db.query(
            Customer.id,
            Customer.customer_name,
            Customer.email,
            Customer.phone,
            total_spending.label("total_spending")
        )
        .outerjoin(
            Transaction,
            Transaction.customer_name == Customer.customer_name
        )
        .group_by(
            Customer.id,
            Customer.customer_name,
            Customer.email,
            Customer.phone
        )
        .order_by(Customer.id)
        .all()
    )

    segments = []

    for row in rows:
        spending = float(row.total_spending or 0)

        if spending < LOW_SPENDER_MAX:
            segment = "Low Spender"
        elif spending < MEDIUM_SPENDER_MAX:
            segment = "Medium Spender"
        else:
            segment = "High Spender"

        segments.append({
            "id": row.id,
            "customer_name": row.customer_name,
            "email": row.email,
            "phone": row.phone,
            "total_spending": spending,
            "segment": segment
        })

    return segments