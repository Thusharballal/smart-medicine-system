from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field
class BillItemRequest(BaseModel):
    medicine_id: str
    quantity: int = Field(..., gt=0)
class CreateBillRequest(BaseModel):
    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None
    payment_method: str
    discount: float = Field(
        default=0.0,
        ge=0
    )
    gst_percentage: float = Field(
        default=0.0,
        ge=0,
        le=100
    )
    items: List[BillItemRequest]
class BillItemResponse(BaseModel):
    medicine_id: str
    medicine_name: str
    batch_id: str
    batch_number: str
    quantity: int
    unit_price: float
    total_price: float
class BillResponse(BaseModel):
    bill_number: str
    customer_name: Optional[str]
    customer_phone: Optional[str]
    items: List[BillItemResponse]
    subtotal: float
    discount: float
    gst_percentage: float
    tax: float
    total_amount: float
    payment_method: str
    payment_status: str
    created_by: str
    created_at: datetime
# Bill History Schemas
class BillHistoryItemResponse(BaseModel):
    """Simplified bill item for history list"""
    bill_number: str
    customer_name: Optional[str]
    customer_phone: Optional[str]
    medicine_count: int
    total_amount: float
    payment_method: str
    payment_status: str
    created_at: datetime
    created_by: str
class BillHistoryResponse(BaseModel):
    """Paginated bill history response"""
    bills: List[BillHistoryItemResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
class BillDetailResponse(BaseModel):
    """Complete bill details including all items"""
    bill_number: str
    customer_name: Optional[str]
    customer_phone: Optional[str]
    items: List[BillItemResponse]
    subtotal: float
    discount: float
    gst_percentage: float
    tax: float
    total_amount: float
    payment_method: str
    payment_status: str
    created_by: str
    created_at: datetime
    updated_at: datetime