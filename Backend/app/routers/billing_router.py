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
from app.core.security import get_current_pharmacy
router = APIRouter(
    prefix="/api/v1/billing",
    tags=["Billing"],
)
# ============================================================
# CREATE BILL
# ============================================================
@router.post(
    "",
    response_model=BillResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create New Bill",
)
async def create_new_bill(
    bill_data: CreateBillRequest,
    current_pharmacy: dict = Depends(get_current_pharmacy),
):
    """
    Create a new pharmacy bill.
    Authentication:
        Pharmacy Owner only
    The pharmacy is determined from the authenticated JWT.
    The client does not provide pharmacy_id.
    """
    return await create_bill(
        bill_data=bill_data,
        current_pharmacy=current_pharmacy,
    )
# ============================================================
# BILL HISTORY
# ============================================================
@router.get(
    "/history",
    response_model=BillHistoryResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Bill History",
)
async def get_bills_history(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=10, ge=1, le=100),
    search: Optional[str] = Query(default=None),
    status: Optional[str] = Query(default=None),
    current_pharmacy: dict = Depends(get_current_pharmacy),
):
    """
    Get bills belonging only to the authenticated pharmacy.
    Supports:
        - Pagination
        - Search
        - Payment status filtering
    """
    return await get_bill_history(
        page=page,
        page_size=page_size,
        search=search,
        status=status,
        current_pharmacy=current_pharmacy,
    )
# ============================================================
# BILL DETAILS
# ============================================================
@router.get(
    "/{bill_number}",
    response_model=BillDetailResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Bill Details",
)
async def get_bill_details(
    bill_number: str,
    current_pharmacy: dict = Depends(get_current_pharmacy),
):
    """
    Get a single bill by bill number.
    Only bills belonging to the authenticated pharmacy
    can be accessed.
    """
    return await get_bill_by_number(
        bill_number=bill_number,
        current_pharmacy=current_pharmacy,
    )