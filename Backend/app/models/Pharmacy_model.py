from datetime import datetime
from typing import Optional
from pydantic import EmailStr, Field
from app.models.base_model import BaseDocument
from app.utils.constants import PharmacyStatus
class PharmacyModel(BaseDocument):
    # ==========================================================
    # Owner / Pharmacy Account
    # ==========================================================
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
    hashed_password: str
    # ==========================================================
    # Pharmacy Registration
    # ==========================================================
    drug_license_number: str = Field(
        ...,
        min_length=1,
        max_length=100,
    )
    # Mandatory Jan Aushadhi Kendra Code
    # Example: PMBJK00017
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
    # ==========================================================
    # Address
    # ==========================================================
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
    # ==========================================================
    # Location
    #
    # Required for:
    # - Nearby pharmacy search
    # - Distance calculation
    # - Map display
    # - Location-based ranking
    # ==========================================================
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
    # Pharmacy Status
    # ==========================================================
    status: PharmacyStatus = PharmacyStatus.PENDING
    is_email_verified: bool = False
    # =========================================================
    # Admin Approval
    # ==========================================================
    approved_by: Optional[str] = None
    approved_at: Optional[datetime] = None
    # ==========================================================
    # Login Tracking
    # ==========================================================
    last_login: Optional[datetime] = None