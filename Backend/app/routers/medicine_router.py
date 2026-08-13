from fastapi import APIRouter, status,Query,Depends
from typing import List
from app.utils.jwt_helper import get_current_user, require_role
from app.utils.constants import UserRole
from app.schemas.auth_schemas import MessageResponse
from app.schemas.medicine_schema import (
    MedicineCreateRequest,
    MedicineResponse,
    MedicineUpdateRequest,
    MedicineAlternativeResponse,
)
from app.services.medicine_service import (
    add_medicine,
    get_all_medicines,
    get_medicine_by_id,
    update_medicine,
    archive_medicine,
    restore_medicine,
    search_medicines,
    delete_medicine,
    get_medicine_alternative,
)
router = APIRouter(
    prefix="/medicines",
    tags=["Medicines"]
)
@router.post(
    "",
    response_model=MessageResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add Medicine"
)
async def create_medicine(
    medicine_data: MedicineCreateRequest,
    current_user: dict = Depends(
    require_role([
        UserRole.ADMIN,
        UserRole.PHARMACY_OWNER
    ])
)
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
async def get_medicines(
    current_user: dict = Depends(
        require_role([
            UserRole.ADMIN,
            UserRole.PHARMACY_OWNER
        ])
    )
):
    """Retrieve all medicines."""
    return await get_all_medicines()
@router.get(
    "/search",
    response_model=List[MedicineResponse],
    summary="Search Medicines"
)
async def search_medicines_api(
    current_user: dict = Depends(get_current_user),
    q: str = Query(
        ...,
        min_length=1,
        description="Search keyword"
    )
):
    """Search medicines."""
    return await search_medicines(
        q
    )
@router.get(
    "/alternatives/{medicine_id}",
    response_model=MedicineAlternativeResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Generic and Jan Aushadhi Alternative"
)
async def get_medicine_alternative_api(
    medicine_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get the generic and Jan Aushadhi equivalent."""
    return await get_medicine_alternative(
        medicine_id
    )
@router.get(
    "/{medicine_id}",
    response_model=MedicineResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Medicine By ID"
)
async def get_medicine(
    medicine_id: str,
    current_user: dict = Depends(get_current_user)
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
    medicine_data: MedicineUpdateRequest,
    current_user: dict = Depends(require_role([UserRole.ADMIN]))
):
    """Update medicine details."""
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
    medicine_id: str,
    current_user: dict = Depends(require_role([UserRole.ADMIN]))
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
    medicine_id: str,
    current_user: dict = Depends(require_role([UserRole.ADMIN]))
):
    """ Restore an archived medicine. """
    return await restore_medicine(
        medicine_id
    )
@router.delete(
    "/{medicine_id}",
    response_model=MessageResponse,
    status_code=status.HTTP_200_OK,
    summary="Delete Medicine"
)
async def delete_medicine_api(
    medicine_id: str,
    current_user: dict = Depends(
        require_role([UserRole.ADMIN])
    )
):
    """Permanently delete a medicine."""
    return await delete_medicine(
        medicine_id
    )