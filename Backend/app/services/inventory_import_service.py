import os
import shutil
import tempfile
from datetime import datetime, timezone
from typing import Any, Dict, List
from uuid import uuid4
from bson import ObjectId
from fastapi import HTTPException, UploadFile, status
from app.database.connection import get_database
from app.schemas.inventory_import_schema import (
    InventoryImportRow,
    InventoryImportPreviewResponse,
    InventoryImportConfirmRequest,
    InventoryImportResult,
)
from app.schemas.batch_schema import BatchCreateRequest
from app.services.batch_service import add_batch
from app.services.medicine_service import search_medicines
from app.utils.csv_parser import parse_csv_file
from app.utils.pdf_parser import parse_pdf_file, is_text_pdf
from app.utils.pdf_ocr import parse_scanned_pdf
from app.models.inventory_movement_model import InventoryMovementModel
from app.services.inventory_movement_service import (
    create_inventory_movement,
)
# ============================================================
# DATETIME NORMALIZATION
# ============================================================
def normalize_datetime_to_naive_utc(
    value: datetime | None,
) -> datetime | None:
    """
    Normalize a datetime to naive UTC.
    Timezone-aware datetime:
        Convert to UTC and remove timezone information.
    Timezone-naive datetime:
        Return unchanged.
    None:
        Return None.
    This keeps all dates consistent with the existing
    batch service, which uses naive datetime comparisons.
    """
    if value is None:
        return None
    if value.tzinfo is not None:
        return value.astimezone(
            timezone.utc
        ).replace(
            tzinfo=None
        )
    return value
# ============================================================
# TEMP FILE HANDLING
# ============================================================
async def save_upload_to_temp(
    file: UploadFile,
) -> str:
    """
    Save uploaded CSV/PDF file to a temporary location.
    The temporary file is removed by the caller
    after processing.
    """

    suffix = os.path.splitext(
        file.filename or ""
    )[1].lower()

    if suffix not in [
        ".csv",
        ".pdf",
    ]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only CSV and PDF files are supported.",
        )

    temp_file = tempfile.NamedTemporaryFile(
        delete=False,
        suffix=suffix,
    )

    try:

        while True:

            chunk = await file.read(
                1024 * 1024
            )

            if not chunk:
                break

            temp_file.write(
                chunk
            )

    finally:

        temp_file.close()

    return temp_file.name


# ============================================================
# MEDICINE MATCHING
# ============================================================

def normalize_match_text(
    value: Any,
) -> str:
    """
    Normalize text before medicine matching.
    """

    if value is None:
        return ""

    return (
        str(value)
        .strip()
        .lower()
    )


def calculate_match_confidence(
    search_text: str,
    medicine: Dict[str, Any],
) -> float:
    """
    Calculate medicine match confidence.

    Matching priority:

    Exact generic name       -> 1.00
    Exact Jan Aushadhi name  -> 0.95
    Exact brand name         -> 0.90
    Partial generic name     -> 0.80
    Partial brand name       -> 0.75
    Partial composition      -> 0.70
    Manufacturer match       -> 0.50
    """

    query = normalize_match_text(
        search_text
    )

    if not query:
        return 0.0

    generic_name = normalize_match_text(
        medicine.get(
            "generic_name"
        )
    )

    jan_name = normalize_match_text(
        medicine.get(
            "jan_aushadhi_name"
        )
    )

    composition = normalize_match_text(
        medicine.get(
            "composition"
        )
    )

    manufacturer = normalize_match_text(
        medicine.get(
            "manufacturer"
        )
    )

    brand_names = medicine.get(
        "brand_names",
        [],
    )

    if isinstance(
        brand_names,
        str,
    ):
        brand_names = [
            brand_names
        ]

    normalized_brands = [
        normalize_match_text(
            brand
        )
        for brand in brand_names
    ]

    # --------------------------------------------------------
    # Exact generic
    # --------------------------------------------------------

    if query == generic_name:
        return 1.00

    # --------------------------------------------------------
    # Exact Jan Aushadhi name
    # --------------------------------------------------------

    if query == jan_name:
        return 0.95

    # --------------------------------------------------------
    # Exact brand
    # --------------------------------------------------------

    if query in normalized_brands:
        return 0.90

    # --------------------------------------------------------
    # Partial generic
    # --------------------------------------------------------

    if query and generic_name:

        if (
            query in generic_name
            or generic_name in query
        ):
            return 0.80

    # --------------------------------------------------------
    # Partial brand
    # --------------------------------------------------------

    for brand in normalized_brands:

        if brand and (
            query in brand
            or brand in query
        ):
            return 0.75

    # --------------------------------------------------------
    # Composition
    # --------------------------------------------------------

    if query and composition:

        if (
            query in composition
            or composition in query
        ):
            return 0.70

    # --------------------------------------------------------
    # Manufacturer
    # --------------------------------------------------------

    if query and manufacturer:

        if query in manufacturer:
            return 0.50

    return 0.0


