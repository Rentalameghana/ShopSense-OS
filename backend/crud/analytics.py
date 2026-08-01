from sqlalchemy.orm import Session

from backend.models.transaction import Transaction
from backend.models.product import Product



def get_sales_data(db: Session):

    transactions = db.query(Transaction).all()

    sales = []


    for transaction in transactions:

        sales.append({
            "product": transaction.product_name,
            "amount": transaction.amount
        })


    return sales




def get_product_data(db: Session):

    products = db.query(Product).all()

    data = []


    for product in products:

        data.append({
            "product": product.product_name
        })


    return data