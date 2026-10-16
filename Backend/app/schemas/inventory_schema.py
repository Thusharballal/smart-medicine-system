from pydantic import BaseModel
from datetime import datetime
# ============================================================
# INVENTORY DASHBOARD
# ============================================================
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
    today_sales: float = 0.0
# ============================================================
# LOW STOCK
# ============================================================
class LowStockBatchResponse(BaseModel):
    """Low stock batch details."""
    batch_id: str
    medicine_id: str
    generic_name: str
    jan_aushadhi_name: str
    strength: str
    batch_number: str
    available_quantity: int
    expiry_date: datetime
# ============================================================
# NEAR EXPIRY
# ============================================================
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
# ============================================================
# OUT OF STOCK
# ============================================================
class OutOfStockBatchResponse(BaseModel):
    """Out of stock batch details."""
    batch_id: str
    medicine_id: str
    generic_name: str
    jan_aushadhi_name: str
    strength: str
    batch_number: str
    available_quantity: int
# ============================================================
# EXPIRED MEDICINES
# ============================================================
class ExpiredMedicineBatchResponse(BaseModel):
    """Expired medicine batch details."""
    batch_id: str
    medicine_id: str
    generic_name: str
    jan_aushadhi_name: str
    strength: str
    batch_number: str
    available_quantity: int
    expiry_date: datetime
    days_expired: int
# ============================================================
# REPORT RESPONSE
# ============================================================
class InventoryReportResponse(BaseModel):
    """Inventory report metadata."""
    report_type: str
    report_name: str
    generated_at: datetime
    total_records: int
# ============================================================
# INVENTORY ACTIVITY
# ============================================================
class InventoryActivityResponse(BaseModel):
    """Recent inventory activity."""
    activity_type: str
    medicine_name: str
    batch_number: str | None = None
    activity_time: datetime
    description: str
# ============================================================
# MEDICINE AVAILABILITY
# ============================================================
class MedicineAvailabilityResponse(BaseModel):
    """Current available stock for a medicine."""
    medicine_id: str
    medicine_name: str
    available_quantity: int