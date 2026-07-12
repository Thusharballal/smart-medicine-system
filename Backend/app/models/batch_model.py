from datetime import datetime, timezone
from pydantic import BaseModel, Field
class BatchModel(BaseModel):
    """Represents a medicine batch stored in the inventory.
    Each batch belongs to one medicine in the master database. """
    # Reference to Medicine Master
    medicine_id: str
    # Batch Information
    batch_number: str = Field(
        ...,
        min_length=3,
        max_length=50
    )
    manufacturing_date: datetime
    expiry_date: datetime
    # Stock Information
    quantity_received: int = Field(
        ...,
        gt=0
    )
    available_quantity: int = Field(
        ...,
        ge=0
    )
    # Pricing
    purchase_price: float = Field(
        ...,
        gt=0
    )
    mrp: float = Field(
        ...,
        gt=0
    )
    # Supplier Details
    supplier_name: str = Field(
        ...,
        min_length=2,
        max_length=150
    )
    invoice_number: str = Field(
        ...,
        min_length=2,
        max_length=100
    )
    # Archive Status
    is_archived: bool = False
    # Audit Fields
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )