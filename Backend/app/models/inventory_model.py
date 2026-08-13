# from datetime import datetime
# from pydantic import BaseModel, Field


# class InventoryMovementModel(BaseModel):
#     medicine_id: str
#     batch_id: str
#     batch_number: str
#     movement_type: str  # SALE, PURCHASE, RETURN, ADJUSTMENT
#     quantity: int
#     reference_id: str | None = None
#     reference_type: str | None = None
#     created_by: str
#     created_at: datetime = Field(default_factory=datetime.utcnow)