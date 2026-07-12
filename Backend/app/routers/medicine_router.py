from fastapi import APIRouter, status,Query
from typing import List
from app.schemas.auth_schemas import MessageResponse
from app.schemas.medicine_schema import (
    MedicineCreateRequest,
    MedicineResponse,
    MedicineUpdateRequest,
)
from app.services.medicine_service import (
    add_medicine,
    get_all_medicines,
    get_medicine_by_id,
    update_medicine,
    archive_medicine,
    restore_medicine,
    search_medicines,
)
router = APIRouter(
    prefix="/api/v1/medicines",
    tags=["Medicines"]
)
@router.post(
    "",
    response_model=MessageResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add Medicine"
)
async def create_medicine(
    medicine_data: MedicineCreateRequest
):
    """Add a new medicine to the master database."""
    return await add_medicine(
        medicine_data
    )
@router.get(
    "",
    response_model=List[MedicineResponse],
    status_code=status.HTTP_200_OK,
    summary="Get All Medicines"
)
async def get_medicines():
    """Retrieve all medicines."""
    return await get_all_medicines()
@router.get(
    "/search",
    response_model=List[MedicineResponse],
    summary="Search Medicines"
)
async def search_medicines_api(
    q: str = Query(
        ...,
        min_length=1,
        description="Search keyword"
    )
):
    """
    Search medicines.
    """

    return await search_medicines(
        q
    )
@router.get(
    "/{medicine_id}",
    response_model=MedicineResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Medicine By ID"
)
async def get_medicine(
    medicine_id: str
):
    """Retrieve a single medicine."""
    return await get_medicine_by_id(
        medicine_id
    )
@router.put(
    "/{medicine_id}",
    response_model=MessageResponse,
    status_code=status.HTTP_200_OK,
    summary="Update Medicine"
)
async def update_medicine_api(
    medicine_id: str,
    medicine_data: MedicineUpdateRequest
):
    """
    Update medicine details.
    """
    return await update_medicine(
        medicine_id,
        medicine_data
    )
@router.patch(
    "/{medicine_id}/archive",
    response_model=MessageResponse,
    status_code=status.HTTP_200_OK,
    summary="Archive Medicine"
)
async def archive_medicine_api(
    medicine_id: str
):
    """Archive a medicine."""
    return await archive_medicine(
        medicine_id
    )
@router.patch(
    "/{medicine_id}/restore",
    response_model=MessageResponse,
    status_code=status.HTTP_200_OK,
    summary="Restore Medicine"
)
async def restore_medicine_api(
    medicine_id: str
):
    """
    Restore an archived medicine.
    """
    return await restore_medicine(
        medicine_id
    )