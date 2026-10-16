from typing import List, Optional

from pydantic import BaseModel, Field


class DetectedMedicine(BaseModel):
    """A medicine identified from a prescription."""

    name: str = Field(
        ...,
        description="Medicine name identified from the database",
    )

    dosage: Optional[str] = Field(
        default=None,
        description="Medicine dosage such as 500mg or 650mg",
    )

    frequency: Optional[str] = Field(
        default=None,
        description="How frequently the medicine should be taken",
    )

    duration: Optional[str] = Field(
        default=None,
        description="Duration for which the medicine should be taken",
    )

    composition: Optional[str] = Field(
        default=None,
        description="Medicine composition if available",
    )

    confidence: Optional[float] = Field(
        default=None,
        description="OCR confidence score",
    )


class OCRResponse(BaseModel):
    """Response returned by the prescription OCR endpoint."""

    success: bool = True

    recognized_text: List[str] = Field(
        default_factory=list,
        description="English text recognized from the prescription",
    )

    medicines: List[DetectedMedicine] = Field(
        default_factory=list,
        description="Medicines identified from the prescription",
    )

    message: Optional[str] = None