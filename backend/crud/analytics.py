from collections import defaultdict
from datetime import date, timedelta

from sqlalchemy.orm import Session

from backend.models.transaction import Transaction
from backend.models.product import Product
from backend.models.vendor import Vendor


FORECAST_DAYS = 7

# Changed only these two values
MIN_HISTORY_DAYS = 4
MIN_SALES_DAYS = 2


def normalize_name(value):
    return str(value or "").strip().lower()


def get_revenue_by_product(db: Session):
    revenue_by_product = defaultdict(float)
    display_names = {}

    for transaction in db.query(Transaction).all():
        product_key = normalize_name(transaction.product_name)

        if not product_key:
            continue

        display_names.setdefault(product_key, product_key.title())
        revenue_by_product[product_key] += float(transaction.amount or 0)

    return [
        {
            "product": display_names[product_key],
            "revenue": round(revenue_by_product[product_key], 2)
        }
        for product_key in sorted(revenue_by_product)
    ]


def get_revenue_by_category(db: Session):
    category_by_product = {}
    display_categories = {}

    for product in db.query(Product).all():
        product_key = normalize_name(product.product_name)
        category = str(product.category or "").strip()

        if product_key and product_key not in category_by_product:
            category_by_product[product_key] = category or "Uncategorized"

    revenue_by_category = defaultdict(float)

    for transaction in db.query(Transaction).all():
        product_key = normalize_name(transaction.product_name)
        category = category_by_product.get(product_key, "Uncategorized")
        category_key = normalize_name(category) or "uncategorized"

        display_categories.setdefault(category_key, category.title())
        revenue_by_category[category_key] += float(transaction.amount or 0)

    return [
        {
            "category": display_categories[category_key],
            "revenue": round(revenue_by_category[category_key], 2)
        }
        for category_key in sorted(revenue_by_category)
    ]


def get_revenue_trend(db: Session):
    revenue_by_date = defaultdict(
        lambda: {"revenue": 0.0, "transactions": 0}
    )

    for transaction in db.query(Transaction).all():
        transaction_day = parse_transaction_date(
            transaction.transaction_date
        )

        if transaction_day is None:
            continue

        daily_data = revenue_by_date[transaction_day]
        daily_data["revenue"] += float(transaction.amount or 0)
        daily_data["transactions"] += 1

    if not revenue_by_date:
        return []

    first_day = min(revenue_by_date)
    last_day = max(revenue_by_date)

    trend = []
    current_day = first_day

    while current_day <= last_day:
        daily_data = revenue_by_date[current_day]

        trend.append({
            "date": current_day.isoformat(),
            "revenue": round(daily_data["revenue"], 2),
            "transactions": daily_data["transactions"]
        })

        current_day += timedelta(days=1)

    return trend


def parse_transaction_date(value):

    if not value:
        return None

    try:
        return date.fromisoformat(str(value)[:10])
    except (TypeError, ValueError):
        return None


def get_sales_data(db: Session):

    transactions = db.query(Transaction).all()

    sales = {}

    for transaction in transactions:

        product_name = transaction.product_name.strip().lower()

        amount = float(transaction.amount or 0)

        if product_name in sales:
            sales[product_name] += amount
        else:
            sales[product_name] = amount

    result = []

    for product_name, amount in sales.items():

        result.append({
            "product": product_name.title(),
            "amount": amount
        })

    return result


def get_product_data(db: Session):

    products = db.query(Product).all()

    unique_products = {}

    for product in products:

        product_name = product.product_name.strip().lower()

        if product_name not in unique_products:
            unique_products[product_name] = product_name.title()

    data = []

    for product_name in unique_products.values():

        data.append({
            "product": product_name
        })

    return data


def get_vendor_analytics(db: Session):

    vendors = db.query(Vendor).all()

    result = []

    for vendor in vendors:

        transactions = db.query(Transaction).filter(
            Transaction.vendor_id == vendor.id
        ).all()

        total_sales = len(transactions)

        total_revenue = sum(
            float(transaction.amount or 0)
            for transaction in transactions
        )

        result.append({
            "vendor_id": vendor.id,
            "vendor_name": vendor.business_name,
            "total_sales": total_sales,
            "total_revenue": total_revenue
        })

    return result