async def match_medicine(
    medicine_name: str,
) -> Dict[str, Any]:
    """
    Match imported medicine against
    the existing Medicine Master.
    """

    query = medicine_name.strip()

    if not query:

        return {
            "match_status": "unmatched",
            "match_confidence": 0.0,
        }

    # --------------------------------------------------------
    # Search Medicine Master
    # --------------------------------------------------------

    medicines = await search_medicines(
        query
    )

    if not medicines:

        return {
            "match_status": "unmatched",
            "match_confidence": 0.0,
        }

    best_medicine = None
    best_confidence = 0.0

    for medicine in medicines:

        confidence = calculate_match_confidence(
            query,
            medicine,
        )

        if confidence > best_confidence:

            best_confidence = confidence
            best_medicine = medicine

    if not best_medicine:

        return {
            "match_status": "unmatched",
            "match_confidence": 0.0,
        }

    medicine_id = best_medicine.get(
        "id"
    )

    # --------------------------------------------------------
    # Determine match status
    # --------------------------------------------------------

    if best_confidence >= 0.90:

        match_status = "matched"

    elif best_confidence >= 0.70:

        match_status = "review"

    else:

        match_status = "unmatched"

    return {
        "medicine_id": medicine_id,

        "generic_name": best_medicine.get(
            "generic_name"
        ),

        "jan_aushadhi_name": best_medicine.get(
            "jan_aushadhi_name"
        ),

        "strength": best_medicine.get(
            "strength"
        ),

        "match_status": match_status,

        "match_confidence": best_confidence,
    }


# ============================================================
# ROW NORMALIZATION
# ============================================================

def normalize_import_row(
    raw_row: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Convert parser output into the common
    InventoryImportRow structure.

    Datetimes are normalized here so that all
    downstream validation uses the same format.
    """

    medicine_name = (
        raw_row.get(
            "medicine_name"
        )
        or raw_row.get(
            "generic_name"
        )
        or ""
    )

    manufacturing_date = (
        normalize_datetime_to_naive_utc(
            raw_row.get(
                "manufacturing_date"
            )
        )
    )

    expiry_date = (
        normalize_datetime_to_naive_utc(
            raw_row.get(
                "expiry_date"
            )
        )
    )

    return {
        "medicine_name": str(
            medicine_name
        ).strip(),

        "medicine_id": raw_row.get(
            "medicine_id"
        ),

        "generic_name": raw_row.get(
            "generic_name"
        ),

        "jan_aushadhi_name": raw_row.get(
            "jan_aushadhi_name"
        ),

        "strength": raw_row.get(
            "strength"
        ),

        "match_status": raw_row.get(
            "match_status",
            "unmatched",
        ),

        "match_confidence": raw_row.get(
            "match_confidence",
            0.0,
        ),

        "batch_number": raw_row.get(
            "batch_number"
        ),

        "manufacturing_date": manufacturing_date,

        "expiry_date": expiry_date,

        "quantity": raw_row.get(
            "quantity"
        ),

        "purchase_price": raw_row.get(
            "purchase_price"
        ),

        "mrp": raw_row.get(
            "mrp"
        ),

        "supplier_name": raw_row.get(
            "supplier_name"
        ),

        "invoice_number": raw_row.get(
            "invoice_number"
        ),

        "errors": list(
            raw_row.get(
                "errors",
                [],
            )
        ),

        "warnings": list(
            raw_row.get(
                "warnings",
                [],
            )
        ),
    }


# ============================================================
# SERVER-SIDE VALIDATION
# ============================================================

def validate_import_row(
    row: Dict[str, Any],
) -> List[str]:
    """
    Validate one inventory import row.

    This validation is performed on the server.
    """

    errors: List[str] = []

    # --------------------------------------------------------
    # Normalize dates first
    # --------------------------------------------------------

    manufacturing_date = (
        normalize_datetime_to_naive_utc(
            row.get(
                "manufacturing_date"
            )
        )
    )

    expiry_date = (
        normalize_datetime_to_naive_utc(
            row.get(
                "expiry_date"
            )
        )
    )

    row["manufacturing_date"] = (
        manufacturing_date
    )

    row["expiry_date"] = (
        expiry_date
    )

    # --------------------------------------------------------
    # Medicine
    # --------------------------------------------------------

    if not row.get(
        "medicine_name"
    ):

        errors.append(
            "Medicine name is required."
        )

    if not row.get(
        "medicine_id"
    ):

        errors.append(
            "Medicine must be matched before import."
        )

    # --------------------------------------------------------
    # Batch
    # --------------------------------------------------------

    batch_number = row.get(
        "batch_number"
    )

    if not batch_number:

        errors.append(
            "Batch number is required."
        )

    # --------------------------------------------------------
    # Quantity
    # --------------------------------------------------------

    quantity = row.get(
        "quantity"
    )

    if quantity is None:

        errors.append(
            "Quantity is required."
        )

    elif quantity <= 0:

        errors.append(
            "Quantity must be greater than 0."
        )

    # --------------------------------------------------------
    # Purchase price
    # --------------------------------------------------------

    purchase_price = row.get(
        "purchase_price"
    )

    if purchase_price is None:

        errors.append(
            "Purchase price is required."
        )

    elif purchase_price <= 0:

        errors.append(
            "Purchase price must be greater than 0."
        )

    # --------------------------------------------------------
    # MRP
    # --------------------------------------------------------

    mrp = row.get(
        "mrp"
    )

    if mrp is None:

        errors.append(
            "MRP is required."
        )

    elif mrp <= 0:

        errors.append(
            "MRP must be greater than 0."
        )

    elif (
        purchase_price is not None
        and mrp < purchase_price
    ):

        errors.append(
            "MRP cannot be lower than purchase price."
        )

    # --------------------------------------------------------
    # Dates
    # --------------------------------------------------------

    if (
        manufacturing_date
        and expiry_date
        and manufacturing_date > expiry_date
    ):

        errors.append(
            "Manufacturing date cannot be after expiry date."
        )

    # --------------------------------------------------------
    # Supplier
    # --------------------------------------------------------

    if not row.get(
        "supplier_name"
    ):

        errors.append(
            "Supplier name is required."
        )

    # --------------------------------------------------------
    # Invoice
    # --------------------------------------------------------

    if not row.get(
        "invoice_number"
    ):

        errors.append(
            "Invoice number is required."
        )

    return errors


# ============================================================
# PARSER SELECTION
# ============================================================

def parse_uploaded_file(
    file_path: str,
    file_type: str,
) -> List[Dict[str, Any]]:
    """
    Select the correct parser.

    CSV:
        csv_parser.py

    Text PDF:
        pdf_parser.py

    Scanned PDF:
        pdf_ocr.py
    """

    if file_type == ".csv":

        return parse_csv_file(
            file_path
        )

    if file_type == ".pdf":

        if is_text_pdf(
            file_path
        ):

            return parse_pdf_file(
                file_path
            )

        return parse_scanned_pdf(
            file_path
        )

    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Unsupported file type.",
    )


# ============================================================
# PREVIEW IMPORT
# ============================================================

async def preview_inventory_import(
    file: UploadFile,
    pharmacy_id: str,
) -> InventoryImportPreviewResponse:
    """
    Process uploaded CSV/PDF without inserting
    anything into MongoDB.
    """

    if not file.filename:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File name is missing.",
        )

    extension = os.path.splitext(
        file.filename
    )[1].lower()

    if extension not in [
        ".csv",
        ".pdf",
    ]:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only CSV and PDF files are supported.",
        )

    temp_path = None

    try:

        # ----------------------------------------------------
        # Save uploaded file
        # ----------------------------------------------------

        temp_path = await save_upload_to_temp(
            file
        )

        # ----------------------------------------------------
        # Parse file
        # ----------------------------------------------------

        raw_rows = parse_uploaded_file(
            temp_path,
            extension,
        )

        if not raw_rows:

            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "No inventory records could be "
                    "extracted from the uploaded file."
                ),
            )

        preview_rows: List[
            InventoryImportRow
        ] = []

        # ----------------------------------------------------
        # Normalize + match + validate
        # ----------------------------------------------------

        for raw_row in raw_rows:

            row = normalize_import_row(
                raw_row
            )

            medicine_name = row[
                "medicine_name"
            ]

            # ------------------------------------------------
            # Medicine matching
            # ------------------------------------------------

            if medicine_name:

                match_result = await match_medicine(
                    medicine_name
                )

                row.update(
                    match_result
                )

            # ------------------------------------------------
            # Validate extracted data
            # ------------------------------------------------

            validation_errors = (
                validate_import_row(
                    row
                )
            )

            # ------------------------------------------------
            # At preview stage, missing medicine match
            # is represented as unmatched rather than
            # an extraction error.
            # ------------------------------------------------

            validation_errors = [
                error
                for error in validation_errors
                if error
                != "Medicine must be matched before import."
            ]

            row["errors"].extend(
                validation_errors
            )

            # ------------------------------------------------
            # Warnings
            # ------------------------------------------------

            if row.get(
                "match_status"
            ) == "review":

                row["warnings"].append(
                    "Medicine match should be manually reviewed."
                )

            elif row.get(
                "match_status"
            ) == "unmatched":

                row["warnings"].append(
                    "Medicine could not be matched automatically."
                )

            preview_rows.append(
                InventoryImportRow(
                    **row
                )
            )

        # ----------------------------------------------------
        # Statistics
        # ----------------------------------------------------

        total_rows = len(
            preview_rows
        )

        matched_rows = sum(
            1
            for row in preview_rows
            if row.match_status
            == "matched"
        )

        unmatched_rows = sum(
            1
            for row in preview_rows
            if row.match_status
            in [
                "unmatched",
                "review",
            ]
        )

        invalid_rows = sum(
            1
            for row in preview_rows
            if row.errors
        )

        # IMPORTANT:
        # Only matched rows without validation errors
        # are considered ready for import.

        valid_rows = sum(
            1
            for row in preview_rows
            if (
                row.match_status
                == "matched"
                and not row.errors
            )
        )

        return InventoryImportPreviewResponse(
            file_name=file.filename,

            file_type=extension.replace(
                ".",
                "",
            ),

            total_rows=total_rows,

            matched_rows=matched_rows,

            unmatched_rows=unmatched_rows,

            valid_rows=valid_rows,

            invalid_rows=invalid_rows,

            rows=preview_rows,
        )

    finally:

        if (
            temp_path
            and os.path.exists(
                temp_path
            )
        ):

            try:

                os.remove(
                    temp_path
                )

            except OSError:

                pass


# ============================================================
# CONFIRM IMPORT
# ============================================================

async def confirm_inventory_import(
    import_data: InventoryImportConfirmRequest,
    pharmacy_id: str,
) -> InventoryImportResult:
    """
    Confirm reviewed inventory rows.

    Production workflow:

        Validate all rows
              ↓
        Verify Medicine Master
              ↓
        Start MongoDB transaction
              ↓
        Create Batch
              ↓
        Create PURCHASE Movement
              ↓
        Commit

    If any operation fails:

        Rollback entire import.
    """

    # --------------------------------------------------------
    # Basic validation
    # --------------------------------------------------------

    if not import_data.rows:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No rows were provided for import.",
        )

    # --------------------------------------------------------
    # Validate pharmacy ID
    # --------------------------------------------------------

    if not ObjectId.is_valid(
        pharmacy_id
    ):

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid pharmacy ID.",
        )

    database = get_database()

    # --------------------------------------------------------
    # Import reference ID
    # --------------------------------------------------------

    import_id = str(
        uuid4()
    )

    # --------------------------------------------------------
    # Prepare validated rows
    # --------------------------------------------------------

    validated_rows: List[
        Dict[str, Any]
    ] = []
    validation_errors: List[str] = []
    # ========================================================
    # PHASE 1
    # SERVER-SIDE VALIDATION
    # ========================================================
    for index, row_model in enumerate(
        import_data.rows,
        start=1,
    ):
        row = row_model.model_dump()
        # ----------------------------------------------------
        # Normalize dates BEFORE validation
        # ----------------------------------------------------
        row["manufacturing_date"] = (
            normalize_datetime_to_naive_utc(
                row.get(
                    "manufacturing_date"
                )
            )
        )
        row["expiry_date"] = (
            normalize_datetime_to_naive_utc(
                row.get(
                    "expiry_date"
                )
            )
        )
        # ----------------------------------------------------
        # Basic validation
        # ----------------------------------------------------
        row_errors = validate_import_row(
            row
        )
        if row_errors:
            validation_errors.append(
                f"Row {index}: "
                + "; ".join(
                    row_errors
                )
            )
            continue
        # ----------------------------------------------------
        # Validate medicine ID
        # ----------------------------------------------------
        medicine_id = row.get(
            "medicine_id"
        )
        if not ObjectId.is_valid(
            medicine_id
        ):
            validation_errors.append(
                f"Row {index}: Invalid medicine ID."
            )
            continue
        # ----------------------------------------------------
        # Verify medicine exists and is active
        # ----------------------------------------------------
        medicine = await database.medicines.find_one(
            {
                "_id": ObjectId(
                    medicine_id
                ),
                "is_archived": {
                    "$ne": True
                },
            }
        )
        if not medicine:
            validation_errors.append(
                f"Row {index}: "
                "Medicine does not exist or is archived."
            )
            continue
        # ----------------------------------------------------
        # Ensure medicine name was not empty
        # ----------------------------------------------------
        if not row.get(
            "medicine_name"
        ):
            validation_errors.append(
                f"Row {index}: Medicine name is required."
            )
            continue
        # ----------------------------------------------------
        # Ensure batch number exists
        # ----------------------------------------------------
        if not row.get(
            "batch_number"
        ):
            validation_errors.append(
                f"Row {index}: Batch number is required."
            )
            continue
        validated_rows.append(
            {
                "index": index,
                "row": row,
                "medicine": medicine,
            }
        )
    # =======================================================
    # IMPORTANT:
    # ALL-OR-NOTHING VALIDATION
    # ========================================================
    if validation_errors:
        return InventoryImportResult(
            message=(
                "Inventory import was not completed. "
                "Please correct the validation errors "
                "and try again."
            ),
            imported_count=0,
            skipped_count=0,
            failed_count=len(
                validation_errors
            ),
            imported_batch_ids=[],
            errors=validation_errors,
        )
    if not validated_rows:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No valid rows are available for import.",
        )
    # ========================================================
    # PHASE 2
    # PRE-CHECK DUPLICATE BATCHES
    # ========================================================
    duplicate_errors: List[str] = []
    # Track duplicates inside the same request as well.
    seen_batch_keys = set()
    for item in validated_rows:
        index = item[
            "index"
        ]
        row = item[
            "row"
        ]
        batch_key = (
            row["medicine_id"],
            row["batch_number"],
        )
        if batch_key in seen_batch_keys:
            duplicate_errors.append(
                f"Row {index}: "
                f"Duplicate batch {row['batch_number']} "
                "appears more than once in this import."
            )
            continue
        seen_batch_keys.add(
            batch_key
        )
        duplicate = await database.batches.find_one(
            {
                "pharmacy_id": pharmacy_id,
                "medicine_id": row[
                    "medicine_id"
                ],
                "batch_number": row[
                    "batch_number"
                ],
                "is_archived": False,
            }
        )
        if duplicate:
            duplicate_errors.append(
                f"Row {index}: "
                f"Batch {row['batch_number']} "
                "already exists."
            )
    if duplicate_errors:
        return InventoryImportResult(
            message=(
                "Inventory import was not completed "
                "because one or more batches already exist "
                "or are duplicated in the import."
            ),
            imported_count=0,
            skipped_count=len(
                duplicate_errors
            ),
            failed_count=0,
            imported_batch_ids=[],
            errors=duplicate_errors,
        )
    # ========================================================
    # PHASE 3
    # MONGODB TRANSACTION
    # ========================================================
    imported_batch_ids: List[
        str
    ] = []
    # Your get_database() returns AsyncIOMotorDatabase.
    # Its client is the AsyncIOMotorClient used to create
    # the MongoDB transaction session.
    client = database.client
    session = await client.start_session()
    try:
        async with session:
            async with session.start_transaction():
                # ===================================================
                # CREATE BATCHES + INVENTORY MOVEMENTS
                # ===================================================
                for item in validated_rows:
                    index = item[
                        "index"
                    ]
                    row = item[
                        "row"
                    ]
                    try:
                        # ------------------------------------------------
                        # Normalize dates one final time before
                        # sending them to the batch service.
                        # ------------------------------------------------
                        manufacturing_date = (
                            normalize_datetime_to_naive_utc(
                                row.get(
                                    "manufacturing_date"
                                )
                            )
                        )
                        expiry_date = (
                            normalize_datetime_to_naive_utc(
                                row.get(
                                    "expiry_date"
                                )
                            )
                        )
                        # ------------------------------------------------
                        # Build BatchCreateRequest
                        # ------------------------------------------------
                        batch_data = BatchCreateRequest(
                            medicine_id=row[
                                "medicine_id"
                            ],
                            batch_number=row[
                                "batch_number"
                            ],
                            manufacturing_date=(
                                manufacturing_date
                            ),
                            expiry_date=(
                                expiry_date
                            ),
                            quantity_received=row[
                                "quantity"
                            ],
                            purchase_price=row[
                                "purchase_price"
                            ],
                            mrp=row[
                                "mrp"
                            ],
                            supplier_name=row[
                                "supplier_name"
                            ],
                            invoice_number=row[
                                "invoice_number"
                            ],
                        )
                        # ------------------------------------------------
                        # Create batch using existing service
                        # ------------------------------------------------
                        result = await add_batch(
                            batch_data=batch_data,
                            pharmacy_id=pharmacy_id,
                            session=session,
                        )
                        batch_id = result.get(
                            "batch_id"
                        )
                        if not batch_id:
                            raise RuntimeError(
                                "Batch was created but "
                                "batch ID was not returned."
                            )
                        # ------------------------------------------------
                        # Create PURCHASE movement
                        # ------------------------------------------------
                        movement = InventoryMovementModel(
                            medicine_id=row[
                                "medicine_id"
                            ],
                            batch_id=str(
                                batch_id
                            ),
                            batch_number=row[
                                "batch_number"
                            ],
                            movement_type="PURCHASE",
                            quantity=int(
                                row[
                                    "quantity"
                                ]
                            ),
                            reference_id=import_id,
                            reference_type=(
                                "INVENTORY_IMPORT"
                            ),
                            created_by=pharmacy_id,
                        )
                        await create_inventory_movement(
                            movement=movement,
                            session=session,
                        )
                        imported_batch_ids.append(
                            str(
                                batch_id
                            )
                        )
                    except Exception as row_error:
                        # ------------------------------------------------
                        # Any exception causes the entire transaction
                        # to fail and rollback.
                        # ------------------------------------------------
                        raise RuntimeError(
                            f"Row {index} failed: "
                            f"{str(row_error)}"
                        ) from row_error
    except Exception as exc:
        # ------------------------------------------------------------
        # Transaction has been rolled back.
        # ------------------------------------------------------------
        return InventoryImportResult(
            message=(
                "Inventory import failed. "
                "No batches or inventory movements were imported."
            ),
            imported_count=0,
            skipped_count=0,
            failed_count=len(
                validated_rows
            ),
            imported_batch_ids=[],
            errors=[
                str(exc)
            ],
        )
    finally:
        # Motor session is closed by the async context manager.
        pass
    # ========================================================
    # SUCCESS
    # ========================================================
    imported_count = len(
        imported_batch_ids
    )
    return InventoryImportResult(
        message=(
            "Inventory import completed successfully."
        ),
        imported_count=imported_count,
        skipped_count=0,
        failed_count=0,
        imported_batch_ids=(
            imported_batch_ids
        ),
        errors=[],
    )