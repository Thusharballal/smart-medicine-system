from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field
# ============================================================
# EXTRACTED IMPORT ROW
# ============================================================
class InventoryImportRow(BaseModel):
    """
    Represents one medicine/batch row extracted from
    a supplier PDF or CSV file.
    """
    # ========================================================
    # Original extracted medicine information
    # ========================================================
    medicine_name: str = Field(
        ...,
        min_length=1,
        max_length=200,
    )
    # =======================================================
    # Matched medicine information
    # ========================================================
    medicine_id: Optional[str] = None
    generic_name: Optional[str] = None
    jan_aushadhi_name: Optional[str] = None
    strength: Optional[str] = None
    match_status: str = "unmatched"
    match_confidence: float = 0.0
    # ========================================================
    # Batch information
    # ========================================================
    batch_number: Optional[str] = None
    manufacturing_date: Optional[datetime] = None
    expiry_date: Optional[datetime] = None
    # =======================================================
    # Stock information
    # ========================================================
    quantity: Optional[int] = None
    # ========================================================
    # Pricing
    # ========================================================
    purchase_price: Optional[float] = None
    mrp: Optional[float] = None
    # =======================================================
    # Supplier information
    # ========================================================
    supplier_name: Optional[str] = None
    invoice_number: Optional[str] = None
    # ========================================================
    # Import validation
    # ========================================================
    errors: List[str] = Field(
        default_factory=list
    )
    warnings: List[str] = Field(
        default_factory=list
    )
# ============================================================
# IMPORT PREVIEW RESPONSE
# ============================================================
class InventoryImportPreviewResponse(BaseModel):
    """
    Response returned after parsing a PDF or CSV.
    The pharmacy owner reviews this data before
    confirming the import.
    """
    file_name: str
    file_type: str
    total_rows: int
    matched_rows: int
    unmatched_rows: int
    valid_rows: int
    invalid_rows: int
    rows: List[InventoryImportRow]
# ============================================================
# CONFIRM IMPORT REQUEST
# ============================================================
class InventoryImportConfirmRequest(BaseModel):
    """
    Request sent after the pharmacy owner reviews
    and confirms the import preview.
    """
    rows: List[InventoryImportRow]
# ============================================================
# IMPORT RESULT
# ============================================================
class InventoryImportResult(BaseModel):
    """
    Final response after successfully importing
    supplier inventory.
    """
    message: str
    imported_count: int
    skipped_count: int = 0
    failed_count: int = 0
    imported_batch_ids: List[str] = Field(
        default_factory=list
    )
    errors: List[str] = Field(
        default_factory=list
    )