def get_vendor_benchmarks(db: Session):
    vendors = db.query(Vendor).all()
    revenue_by_vendor = defaultdict(float)

    for transaction in db.query(Transaction).all():
        revenue_by_vendor[transaction.vendor_id] += float(
            transaction.amount or 0
        )

    vendor_count = len(vendors)

    total_revenue = sum(
        revenue_by_vendor[vendor.id]
        for vendor in vendors
    )

    marketplace_average = (
        total_revenue / vendor_count
        if vendor_count
        else 0
    )

    results = []

    for vendor in vendors:

        vendor_revenue = revenue_by_vendor[vendor.id]
        difference = vendor_revenue - marketplace_average

        if marketplace_average:
            percentage_vs_average = (
                difference / marketplace_average * 100
            )
        else:
            percentage_vs_average = 0

        if difference > 0:
            status = "Above Average"
        elif difference < 0:
            status = "Below Average"
        else:
            status = "At Average"

        results.append({
            "vendor_id": vendor.id,
            "vendor_name": vendor.business_name,
            "vendor_revenue": round(vendor_revenue, 2),
            "marketplace_average_revenue": round(
                marketplace_average,
                2
            ),
            "difference": round(difference, 2),
            "percentage_vs_average": round(
                percentage_vs_average,
                2
            ),
            "status": status,
            "marketplace_vendor_count": vendor_count,
            "average_definition": (
                "Total marketplace revenue divided by all vendors, "
                "including vendors with zero sales."
            )
        })

    return results


def get_vendor_benchmark(
    db: Session,
    vendor_id: int
):
    return next(
        (
            benchmark
            for benchmark in get_vendor_benchmarks(db)
            if benchmark["vendor_id"] == vendor_id
        ),
        None
    )


def get_transaction_report_rows(db: Session):

    transactions = (
        db.query(Transaction)
        .order_by(Transaction.id)
        .all()
    )

    return [
        {
            "Transaction ID": transaction.id,
            "Transaction Date": str(
                transaction.transaction_date or ""
            )[:10],
            "Product Name": transaction.product_name or "",
            "Customer Name": transaction.customer_name or "",
            "Vendor ID": transaction.vendor_id,
            "Amount": transaction.amount
        }
        for transaction in transactions
    ]


def get_product_forecast(
    db: Session,
    product_name: str,
    forecast_days: int = FORECAST_DAYS
):

    requested_name = product_name.strip()
    requested_key = requested_name.lower()

    product = None

    for candidate in db.query(Product).all():

        candidate_key = (
            str(candidate.product_name or "")
            .strip()
            .lower()
        )

        if candidate_key == requested_key:
            product = candidate
            break

    if product is None:
        return {
            "product_name": requested_name,
            "forecast_days": forecast_days,
            "forecast": [],
            "status": "not_found",
            "message": "The selected product was not found."
        }

    daily_demand = defaultdict(int)

    for transaction in db.query(Transaction).all():

        transaction_key = (
            str(transaction.product_name or "")
            .strip()
            .lower()
        )

        if transaction_key != requested_key:
            continue

        transaction_day = parse_transaction_date(
            transaction.transaction_date
        )

        if transaction_day is not None:
            daily_demand[transaction_day] += 1

    if not daily_demand:
        return {
            "product_name": product.product_name,
            "forecast_days": forecast_days,
            "forecast": [],
            "status": "insufficient_data",
            "message": (
                "Not enough historical data for reliable forecasting."
            )
        }

    first_day = min(daily_demand)
    last_day = max(daily_demand)

    history_days = (
        last_day - first_day
    ).days + 1

    sales_days = len(daily_demand)

    # Uses the changed minimum values above
    if (
        history_days < MIN_HISTORY_DAYS
        or sales_days < MIN_SALES_DAYS
    ):
        return {
            "product_name": product.product_name,
            "forecast_days": forecast_days,
            "forecast": [],
            "status": "insufficient_data",
            "historical_days": history_days,
            "sales_days": sales_days,
            "message": (
                "Not enough historical data for reliable forecasting."
            )
        }

    recent_days = [
        last_day - timedelta(days=offset)
        for offset in range(6, -1, -1)
    ]

    average_demand = (
        sum(
            daily_demand.get(history_day, 0)
            for history_day in recent_days
        )
        / len(recent_days)
    )

    predicted_demand = round(
        max(0, average_demand),
        2
    )

    forecast = [
        {
            "date": (
                last_day + timedelta(days=offset)
            ).isoformat(),
            "predicted_demand": predicted_demand
        }
        for offset in range(1, forecast_days + 1)
    ]

    return {
        "product_name": product.product_name,
        "forecast_days": forecast_days,
        "forecast": forecast,
        "status": "success",
        "historical_days": history_days,
        "sales_days": sales_days,
        "message": (
            "Forecast based on the average daily demand "
            "from the most recent 7 days."
        )
    }