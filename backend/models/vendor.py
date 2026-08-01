from sqlalchemy import Column, Integer, String

from backend.database.database import Base


class Vendor(Base):
    __tablename__ = "vendors"

    id = Column(Integer, primary_key=True, index=True)
    business_name = Column(String, nullable=False)
    corporate_email = Column(String, unique=True, nullable=False)
    status = Column(String, default="Pending")