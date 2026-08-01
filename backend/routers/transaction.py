from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.crud.transaction import (
    create_transaction,
    get_all_transactions,
    get_transaction_count,
    get_total_revenue
)
from backend.schemas.transaction import (
    TransactionCreate,
    TransactionResponse
)
from backend.database.database import SessionLocal


router = APIRouter(
    prefix="/transactions",
    tags=["Transactions"]
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/", response_model=TransactionResponse)
def add_transaction(
    transaction: TransactionCreate,
    db: Session = Depends(get_db)
):
    return create_transaction(db, transaction)


@router.get("/", response_model=list[TransactionResponse])
def list_transactions(
    db: Session = Depends(get_db)
):
    return get_all_transactions(db)


@router.get("/count")
def transaction_count(
    db: Session = Depends(get_db)
):
    return {
        "total_transactions": get_transaction_count(db)
    }


@router.get("/revenue")
def total_revenue(
    db: Session = Depends(get_db)
):
    return {
        "total_revenue": get_total_revenue(db)
    }