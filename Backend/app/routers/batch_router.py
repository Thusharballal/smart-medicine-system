from fastapi import APIRouter, status, Depends
from typing import List
from app.core.security import get_current_pharmacy
from app.schemas.batch_schema import (
    BatchCreateRequest,
    BatchResponse,
    BatchMessageResponse,
    BatchUpdateRequest,
)
from app.services.batch_service import (
    add_batch,
    get_all_batches,
    get_batch_by_id,
    update_batch,
    archive_batch,
    restore_batch,
    search_batches,
)
router = APIRouter(
    prefix="/api/v1/batches",
    tags=["Batches"],
)
# ============================================================
# CREATE BATCH
# ============================================================
@router.post(
    "",
    response_model=BatchMessageResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add Batch",
)
async def create_batch(
    batch_data: BatchCreateRequest,
    current_pharmacy: dict = Depends(get_current_pharmacy),
):
    """
    Add a new medicine batch for the logged-in pharmacy.
    """

    return await add_batch(
        batch_data,
        str(current_pharmacy["_id"]),
    )


# ============================================================
# GET ALL BATCHES
# ============================================================

@router.get(
    "",
    response_model=List[BatchResponse],
    status_code=status.HTTP_200_OK,
    summary="Get All Batches",
)
async def get_batches(
    current_pharmacy: dict = Depends(get_current_pharmacy),
):
    """
    Retrieve active batches belonging to
    the logged-in pharmacy.
    """

    return await get_all_batches(
        str(current_pharmacy["_id"])
    )


# ============================================================
# SEARCH BATCHES
# ============================================================

@router.get(
    "/search",
    response_model=List[BatchResponse],
    status_code=status.HTTP_200_OK,
    summary="Search Batches",
)
async def search_batches_api(
    query: str,
    current_pharmacy: dict = Depends(get_current_pharmacy),
):
    """
    Search active batches belonging to
    the logged-in pharmacy.
    """

    return await search_batches(
        query,
        str(current_pharmacy["_id"]),
    )


# ============================================================
# GET BATCH BY ID
# ============================================================

@router.get(
    "/{batch_id}",
    response_model=BatchResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Batch By ID",
)
async def get_batch(
    batch_id: str,
    current_pharmacy: dict = Depends(get_current_pharmacy),
):
    """
    Retrieve a batch belonging to
    the logged-in pharmacy.
    """

    return await get_batch_by_id(
        batch_id,
        str(current_pharmacy["_id"]),
    )


# ============================================================
# UPDATE BATCH
# ============================================================

@router.put(
    "/{batch_id}",
    response_model=BatchMessageResponse,
    status_code=status.HTTP_200_OK,
    summary="Update Batch",
)
async def update_batch_api(
    batch_id: str,
    batch_data: BatchUpdateRequest,
    current_pharmacy: dict = Depends(get_current_pharmacy),
):
    """
    Update a batch belonging to
    the logged-in pharmacy.
    """

    return await update_batch(
        batch_id,
        batch_data,
        str(current_pharmacy["_id"]),
    )


# ============================================================
# ARCHIVE BATCH
# ============================================================

@router.delete(
    "/{batch_id}",
    response_model=BatchMessageResponse,
    status_code=status.HTTP_200_OK,
    summary="Archive Batch",
)
async def archive_batch_api(
    batch_id: str,
    current_pharmacy: dict = Depends(get_current_pharmacy),
):
    """
    Archive a batch belonging to
    the logged-in pharmacy.
    """

    return await archive_batch(
        batch_id,
        str(current_pharmacy["_id"]),
    )


# ============================================================
# RESTORE BATCH
# ============================================================

@router.patch(
    "/restore/{batch_id}",
    response_model=BatchMessageResponse,
    status_code=status.HTTP_200_OK,
    summary="Restore Batch",
)
async def restore_batch_api(
    batch_id: str,
    current_pharmacy: dict = Depends(get_current_pharmacy),
):
    """
    Restore an archived batch belonging
    to the logged-in pharmacy.
    """
    return await restore_batch(
        batch_id,
        str(current_pharmacy["_id"]),
    )