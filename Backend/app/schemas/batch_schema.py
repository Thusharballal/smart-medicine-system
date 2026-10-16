from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
# ============================================================
# CREATE BATCH REQUEST
# ============================================================
class BatchCreateRequest(BaseModel):
    """
    Request schema for adding a new medicine batch.
    """
    # ========================================================
    # Medicine Reference
    # ========================================================
    medicine_id: str
    # ========================================================
    # Batch Information
    # ========================================================
    batch_number: str = Field(
        ...,
        min_length=3,
        max_length=50,
    )
    manufacturing_date: datetime
    expiry_date: datetime
    # ========================================================
    # Stock Information
    # ========================================================
    quantity_received: int = Field(
        ...,
        gt=0,
    )
    # ========================================================
    # Pricing
    # ========================================================
    purchase_price: float = Field(
        ...,
        gt=0,
    )
    mrp: float = Field(
        ...,
        gt=0,
    )
    # ========================================================
    # Supplier Details
    # ========================================================
    supplier_name: str = Field(
        ...,
        min_length=2,
        max_length=150,
    )
    invoice_number: str = Field(
        ...,
        min_length=2,
        max_length=100,
    )
# ============================================================
# UPDATE BATCH REQUEST
# ===========================================================

class BatchUpdateRequest(BaseModel):
    """
    Request schema for updating an existing medicine batch.
    """
    purchase_price: Optional[float] = Field(
        default=None,
        gt=0,
    )
    mrp: Optional[float] = Field(
        default=None,
        gt=0,
    )
    supplier_name: Optional[str] = Field(
        default=None,
        min_length=2,
        max_length=150,
    )
    invoice_number: Optional[str] = Field(
        default=None,
        min_length=2,
        max_length=100,
    )

# ============================================================
# BATCH RESPONSE
# ============================================================
class BatchResponse(BaseModel):
    """
    Response schema for returning batch details.
    Medicine information is populated using MongoDB
    $lookup in the batch service.
    """
    # ========================================================
    # IDs
    # ========================================================
    id: str
    medicine_id: str
    pharmacy_id: str
    # ========================================================
    # Medicine Details
    # ========================================================
    generic_name: str
    jan_aushadhi_name: str
    strength: str
    # ========================================================
    # Batch Information
    # ========================================================
    batch_number: str
    manufacturing_date: datetime
    expiry_date: datetime
    # ========================================================
    # Stock
    # ========================================================
    quantity_received: int
    available_quantity: int
    # ========================================================
    # Pricing
    # ========================================================
    purchase_price: float
    mrp: float
    # ========================================================
    # Supplier
    # ========================================================
    supplier_name: str
    invoice_number: str
    # ========================================================
    # Status
    # ========================================================
    is_archived: bool
# ============================================================
# BATCH MESSAGE RESPONSE
# ============================================================
class BatchMessageResponse(BaseModel):
    """
    Generic response for batch operations.
    """
    message: str
    # Returned when a batch is created
    batch_id: Optional[str] = None