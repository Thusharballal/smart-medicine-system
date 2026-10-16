from typing import Optional
from pydantic import BaseModel, EmailStr, Field
from app.utils.constants import PharmacyStatus
# ==========================================================
# Pharmacy Create Request
# ==========================================================
class PharmacyCreateRequest(BaseModel):
    """
    Request schema for creating a pharmacy.
    """
    owner_name: str = Field(
        ...,
        min_length=3,
        max_length=100,
    )
    pharmacy_name: str = Field(
        ...,
        min_length=3,
        max_length=150,
    )
    email: EmailStr
    phone_number: str = Field(
        ...,
        min_length=10,
        max_length=15,
    )
    password: str = Field(
        ...,
        min_length=8,
        max_length=20,
    )
    drug_license_number: str = Field(
        ...,
        min_length=1,
        max_length=100,
    )
    # ------------------------------------------------------
    # Jan Aushadhi Kendra Code
    # Example: PMBJK00017
    # ------------------------------------------------------

    kendra_code: str = Field(
        ...,
        min_length=10,
        max_length=10,
        pattern=r"^PMBJK\d{5}$",
    )

    gst_number: str = Field(
        ...,
        min_length=1,
        max_length=30,
    )

    # ------------------------------------------------------
    # Address
    # ------------------------------------------------------

    address: str = Field(
        ...,
        min_length=5,
        max_length=300,
    )

    city: str = Field(
        ...,
        min_length=2,
        max_length=100,
    )

    state: str = Field(
        ...,
        min_length=2,
        max_length=100,
    )
    pin_code: str = Field(
        ...,
        min_length=6,
        max_length=6,
        pattern=r"^\d{6}$",
    )
    # ------------------------------------------------------
    # Location
    #
    # Used for:
    # - Nearby pharmacy search
    # - Distance calculation
    # - Map display
    # - Location-based ranking
    # ------------------------------------------------------
    latitude: Optional[float] = Field(
        default=None,
        ge=-90,
        le=90,
    )
    longitude: Optional[float] = Field(
        default=None,
        ge=-180,
        le=180,
    )
# ==========================================================
# Pharmacy Update Request
# ==========================================================
class PharmacyUpdateRequest(BaseModel):
    """
    Request schema for updating pharmacy information.
    Only fields supplied by the pharmacy owner are updated.
    """
    pharmacy_name: Optional[str] = Field(
        default=None,
        min_length=3,
        max_length=150,
    )
    phone_number: Optional[str] = Field(
        default=None,
        min_length=10,
        max_length=15,
    )
    address: Optional[str] = Field(
        default=None,
        min_length=5,
        max_length=300,
    )
    city: Optional[str] = Field(
        default=None,
        min_length=2,
        max_length=100,
    )
    state: Optional[str] = Field(
        default=None,
        min_length=2,
        max_length=100,
    )
    pin_code: Optional[str] = Field(
        default=None,
        min_length=6,
        max_length=6,
        pattern=r"^\d{6}$",
    )
    latitude: Optional[float] = Field(
        default=None,
        ge=-90,
        le=90,
    )
    longitude: Optional[float] = Field(
        default=None,
        ge=-180,
        le=180,
    )
# ==========================================================
# Pharmacy Response
# ==========================================================
class PharmacyResponse(BaseModel):
    """
    Response schema for pharmacy details.
    """
    id: str
    owner_name: str
    pharmacy_name: str
    email: EmailStr
    phone_number: str
    drug_license_number: str
    kendra_code: str = Field(
        ...,
        min_length=10,
        max_length=10,
        pattern=r"^PMBJK\d{5}$",
    )
    gst_number: str
    address: str
    city: str
    state: str
    pin_code: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    status: PharmacyStatus
    is_email_verified: bool
# ==========================================================
# Pharmacy Message Response
# ==========================================================
class PharmacyMessageResponse(BaseModel):
    """
    Generic pharmacy operation response.
    """
    message: str
# ==========================================================
# Nearby Pharmacy Response
# ==========================================================
class NearbyPharmacyResponse(BaseModel):
    """
    Pharmacy returned by the nearby-pharmacy search.
    Stock information comes from the inventory/batch
    system used by the nearby pharmacy API.
    """
    pharmacy_id: str
    pharmacy_name: str
    address: str
    city: str
    state: str
    pin_code: str
    latitude: float
    longitude: float
    distance_km: float
    available_quantity: int
    mrp: float
    stock_status: str