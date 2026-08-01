from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.database.database import Base, engine

from backend.routers.vendor import router as vendor_router
from backend.routers.product import router as product_router
from backend.routers.customer import router as customer_router
from backend.routers.transaction import router as transaction_router
from backend.routers.analytics import router as analytics_router


app = FastAPI(
    title="ShopSense OS API",
    version="0.1.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Create tables
Base.metadata.create_all(bind=engine)


@app.get("/")
def home():
    return {
        "message": "Welcome to ShopSense OS API"
    }

# Include all routers
app.include_router(vendor_router)
app.include_router(product_router)
app.include_router(customer_router)
app.include_router(transaction_router)
app.include_router(analytics_router)