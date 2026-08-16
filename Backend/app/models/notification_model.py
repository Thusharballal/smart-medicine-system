from datetime import datetime
from typing import Optional
from pydantic import Field
from app.models.base_model import BaseDocument
class NotificationModel(BaseDocument):
    user_id: str = Field(...)
    title: str = Field(
        ...,
        min_length=1,
        max_length=150,
    )
    description: str = Field(
        ...,
        min_length=1,
        max_length=500,
    )
    type: str = Field(
        default="info",
        max_length=30,
    )
    is_read: bool = False
    read_at: Optional[datetime] = None