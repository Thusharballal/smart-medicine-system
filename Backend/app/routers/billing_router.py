from fastapi import APIRouter, Depends, status, Query
from typing import Optional
from app.schemas.billing_schema import (
    CreateBillRequest,
    BillResponse,
    BillHistoryResponse,
    BillDetailResponse,
)
from app.services.billing_service import (
    create_bill,
    get_bill_history,
    get_bill_by_number,
)
from app.core.security import get_current_user
router = APIRouter(
    prefix="/api/v1/billing",
    tags=["Billing"]
)
@router.post(
    "",
    response_model=BillResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Bill",
)
async def create_new_bill(
    bill_data: CreateBillRequest,
    current_user: dict = Depends(get_current_user),
):
    """Create a new bill."""

    return await create_bill(
        bill_data=bill_data,
        current_user=current_user,
    )



@router.get(
    "/history",
    response_model=BillHistoryResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Bill History",
)
async def get_bills_history(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search by bill number, customer name, or phone"),
    status: Optional[str] = Query(None, description="Filter by payment status (paid, pending, cancelled)"),
    current_user: dict = Depends(get_current_user),
):
    """
    Get paginated bill history with optional search and filters.
    
    Query Parameters:
    - page: Page number (default: 1)
    - page_size: Number of bills per page (default: 10, max: 100)
    - search: Search by bill number, customer name, or phone
    - status: Filter by payment status (paid, pending, cancelled)
    """
    return await get_bill_history(
        page=page,
        page_size=page_size,
        search=search,
        status_filter=status,
        current_user=current_user,
    )


@router.get(
    "/{bill_number}",
    response_model=BillDetailResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Bill Details",
)
async def get_bill_details(
    bill_number: str,
    current_user: dict = Depends(get_current_user),
):
    """
    Get complete bill details by bill number.
    
    Path Parameters:
    - bill_number: The bill number to retrieve
    """
    return await get_bill_by_number(
        bill_number=bill_number,
        current_user=current_user,
    )
