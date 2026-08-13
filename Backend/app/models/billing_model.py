from datetime import datetime, UTC
from typing import List, Optional
from pydantic import BaseModel, Field
class BillItemModel(BaseModel):
    medicine_id: str
    batch_id: str
    quantity: int = Field(..., gt=0)
    unit_price: float = Field(..., ge=0)
    total_price: float = Field(..., ge=0)
class BillingModel(BaseModel):
    bill_number: str
    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None
    items: List[BillItemModel]
    subtotal: float = Field(..., ge=0)
    discount: float = Field(
        default=0.0,
        ge=0
    )
    # GST percentage selected by the pharmacy owner
    gst_percentage: float = Field(
        default=0.0,
        ge=0,
        le=100
    )
    # Calculated GST amount
    tax: float = Field(
        default=0.0,
        ge=0
    )
    total_amount: float = Field(
        ...,
        ge=0
    )
    payment_method: str
    payment_status: str = "PAID"
    created_by: str
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(UTC)
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(UTC)
    )
    is_archived: bool = False