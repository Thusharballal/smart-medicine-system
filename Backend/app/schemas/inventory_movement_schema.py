from datetime import datetime
from pydantic import BaseModel


class InventoryMovementResponse(BaseModel):
    medicine_id: str
    batch_id: str
    batch_number: str
    movement_type: str
    quantity: int
    reference_id: str
    reference_type: str
    created_by: str
    created_at: datetime