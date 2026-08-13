from datetime import datetime, timezone
from typing import List,Optional
from pydantic import BaseModel, Field
class MedicineModel(BaseModel):
    """Master medicine information stored in MongoDB.
    This model contains only medicine details.
    Inventory and batch information are stored separately."""
    generic_name: str = Field(
        ...,
        min_length=2,
        max_length=100
    )
    jan_aushadhi_name: str = Field(
        ...,
        min_length=2,
        max_length=150
    )
    brand_names: List[str] = Field(
    default_factory=list
)
    composition: str = Field(
        ...,
        min_length=2,
        max_length=200
    )
    strength: str = Field(
        ...,
        min_length=1,
        max_length=50
    )
    dosage_form: str = Field(
        ...,
        min_length=2,
        max_length=50
    )
    manufacturer: str = Field(
        ...,
        min_length=2,
        max_length=100
    )
    category: str = Field(
        ...,
        min_length=2,
        max_length=100
    )
    description: Optional[str] = None
    branded_price: float
    jan_aushadhi_price: float
    is_archived: bool = False
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )