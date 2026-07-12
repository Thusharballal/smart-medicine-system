from typing import Optional,List
from pydantic import BaseModel, Field
class MedicineCreateRequest(BaseModel):
    """Request schema for creating a new medicine."""
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
    brand_names: List[str] = Field(default_factory=list)
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
class MedicineUpdateRequest(BaseModel):
    """ Request schema for updating an existing medicine."""
    generic_name: Optional[str] = Field(
        default=None,
        min_length=2,
        max_length=100
    )
    jan_aushadhi_name: Optional[str] = Field(
        default=None,
        min_length=2,
        max_length=150
    )
    brand_names: Optional[List[str]] = Field(
        default=None,
        max_length=150
    )
    composition: Optional[str] = Field(
        default=None,
        min_length=2,
        max_length=200
    )
    strength: Optional[str] = Field(
        default=None,
        min_length=1,
        max_length=50
    )
    dosage_form: Optional[str] = Field(
        default=None,
        min_length=2,
        max_length=50
    )
    manufacturer: Optional[str] = Field(
        default=None,
        min_length=2,
        max_length=100
    )
    category: Optional[str] = Field(
        default=None,
        min_length=2,
        max_length=100
    )
    description: Optional[str] = None
class MedicineResponse(BaseModel):
    """Response schema returned to the frontend."""
    id: str
    generic_name: str
    jan_aushadhi_name: str
    brand_names: List[str]
    composition: str
    strength: str
    dosage_form: str
    manufacturer: str
    category: str
    description: Optional[str]
    is_archived: bool