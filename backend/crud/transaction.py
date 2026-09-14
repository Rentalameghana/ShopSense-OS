from sqlalchemy.orm import Session

from backend.models.transaction import Transaction
from backend.schemas.transaction import TransactionCreate


def create_transaction(db: Session, transaction: TransactionCreate):

    new_transaction = Transaction(
        customer_name=transaction.customer_name,
        product_name=transaction.product_name,
        amount=transaction.amount,
        transaction_date=transaction.transaction_date,
        vendor_id=transaction.vendor_id
    )

    db.add(new_transaction)
    db.commit()
    db.refresh(new_transaction)

    return new_transaction


def get_all_transactions(db: Session):

    return db.query(Transaction).all()


def get_transaction_count(db: Session):

    return db.query(Transaction).count()


def get_total_revenue(db: Session):

    transactions = db.query(Transaction).all()

    total = sum(t.amount for t in transactions)

    return total