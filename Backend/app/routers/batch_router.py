from fastapi import APIRouter, status
from typing import List
from app.schemas.batch_schema import (
    BatchCreateRequest,
    BatchMessageResponse,
    BatchUpdateRequest
)
from app.services.batch_service import (
    add_batch,
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
from app.schemas.batch_schema import (
    BatchCreateRequest,
    BatchResponse,
    BatchMessageResponse,
)
router = APIRouter(
    prefix="/api/v1/batches",
    tags=["Batches"]
)
@router.post(
    "",
    response_model=BatchMessageResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add Batch"
)
async def create_batch(
    batch_data: BatchCreateRequest
):
    """Add a new medicine batch."""
    return await add_batch(
        batch_data
    )
@router.get(
    "",
    response_model=List[BatchResponse],
    status_code=status.HTTP_200_OK,
    summary="Get All Batches"
)
async def get_batches():
    """Retrieve all active medicine batches."""
    return await get_all_batches()
@router.get(
    "/search",
    response_model=List[BatchResponse],
    status_code=status.HTTP_200_OK,
    summary="Search Batches"
)
async def search_batches_api(
    query: str
):
    """ Search active medicine batches."""
    return await search_batches(
        query
    )
@router.get(
    "/{batch_id}",
    response_model=BatchResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Batch By ID"
)
async def get_batch(
    batch_id: str
):
    """Retrieve a single medicine batch."""
    return await get_batch_by_id(
        batch_id
    )
@router.put(
    "/{batch_id}",
    response_model=BatchMessageResponse,
    status_code=status.HTTP_200_OK,
    summary="Update Batch"
)
async def update_batch_api(
    batch_id: str,
    batch_data: BatchUpdateRequest
):
    """Update editable batch details."""
    return await update_batch(
        batch_id,
        batch_data
    )
@router.delete(
    "/{batch_id}",
    response_model=BatchMessageResponse,
    status_code=status.HTTP_200_OK,
    summary="Archive Batch"
)
async def archive_batch_api(
    batch_id: str
):
    """Archive a medicine batch."""
    return await archive_batch(
        batch_id
    )
@router.patch(
    "/restore/{batch_id}",
    response_model=BatchMessageResponse,
    status_code=status.HTTP_200_OK,
    summary="Restore Batch"
)
async def restore_batch_api(
    batch_id: str
):
    """
    Restore an archived batch.
    """
    return await restore_batch(
        batch_id
    )
