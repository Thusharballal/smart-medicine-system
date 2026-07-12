from pydantic import BaseModel
from datetime import datetime,timezone
class InventoryDashboardResponse(BaseModel):
    """Inventory dashboard summary."""
    total_medicines: int
    total_batches: int
    total_stock_units: int
    low_stock_batches: int
    out_of_stock_batches: int
    near_expiry_batches: int
    inventory_health: float
    total_inventory_value: float
    average_stock_per_batch: float
class LowStockBatchResponse(BaseModel):
    """Low stock batch details. """
    batch_id: str
    medicine_id: str
    generic_name: str
    jan_aushadhi_name: str
    strength: str
    batch_number: str
    available_quantity: int
    expiry_date: datetime
class NearExpiryBatchResponse(BaseModel):
    """Near expiry batch details."""
    batch_id: str
    medicine_id: str
    generic_name: str
    jan_aushadhi_name: str
    strength: str
    batch_number: str
    available_quantity: int
    expiry_date: datetime
    days_remaining: int
class OutOfStockBatchResponse(BaseModel):
    """Out of stock batch details."""
    batch_id: str
    medicine_id: str
    generic_name: str
    jan_aushadhi_name: str
    strength: str
    batch_number: str
    available_quantity: int
class InventoryActivityResponse(BaseModel):
    """Recent inventory activity."""
    activity_type: str
    medicine_name: str
    batch_number: str | None = None
    activity_time: datetime
    description: str