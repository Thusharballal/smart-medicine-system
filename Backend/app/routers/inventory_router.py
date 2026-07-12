from fastapi import APIRouter, status
from typing import List
from app.schemas.inventory_schema import (
    InventoryDashboardResponse,
    LowStockBatchResponse,
    NearExpiryBatchResponse,
    OutOfStockBatchResponse,
    InventoryActivityResponse,
)

from app.services.inventory_service import (
    get_inventory_dashboard,
    get_low_stock_batches,
    get_near_expiry_batches,
    get_out_of_stock_batches,
    get_recent_inventory_activities,
)

router = APIRouter(
    prefix="/api/v1/inventory",
    tags=["Inventory"]
)

@router.get(
    "/dashboard",
    response_model=InventoryDashboardResponse,
    status_code=status.HTTP_200_OK,
    summary="Inventory Dashboard"
)
async def inventory_dashboard():
    return await get_inventory_dashboard()
@router.get(
    "/low-stock",
    response_model=List[LowStockBatchResponse],
    status_code=status.HTTP_200_OK,
    summary="Low Stock Batches"
)
async def low_stock_batches():
    """ Retrieve all low stock batches."""
    return await get_low_stock_batches()
@router.get(
    "/near-expiry",
    response_model=List[NearExpiryBatchResponse],
    status_code=status.HTTP_200_OK,
    summary="Near Expiry Batches"
)
async def near_expiry_batches():
    """Retrieve all batches expiring within 90 days."""
    return await get_near_expiry_batches()
@router.get(
    "/out-of-stock",
    response_model=List[OutOfStockBatchResponse],
    status_code=status.HTTP_200_OK,
    summary="Out Of Stock Batches"
)
async def out_of_stock_batches():
    """ Retrieve all active out of stock batches."""
    return await get_out_of_stock_batches()
@router.get(
    "/recent-activities",
    response_model=List[InventoryActivityResponse],
    status_code=status.HTTP_200_OK,
    summary="Recent Inventory Activities"
)
async def recent_inventory_activities():
    """ Retrieve recent inventory activities."""
    return await get_recent_inventory_activities()