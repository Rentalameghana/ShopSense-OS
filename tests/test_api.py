import unittest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from backend.main import app
from backend.database.database import Base
from backend.routers.vendor import get_db as get_db_vendor
from backend.routers.product import get_db as get_db_product
from backend.routers.customer import get_db as get_db_customer
from backend.routers.transaction import get_db as get_db_transaction
from backend.routers.analytics import get_db as get_db_analytics


# In-memory test database using StaticPool so all connections share the same memory DB
TEST_DATABASE_URL = "sqlite:///:memory:"
test_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


# Override dependencies across all routers
app.dependency_overrides[get_db_vendor] = override_get_db
app.dependency_overrides[get_db_product] = override_get_db
app.dependency_overrides[get_db_customer] = override_get_db
app.dependency_overrides[get_db_transaction] = override_get_db
app.dependency_overrides[get_db_analytics] = override_get_db

client = TestClient(app)


class ShopSenseAPITestCase(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        # Create schema in the in-memory database
        Base.metadata.create_all(bind=test_engine)

    @classmethod
    def tearDownClass(cls):
        # Drop schema after test suite execution
        Base.metadata.drop_all(bind=test_engine)

    def test_01_root_endpoint(self):
        """Test API root returns 200 and expected welcome message."""
        response = client.get("/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"message": "Welcome to ShopSense OS API"})

    def test_02_openapi_spec(self):
        """Test OpenAPI documentation specification endpoint."""
        response = client.get("/openapi.json")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["info"]["title"], "ShopSense OS API")
        self.assertEqual(data["info"]["version"], "1.0.0")
        self.assertIn("/vendors/", data["paths"])
        self.assertIn("/products/", data["paths"])
        self.assertIn("/customers/", data["paths"])
        self.assertIn("/transactions/", data["paths"])
        self.assertIn("/analytics/sales", data["paths"])

    # ------------------ VENDORS API ------------------

    def test_03_create_vendor(self):
        """Test registering a new vendor."""
        payload = {
            "business_name": "Apex Electronics",
            "corporate_email": "contact@apexelectronics.com"
        }
        response = client.post("/vendors/", json=payload)
        self.assertEqual(response.status_code, 201)
        data = response.json()
        self.assertEqual(data["business_name"], "Apex Electronics")
        self.assertEqual(data["corporate_email"], "contact@apexelectronics.com")
        self.assertEqual(data["status"], "Pending")
        self.assertIn("id", data)

    def test_04_list_vendors(self):
        """Test listing all registered vendors."""
        response = client.get("/vendors/")
        self.assertEqual(response.status_code, 200)
        vendors = response.json()
        self.assertIsInstance(vendors, list)
        self.assertGreaterEqual(len(vendors), 1)

    def test_05_get_vendor_by_id(self):
        """Test retrieving a vendor by ID and 404 for invalid ID."""
        response = client.get("/vendors/1")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["id"], 1)

        # Non-existent vendor
        not_found = client.get("/vendors/9999")
        self.assertEqual(not_found.status_code, 404)

    def test_06_update_vendor_status(self):
        """Test updating a vendor status to Approved."""
        response = client.put("/vendors/1/status", json={"status": "Approved"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["status"], "Approved")

    def test_07_active_vendor_count(self):
        """Test retrieving the active vendor count."""
        response = client.get("/vendors/count/active")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("active_vendors", data)
        self.assertGreaterEqual(data["active_vendors"], 1)

    # ------------------ PRODUCTS API ------------------

    def test_08_create_product(self):
        """Test adding products to the catalog."""
        payload = {
            "product_name": "Pro Gaming Laptop",
            "category": "Electronics",
            "price": 85000.0,
            "stock_quantity": 15,
            "image_url": "https://example.com/laptop.jpg"
        }
        response = client.post("/products/", json=payload)
        self.assertEqual(response.status_code, 201)
        data = response.json()
        self.assertEqual(data["product_name"], "Pro Gaming Laptop")
        self.assertEqual(data["price"], 85000.0)
        self.assertEqual(data["stock_quantity"], 15)

    def test_09_product_validation(self):
        """Test product validation rejecting non-positive price."""
        payload = {
            "product_name": "Freebie Item",
            "category": "Promo",
            "price": -10.0,
            "stock_quantity": 5
        }
        response = client.post("/products/", json=payload)
        self.assertEqual(response.status_code, 422)

    def test_10_list_products_and_count(self):
        """Test listing products and product count endpoint."""
        list_res = client.get("/products/")
        self.assertEqual(list_res.status_code, 200)
        products = list_res.json()
        self.assertIsInstance(products, list)
        self.assertGreaterEqual(len(products), 1)

        count_res = client.get("/products/count")
        self.assertEqual(count_res.status_code, 200)
        self.assertIn("total_products", count_res.json())
        self.assertGreaterEqual(count_res.json()["total_products"], 1)

    def test_11_product_recommendations(self):
        """Test product recommendations endpoint."""
        response = client.get("/products/recommendations")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("recommendations", data)
        self.assertIn("message", data)

    # ------------------ CUSTOMERS API ------------------

    def test_12_create_customer(self):
        """Test registering a new customer."""
        payload = {
            "customer_name": "Alice Smith",
            "email": "alice.smith@example.com",
            "phone": "9876543210"
        }
        response = client.post("/customers/", json=payload)
        self.assertEqual(response.status_code, 201)
        data = response.json()
        self.assertEqual(data["customer_name"], "Alice Smith")
        self.assertEqual(data["email"], "alice.smith@example.com")

    def test_13_duplicate_customer_email_rejected(self):
        """Test duplicate email rejection with 400 Bad Request."""
        payload = {
            "customer_name": "Duplicate Alice",
            "email": "alice.smith@example.com",
            "phone": "9876543211"
        }
        response = client.post("/customers/", json=payload)
        self.assertEqual(response.status_code, 400)
        self.assertIn("already exists", response.json()["detail"])

    def test_14_list_customers_and_count(self):
        """Test listing customers and total count endpoint."""
        list_res = client.get("/customers/")
        self.assertEqual(list_res.status_code, 200)
        self.assertGreaterEqual(len(list_res.json()), 1)

        count_res = client.get("/customers/count")
        self.assertEqual(count_res.status_code, 200)
        self.assertIn("total_customers", count_res.json())

    def test_15_customer_segments(self):
        """Test customer spending segmentation endpoint."""
        response = client.get("/customers/segments")
        self.assertEqual(response.status_code, 200)
        segments = response.json()
        self.assertIsInstance(segments, list)
        self.assertGreaterEqual(len(segments), 1)
        first = segments[0]
        self.assertIn("total_spending", first)
        self.assertIn("segment", first)
        self.assertIn(first["segment"], ["Low Spender", "Medium Spender", "High Spender"])

    # ------------------ TRANSACTIONS API ------------------

    def test_16_create_transaction(self):
        """Test creating a sales transaction."""
        payload = {
            "customer_name": "Alice Smith",
            "product_name": "Pro Gaming Laptop",
            "amount": 85000.0,
            "transaction_date": "2026-03-01",
            "vendor_id": 1
        }
        response = client.post("/transactions/", json=payload)
        self.assertEqual(response.status_code, 201)
        data = response.json()
        self.assertEqual(data["amount"], 85000.0)
        self.assertEqual(data["customer_name"], "Alice Smith")
        self.assertEqual(data["vendor_id"], 1)

    def test_17_transaction_count_and_revenue(self):
        """Test transaction count and gross revenue endpoints."""
        count_res = client.get("/transactions/count")
        self.assertEqual(count_res.status_code, 200)
        self.assertGreaterEqual(count_res.json()["total_transactions"], 1)

        revenue_res = client.get("/transactions/revenue")
        self.assertEqual(revenue_res.status_code, 200)
        self.assertGreaterEqual(revenue_res.json()["total_revenue"], 85000.0)

    # ------------------ ANALYTICS API ------------------

    def test_18_analytics_sales_and_revenue(self):
        """Test sales, product, and category revenue analytics endpoints."""
        sales_res = client.get("/analytics/sales")
        self.assertEqual(sales_res.status_code, 200)
        self.assertIsInstance(sales_res.json(), list)

        rev_prod_res = client.get("/analytics/revenue-by-product")
        self.assertEqual(rev_prod_res.status_code, 200)
        self.assertIsInstance(rev_prod_res.json(), list)

        rev_cat_res = client.get("/analytics/revenue-by-category")
        self.assertEqual(rev_cat_res.status_code, 200)
        self.assertIsInstance(rev_cat_res.json(), list)

    def test_19_analytics_trend_and_vendor_metrics(self):
        """Test revenue trend and vendor analytics/benchmarking."""
        trend_res = client.get("/analytics/revenue-trend")
        self.assertEqual(trend_res.status_code, 200)
        self.assertIsInstance(trend_res.json(), list)

        vendor_analytics_res = client.get("/analytics/vendors")
        self.assertEqual(vendor_analytics_res.status_code, 200)
        self.assertIsInstance(vendor_analytics_res.json(), list)

        benchmark_res = client.get("/analytics/vendor-benchmark")
        self.assertEqual(benchmark_res.status_code, 200)
        self.assertIsInstance(benchmark_res.json(), list)

        single_bench = client.get("/analytics/vendor-benchmark/1")
        self.assertEqual(single_bench.status_code, 200)
        self.assertEqual(single_bench.json()["vendor_id"], 1)

    def test_20_analytics_export_csv(self):
        """Test CSV report generation and streaming download."""
        response = client.get("/analytics/export/csv")
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.headers["content-type"].startswith("text/csv"))
        self.assertIn("attachment; filename=shopsense_sales_report.csv", response.headers.get("content-disposition", ""))
        content = response.text
        self.assertIn("Transaction ID", content)
        self.assertIn("Product Name", content)
        self.assertIn("Alice Smith", content)

    def test_21_analytics_forecast(self):
        """Test product demand forecasting endpoint."""
        response = client.get("/analytics/forecast?product_name=Pro Gaming Laptop&forecast_days=7")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["product_name"], "Pro Gaming Laptop")
        self.assertIn("status", data)
        self.assertIn("forecast", data)

    def test_22_ai_analyst_query_local_fallback(self):
        """Test AI Analyst query endpoint operates correctly in local fallback mode without API key."""
        payload = {"question": "What is the total revenue?"}
        response = client.post("/analytics/ai/query", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["question"], "What is the total revenue?")
        self.assertIn("answer", data)
        self.assertIn(data["provider"], ["local", "openai"])


if __name__ == "__main__":
    unittest.main()

