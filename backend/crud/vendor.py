from sqlalchemy.orm import Session

from backend.models.vendor import Vendor
from backend.schemas.vendor import VendorCreate


def create_vendor(db: Session, vendor: VendorCreate):

    db_vendor = Vendor(
        business_name=vendor.business_name,
        corporate_email=vendor.corporate_email,
        status="Pending"
    )

    db.add(db_vendor)
    db.commit()
    db.refresh(db_vendor)

    return db_vendor



def get_all_vendors(db: Session):

    print("GET VENDORS CALLED")

    vendors = db.query(Vendor).all()

    print(vendors)

    return vendors



def get_vendor_by_id(db: Session, vendor_id: int):

    return db.query(Vendor).filter(
        Vendor.id == vendor_id
    ).first()



def update_vendor_status(db: Session, vendor_id: int, status: str):

    vendor = db.query(Vendor).filter(
        Vendor.id == vendor_id
    ).first()

    if vendor:
        vendor.status = status
        db.commit()
        db.refresh(vendor)

    return vendor