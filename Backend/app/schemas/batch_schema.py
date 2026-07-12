from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
class BatchCreateRequest(BaseModel):
    """
    Request schema for adding a new medicine batch.
    """
    medicine_id: str
    batch_number: str = Field(
        ...,
        min_length=3,
        max_length=50
    )
    manufacturing_date: datetime
    expiry_date: datetime
    quantity_received: int = Field(
        ...,
        gt=0
    )
    purchase_price: float = Field(
        ...,
        gt=0
    )
    mrp: float = Field(
        ...,
        gt=0
    )
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
class BatchUpdateRequest(BaseModel):
    """
    Request schema for updating a medicine batch.
    """
    purchase_price: Optional[float] = Field(
        default=None,
        gt=0
    )
    mrp: Optional[float] = Field(
        default=None,
        gt=0
    )
    supplier_name: Optional[str] = Field(
        default=None,
        min_length=2,
        max_length=150
    )
    invoice_number: Optional[str] = Field(
        default=None,
        min_length=2,
        max_length=100
    )
class BatchResponse(BaseModel):
    """
    Response schema for returning batch details.
    Medicine information is populated using MongoDB $lookup.
    """
    id: str
    medicine_id: str
    # Medicine Details (Fetched from Medicine Collection)
    generic_name: str
    jan_aushadhi_name: str
    strength: str
    # Batch Details
    batch_number: str
    manufacturing_date: datetime
    expiry_date: datetime
    quantity_received: int
    available_quantity: int
    purchase_price: float
    mrp: float
    supplier_name: str
    invoice_number: str
    is_archived: bool
class BatchMessageResponse(BaseModel):
    """Generic success response."""
    message: str