from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.crud.vendor import (
    create_vendor,
    get_all_vendors,
    get_vendor_by_id,
    update_vendor_status
)
from backend.schemas.vendor import (
    ActiveVendorCountResponse,
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


@router.get(
    "/count/active",
    response_model=ActiveVendorCountResponse,
    summary="Get Active Vendor Count",
    description="Calculates and returns the total number of approved/active vendors currently onboarded in the marketplace.",
    response_description="Total count of active vendors"
)
def active_vendor_count(
    db: Session = Depends(get_db)
):
    """
    Retrieve the count of vendors with 'Approved' status.
    """
    vendors = get_all_vendors(db)
    active = sum(1 for vendor in vendors if vendor.status == "Approved")
    return {
        "active_vendors": active
    }


@router.get(
    "/",
    response_model=list[VendorResponse],
    summary="List All Vendors",
    description="Retrieves a complete list of all registered vendors including business details and onboarding status.",
    response_description="List of registered vendors"
)
def list_vendors(
    db: Session = Depends(get_db)
):
    """
    Fetch all vendors from the database.
    """
    return get_all_vendors(db)


@router.post(
    "/",
    response_model=VendorResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register New Vendor",
    description="Registers a new vendor with initial 'Pending' verification status.",
    response_description="Successfully created vendor object"
)
def add_vendor(
    vendor: VendorCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new vendor profile in the database.
    """
    return create_vendor(db, vendor)


@router.get(
    "/{vendor_id}",
    response_model=VendorResponse,
    summary="Get Vendor by ID",
    description="Retrieves a specific vendor's profile by their unique ID.",
    response_description="Vendor profile details",
    responses={
        404: {"description": "Vendor not found"}
    }
)
def get_vendor(
    vendor_id: int,
    db: Session = Depends(get_db)
):
    """
    Lookup a vendor by primary key ID.
    """
    vendor = get_vendor_by_id(db, vendor_id)
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    return vendor


@router.put(
    "/{vendor_id}/status",
    response_model=VendorResponse,
    summary="Update Vendor Status",
    description="Updates the onboarding/operational status of an existing vendor (e.g. Approved, Suspended, Pending).",
    response_description="Updated vendor profile with new status",
    responses={
        404: {"description": "Vendor not found"}
    }
)
def update_status(
    vendor_id: int,
    status_data: VendorStatusUpdate,
    db: Session = Depends(get_db)
):
    """
    Update vendor status by vendor ID.
    """
    vendor = update_vendor_status(
        db,
        vendor_id,
        status_data.status
    )
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    return vendor
