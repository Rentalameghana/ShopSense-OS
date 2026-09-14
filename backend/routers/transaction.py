from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from backend.crud.transaction import (
    create_transaction,
    get_all_transactions,
    get_transaction_count,
    get_total_revenue
)
from backend.schemas.transaction import (
    TotalRevenueResponse,
    TransactionCountResponse,
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


@router.post(
    "/",
    response_model=TransactionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Record New Transaction",
    description="Records a new customer sales transaction linked to an onboarding vendor, product, and purchase amount.",
    response_description="Created transaction record"
)
def add_transaction(
    transaction: TransactionCreate,
    db: Session = Depends(get_db)
):
    """
    Store an order transaction in the ledger.
    """
    return create_transaction(db, transaction)


@router.get(
    "/",
    response_model=list[TransactionResponse],
    summary="List All Transactions",
    description="Retrieves the entire history of recorded transactions.",
    response_description="Array of transaction objects"
)
def list_transactions(
    db: Session = Depends(get_db)
):
    """
    Fetch all transaction records.
    """
    return get_all_transactions(db)


@router.get(
    "/count",
    response_model=TransactionCountResponse,
    summary="Get Total Transaction Count",
    description="Returns the total count of completed transactions across the entire marketplace.",
    response_description="Total transaction count"
)
def transaction_count(
    db: Session = Depends(get_db)
):
    """
    Return count of recorded transactions.
    """
    return {
        "total_transactions": get_transaction_count(db)
    }


@router.get(
    "/revenue",
    response_model=TotalRevenueResponse,
    summary="Get Total Marketplace Revenue",
    description="Calculates cumulative gross merchandise value (total revenue in INR) generated across all transactions.",
    response_description="Cumulative total revenue"
)
def total_revenue(
    db: Session = Depends(get_db)
):
    """
    Sum the amount across all transactions to get gross revenue.
    """
    return {
        "total_revenue": get_total_revenue(db)
    }
