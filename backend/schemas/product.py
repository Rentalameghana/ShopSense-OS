from pydantic import BaseModel, Field


class ProductCreate(BaseModel):
    product_name: str = Field(..., min_length=2, description="Display name of the product", examples=["Wireless Mouse"])
    category: str = Field(..., min_length=2, description="Product category", examples=["Electronics"])
    price: float = Field(..., gt=0, description="Unit selling price in INR", examples=[799.0])
    stock_quantity: int = Field(..., ge=0, description="Initial inventory quantity", examples=[50])
    image_url: str | None = Field(default=None, description="Direct URL to product image", examples=["https://example.com/mouse.jpg"])


class ProductResponse(BaseModel):
    id: int = Field(..., description="Unique product ID", examples=[1])
    product_name: str = Field(..., description="Display name of the product", examples=["Wireless Mouse"])
    category: str = Field(..., description="Product category", examples=["Electronics"])
    price: float = Field(..., description="Unit selling price in INR", examples=[799.0])
    stock_quantity: int = Field(..., description="Current stock quantity", examples=[50])
    image_url: str | None = Field(default=None, description="Direct URL to product image", examples=["https://example.com/mouse.jpg"])

    class Config:
        from_attributes = True


class ProductCountResponse(BaseModel):
    total_products: int = Field(..., description="Total count of products in the catalog", examples=[8])


class ProductRecommendation(BaseModel):
    id: int = Field(..., description="Product ID", examples=[1])
    product_name: str = Field(..., description="Product name", examples=["Wireless Mouse"])
    category: str = Field(..., description="Category", examples=["Electronics"])
    price: float = Field(..., description="Price in INR", examples=[799.0])
    stock_quantity: int = Field(..., description="Available stock", examples=[50])
    image_url: str | None = Field(default=None, description="Image URL")
    sales_count: int = Field(..., description="Number of sales recorded", examples=[15])
    sales_revenue: float = Field(..., description="Total sales revenue generated in INR", examples=[11985.0])


class ProductRecommendationResponse(BaseModel):
    selected_product_id: int | None = Field(default=None, description="ID of the seed product, if provided", examples=[1])
    category: str | None = Field(default=None, description="Category filter used for recommendations", examples=["Electronics"])
    recommendations: list[ProductRecommendation] = Field(default_factory=list, description="Ranked list of recommended products")
    message: str = Field(..., description="Status explanation or context message")
