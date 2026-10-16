from fastapi import APIRouter, Depends, status
from app.schemas.pharmacy_schema import (
    PharmacyCreateRequest,
    PharmacyUpdateRequest,
    PharmacyResponse,
    PharmacyMessageResponse,
    NearbyPharmacyResponse,
)
from app.core.security import get_current_pharmacy
from app.services.pharmacy_service import (
    create_pharmacy,
    get_nearby_pharmacies,
    get_pharmacy_profile,
    update_pharmacy_profile,
)
# ============================================================
# Pharmacy Router
# ===========================================================
router = APIRouter(
    prefix="/api/v1/pharmacies",
    tags=["Pharmacies"],
)
# ============================================================
# Register Pharmacy
# ============================================================
@router.post(
    "",
    status_code=status.HTTP_201_CREATED,
    summary="Register Pharmacy",
)
async def register_pharmacy(
    pharmacy_data: PharmacyCreateRequest,
):
    """
    Register a new pharmacy.
    New pharmacies are initially created with
    PENDING status and require admin approval.
    """
    return await create_pharmacy(
        pharmacy_data
    )
# ============================================================
# Get Current Pharmacy Profile
# ============================================================
@router.get(
    "/me",
    response_model=PharmacyResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Current Pharmacy Profile",
)
async def get_my_pharmacy_profile(
    current_pharmacy: dict = Depends(
        get_current_pharmacy
    ),
):
    """
    Return the profile of the currently
    authenticated pharmacy owner.
    """
    return await get_pharmacy_profile(
        current_pharmacy
    )
# ============================================================
# Update Current Pharmacy Profile
# ============================================================
@router.put(
    "/me",
    response_model=PharmacyResponse,
    status_code=status.HTTP_200_OK,
    summary="Update Current Pharmacy Profile",
)
async def update_my_pharmacy_profile(
    pharmacy_data: PharmacyUpdateRequest,
    current_pharmacy: dict = Depends(
        get_current_pharmacy
    ),
):
    """
    Update the profile of the currently
    authenticated pharmacy.
    """
    return await update_pharmacy_profile(
        current_pharmacy=current_pharmacy,
        pharmacy_data=pharmacy_data,
    )
# ============================================================
# Find Nearby Pharmacies
# ============================================================
@router.get(
    "/nearby",
    response_model=list[NearbyPharmacyResponse],
    status_code=status.HTTP_200_OK,
    summary="Find Nearby Pharmacies",
)
async def nearby_pharmacies(
    medicine_id: str,
    latitude: float,
    longitude: float,
):
    """
    Find approved pharmacies that currently
    have the requested medicine in stock.
    Results are sorted by distance from
    the supplied latitude and longitude.
    """
    return await get_nearby_pharmacies(
        medicine_id=medicine_id,
        latitude=latitude,
        longitude=longitude,
    )