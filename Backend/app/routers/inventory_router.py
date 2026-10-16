from fastapi import (
    APIRouter,
    status,
    Depends,
    UploadFile,
    File,
)
from typing import List
from app.core.security import get_current_pharmacy
from app.schemas.inventory_schema import (
    InventoryDashboardResponse,
    LowStockBatchResponse,
    NearExpiryBatchResponse,
    OutOfStockBatchResponse,
    ExpiredMedicineBatchResponse,
    InventoryActivityResponse,
    MedicineAvailabilityResponse,
)
from app.schemas.inventory_import_schema import (
    InventoryImportPreviewResponse,
    InventoryImportConfirmRequest,
    InventoryImportResult,
)
from app.services.inventory_service import (
    get_inventory_dashboard,
    get_low_stock_batches,
    get_near_expiry_batches,
    get_out_of_stock_batches,
    get_recent_inventory_activities,
    get_medicine_availability,
)
from app.services.inventory_import_service import (
    preview_inventory_import,
    confirm_inventory_import,
)
from app.services.inventory_report_service import (
    get_expired_medicine_report_data,
    generate_out_of_stock_report,
    generate_expired_medicine_report,
)
router = APIRouter(
    prefix="/api/v1/inventory",
    tags=["Inventory"],
)
# ============================================================
# INVENTORY DASHBOARD
# ============================================================
@router.get(
    "/dashboard",
    response_model=InventoryDashboardResponse,
    status_code=status.HTTP_200_OK,
    summary="Inventory Dashboard",
)
async def inventory_dashboard(
    current_pharmacy: dict = Depends(get_current_pharmacy),
):
    """
    Get inventory dashboard for the logged-in pharmacy.
    """
    return await get_inventory_dashboard(
        str(current_pharmacy["_id"])
    )
# ============================================================
# LOW STOCK
# ============================================================
@router.get(
    "/low-stock",
    response_model=List[LowStockBatchResponse],
    status_code=status.HTTP_200_OK,
    summary="Low Stock Batches",
)
async def low_stock_batches(
    current_pharmacy: dict = Depends(get_current_pharmacy),
):
    """
    Get low-stock batches for the logged-in pharmacy.
    """
    return await get_low_stock_batches(
        str(current_pharmacy["_id"])
    )
# ============================================================
# NEAR EXPIRY
# ============================================================
@router.get(
    "/near-expiry",
    response_model=List[NearExpiryBatchResponse],
    status_code=status.HTTP_200_OK,
    summary="Near Expiry Batches",
)
async def near_expiry_batches(
    current_pharmacy: dict = Depends(get_current_pharmacy),
):
    """
    Get batches that are near expiry
    for the logged-in pharmacy.
    """

    return await get_near_expiry_batches(
        str(current_pharmacy["_id"])
    )


# ============================================================
# OUT OF STOCK
# ============================================================

@router.get(
    "/out-of-stock",
    response_model=List[OutOfStockBatchResponse],
    status_code=status.HTTP_200_OK,
    summary="Out Of Stock Batches",
)
async def out_of_stock_batches(
    current_pharmacy: dict = Depends(get_current_pharmacy),
):
    """
    Get out-of-stock batches for
    the logged-in pharmacy.
    """

    return await get_out_of_stock_batches(
        str(current_pharmacy["_id"])
    )


# ============================================================
# EXPIRED MEDICINES
# ============================================================

@router.get(
    "/expired",
    response_model=List[ExpiredMedicineBatchResponse],
    status_code=status.HTTP_200_OK,
    summary="Expired Medicine Batches",
)
async def expired_medicine_batches(
    current_pharmacy: dict = Depends(get_current_pharmacy),
):
    """
    Get expired medicine batches for the
    logged-in pharmacy.
    """
    records = await get_expired_medicine_report_data(
        str(current_pharmacy["_id"])
    )
    return records
# ============================================================
# OUT OF STOCK PDF REPORT
# ============================================================
@router.get(
    "/reports/out-of-stock",
    status_code=status.HTTP_200_OK,
    summary="Download Out Of Stock Report",
)
async def download_out_of_stock_report(
    current_pharmacy: dict = Depends(get_current_pharmacy),
):
    """
    Automatically detect all out-of-stock medicines
    and generate a downloadable PDF report.
    """
    return await generate_out_of_stock_report(
        str(current_pharmacy["_id"])
    )
# ============================================================
# EXPIRED MEDICINE PDF REPORT
# ============================================================
@router.get(
    "/reports/expired",
    status_code=status.HTTP_200_OK,
    summary="Download Expired Medicine Report",
)
async def download_expired_medicine_report(
    current_pharmacy: dict = Depends(get_current_pharmacy),
):
    """
    Automatically detect all expired medicines
    and generate a downloadable PDF report.
    """
    return await generate_expired_medicine_report(
        str(current_pharmacy["_id"])
    )
# ============================================================
# RECENT ACTIVITIES
# ============================================================
@router.get(
    "/recent-activities",
    response_model=List[InventoryActivityResponse],
    status_code=status.HTTP_200_OK,
    summary="Recent Inventory Activities",
)
async def recent_inventory_activities(
    current_pharmacy: dict = Depends(get_current_pharmacy),
):
    """
    Get recent inventory activities
    for the logged-in pharmacy.
    """
    return await get_recent_inventory_activities(
        str(current_pharmacy["_id"])
    )
# ============================================================
# MEDICINE AVAILABILITY
# ============================================================
@router.get(
    "/medicine/{medicine_id}/availability",
    response_model=MedicineAvailabilityResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Medicine Available Quantity",
)
async def medicine_availability(
    medicine_id: str,
    current_pharmacy: dict = Depends(get_current_pharmacy),
):
    """
    Get available quantity of a medicine
    for the logged-in pharmacy.
    """
    return await get_medicine_availability(
        medicine_id,
        str(current_pharmacy["_id"]),
    )
# ============================================================
# INVENTORY IMPORT - PREVIEW
# ============================================================
@router.post(
    "/import/preview",
    response_model=InventoryImportPreviewResponse,
    status_code=status.HTTP_200_OK,
    summary="Preview Inventory Import",
)
async def preview_import(
    file: UploadFile = File(...),
    current_pharmacy: dict = Depends(get_current_pharmacy),
):
    """
    Upload CSV or PDF supplier file and generate
    an inventory import preview.
    IMPORTANT:
    This endpoint DOES NOT insert anything into MongoDB.
    It only:
        1. Reads the uploaded file
        2. Extracts inventory rows
        3. Matches medicines
        4. Validates the data
        5. Returns a preview
    """
    return await preview_inventory_import(
        file=file,
        pharmacy_id=str(current_pharmacy["_id"]),
    )
# ============================================================
# INVENTORY IMPORT - CONFIRM
# ============================================================
@router.post(
    "/import/confirm",
    response_model=InventoryImportResult,
    status_code=status.HTTP_200_OK,
    summary="Confirm Inventory Import",
)
async def confirm_import(
    import_data: InventoryImportConfirmRequest,
    current_pharmacy: dict = Depends(get_current_pharmacy),
):
    """
    Confirm the previously reviewed inventory import.
    The server must validate the rows again before
    creating batches.
    This is the point where inventory is actually
    updated in MongoDB.
    """
    return await confirm_inventory_import(
        import_data=import_data,
        pharmacy_id=str(current_pharmacy["_id"]),
    )