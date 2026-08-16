from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
class NotificationCreate(BaseModel):
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
class NotificationResponse(BaseModel):
    id: str
    user_id: str
    title: str
    description: str
    type: str
    is_read: bool
    created_at: datetime
    updated_at: datetime
    read_at: Optional[datetime] = None