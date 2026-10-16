from datetime import datetime, UTC
from typing import List, Optional
from pydantic import BaseModel, Field
# ============================================================
# BILL ITEM MODEL
# ============================================================
class BillItemModel(BaseModel):
    """
    Individual medicine item stored inside a bill.
    """
    medicine_id: str
    batch_id: str
    quantity: int = Field(
        ...,
        gt=0,
    )
    unit_price: float = Field(
        ...,
        ge=0,
    )
    total_price: float = Field(
        ...,
        ge=0,
    )
# ============================================================
# BILLING MODEL
# ============================================================
class BillingModel(BaseModel):
    """
    Complete bill document stored in MongoDB.
    pharmacy_id identifies which pharmacy owns the bill.
    It is populated from the authenticated Pharmacy Owner,
    never from frontend input.
    """
    # ========================================================
    # BILL IDENTIFICATION
    # =================================================
    bill_number: str
    pharmacy_id: str
    # ========================================================
    # CUSTOMER DETAILS
    # ========================================================
    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None
    # ========================================================
    # BILL ITEMS
    # ========================================================
    items: List[BillItemModel] = Field(
        ...,
        min_length=1,
    )
    # ========================================================
    # BILL AMOUNTS
    # ========================================================
    subtotal: float = Field(
        ...,
        ge=0,
    )
    discount: float = Field(
        default=0.0,
        ge=0,
    )
    # ========================================================
    # GST
    # ========================================================
    # GST percentage selected by the pharmacy owner.
    gst_percentage: float = Field(
        default=0.0,
        ge=0,
        le=100,
    )
    # Calculated GST amount.
    tax: float = Field(
        default=0.0,
        ge=0,
    )
    # Final amount payable.
    total_amount: float = Field(
        ...,
        ge=0,
    )
    # ========================================================
    # PAYMENT
    # ========================================================
    payment_method: str
    payment_status: str = "PAID"
    # ========================================================
    # AUDIT
    # ========================================================
    created_by: str
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(UTC)
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(UTC)
    )
    # ========================================================
    # ARCHIVE
    # ========================================================
    is_archived: bool = False