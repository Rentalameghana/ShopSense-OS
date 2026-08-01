from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.crud.vendor import (
    create_vendor,
    get_all_vendors,
    get_vendor_by_id,
    update_vendor_status
)

from backend.schemas.vendor import (
    VendorCreate,
    VendorResponse,
    VendorStatusUpdate
)

from backend.database.database import SessionLocal


router = APIRouter(
    prefix="/vendors",
    tags=["Vendors"]
)


def get_db():

    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()



# Active Vendor Count

@router.get("/count/active")
def active_vendor_count(
    db: Session = Depends(get_db)
):

    vendors = get_all_vendors(db)

    active = 0

    for vendor in vendors:

        if vendor.status == "Approved":
            active += 1


    return {
        "active_vendors": active
    }




# Get All Vendors

@router.get(
    "/",
    response_model=list[VendorResponse]
)
def list_vendors(
    db: Session = Depends(get_db)
):

    return get_all_vendors(db)




# Add Vendor

@router.post(
    "/",
    response_model=VendorResponse
)
def add_vendor(
    vendor: VendorCreate,
    db: Session = Depends(get_db)
):

    return create_vendor(
        db,
        vendor
    )




# Get Single Vendor

@router.get(
    "/{vendor_id}",
    response_model=VendorResponse
)
def get_vendor(
    vendor_id: int,
    db: Session = Depends(get_db)
):

    return get_vendor_by_id(
        db,
        vendor_id
    )




# Update Status

@router.put(
    "/{vendor_id}/status",
    response_model=VendorResponse
)
def update_status(
    vendor_id: int,
    status_data: VendorStatusUpdate,
    db: Session = Depends(get_db)
):

    return update_vendor_status(
        db,
        vendor_id,
        status_data.status
    )