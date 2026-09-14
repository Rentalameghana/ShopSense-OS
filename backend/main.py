import os
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from backend.database.database import Base, engine
from backend.routers.vendor import router as vendor_router
from backend.routers.product import router as product_router
from backend.routers.customer import router as customer_router
from backend.routers.transaction import router as transaction_router
from backend.routers.analytics import router as analytics_router


tags_metadata = [
    {
        "name": "General",
        "description": "General service health and diagnostic endpoints."
    },
    {
        "name": "Vendors",
        "description": "Vendor registration, status management (Pending, Approved, Suspended), and active vendor metrics."
    },
    {
        "name": "Products",
        "description": "Product catalog inventory management and sales-driven product recommendations."
    },
    {
        "name": "Customers",
        "description": "Customer profiles and automated spending-tier segmentation (Low, Medium, High Spenders)."
    },
    {
        "name": "Transactions",
        "description": "E-commerce transaction recording, history tracking, and gross revenue calculations."
    },
    {
        "name": "Analytics",
        "description": "Sales aggregations, product & category revenue insights, revenue trends, vendor benchmarking, demand forecasting, CSV data exports, and AI natural language data queries."
    }
]

app = FastAPI(
    title="ShopSense OS API",
    description="""
**ShopSense OS** is a Multi-Vendor E-Commerce Analytics Platform providing real-time operational insights, catalog management, customer segmentation, and automated business intelligence.

### Key Capabilities:
- **Vendor Operations**: Onboard vendors and manage verification statuses.
- **Product Catalog**: Maintain inventories and generate smart product recommendations.
- **Customer Segmentation**: Automatic classification into Low, Medium, and High spending tiers.
- **Transaction Engine**: Record multi-vendor sales and compute real-time revenue.
- **Analytics & Forecasting**: Moving-average demand forecasting, vendor benchmarking against marketplace averages, and CSV reporting.
- **AI Analyst**: Natural language data query engine with safe read-only SQL validation and automatic local fallback.
""",
    version="1.0.0",
    openapi_tags=tags_metadata
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database tables create
Base.metadata.create_all(bind=engine)

# Serve Frontend Files
BASE_DIR = Path(__file__).resolve().parent.parent
FRONTEND_DIR = BASE_DIR / "frontend"

if FRONTEND_DIR.exists():
    app.mount(
        "/frontend",
        StaticFiles(directory=str(FRONTEND_DIR), html=True),
        name="frontend"
    )
elif os.path.exists("frontend"):
    app.mount(
        "/frontend",
        StaticFiles(directory="frontend", html=True),
        name="frontend"
    )


@app.get(
    "/",
    tags=["General"],
    summary="API Root / Health Check",
    description="Returns a welcome message verifying that the ShopSense OS API service is operational.",
    response_description="Service status and welcome message"
)
def home():
    """
    Root endpoint for health and availability checks.
    """
    return {
        "message": "Welcome to ShopSense OS API"
    }


# Routers
app.include_router(vendor_router)
app.include_router(product_router)
app.include_router(customer_router)
app.include_router(transaction_router)
app.include_router(analytics_router)
