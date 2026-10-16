from datetime import datetime, timezone

from bson import ObjectId
from fastapi import HTTPException, status

from app.database.connection import get_database
from app.models.batch_model import BatchModel
from app.schemas.batch_schema import (
    BatchCreateRequest,
    BatchUpdateRequest,
)
from app.utils.logger import logger


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

    This keeps date comparisons consistent throughout
    batch creation and inventory workflows.
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
# CREATE BATCH
# ============================================================

async def add_batch(
    batch_data: BatchCreateRequest,
    pharmacy_id: str,
    session=None,
):
    """
    Add a new medicine batch for the logged-in pharmacy.

    session is optional so existing batch APIs continue to work
    normally, while inventory import can use MongoDB transactions.
    """

    db = get_database()

    # --------------------------------------------------------
    # Validate medicine_id
    # --------------------------------------------------------

    if not ObjectId.is_valid(
        batch_data.medicine_id
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid medicine ID.",
        )

    # --------------------------------------------------------
    # Check whether medicine exists
    # --------------------------------------------------------

    medicine = await db.medicines.find_one(
        {
            "_id": ObjectId(
                batch_data.medicine_id
            ),
            "is_archived": False,
        },
        session=session,
    )

    if not medicine:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medicine not found.",
        )

    # --------------------------------------------------------
    # Normalize dates
    # --------------------------------------------------------

    manufacturing_date = (
        normalize_datetime_to_naive_utc(
            batch_data.manufacturing_date
        )
    )

    expiry_date = (
        normalize_datetime_to_naive_utc(
            batch_data.expiry_date
        )
    )

    # --------------------------------------------------------
    # Validate expiry date
    # --------------------------------------------------------

    if expiry_date is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Expiry date is required.",
        )

    current_datetime = datetime.utcnow()

    if expiry_date <= current_datetime:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Expiry date must be in the future.",
        )

    # --------------------------------------------------------
    # Validate manufacturing date
    # --------------------------------------------------------

    if manufacturing_date is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Manufacturing date is required.",
        )

    if manufacturing_date > expiry_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Manufacturing date cannot be after expiry date.",
        )

    # --------------------------------------------------------
    # Check duplicate batch number
    # --------------------------------------------------------

    existing_batch = await db.batches.find_one(
        {
            "pharmacy_id": pharmacy_id,
            "medicine_id": batch_data.medicine_id,
            "batch_number": batch_data.batch_number,
            "is_archived": False,
        },
        session=session,
    )

    if existing_batch:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Batch number already exists.",
        )

    # --------------------------------------------------------
    # Validate pricing
    # --------------------------------------------------------

    if batch_data.mrp < batch_data.purchase_price:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="MRP cannot be lower than purchase price.",
        )

    # --------------------------------------------------------
    # Create batch
    # --------------------------------------------------------

    batch = BatchModel(
        **batch_data.model_dump(
            exclude={
                "manufacturing_date",
                "expiry_date",
            }
        ),
        manufacturing_date=manufacturing_date,
        expiry_date=expiry_date,
        pharmacy_id=pharmacy_id,
        available_quantity=batch_data.quantity_received,
    )

    # --------------------------------------------------------
    # Insert into MongoDB
    # --------------------------------------------------------

    result = await db.batches.insert_one(
        batch.model_dump(),
        session=session,
    )

    logger.info(
        f"Batch added successfully: {batch.batch_number}"
    )

    return {
        "message": "Batch added successfully.",
        "batch_id": str(
            result.inserted_id
        ),
    }


# ============================================================
# GET ALL BATCHES
# ============================================================

async def get_all_batches(
    pharmacy_id: str,
):
    """
    Retrieve all active medicine batches
    belonging to the logged-in pharmacy,
    along with medicine details.
    """

    db = get_database()

    pipeline = [
        {
            "$match": {
                "pharmacy_id": pharmacy_id,
                "is_archived": False,
            }
        },
        {
            "$lookup": {
                "from": "medicines",
                "let": {
                    "medicineId": {
                        "$toObjectId": "$medicine_id"
                    }
                },
                "pipeline": [
                    {
                        "$match": {
                            "$expr": {
                                "$eq": [
                                    "$_id",
                                    "$$medicineId",
                                ]
                            }
                        }
                    }
                ],
                "as": "medicine",
            }
        },
        {
            "$unwind": "$medicine"
        },
        {
            "$sort": {
                "expiry_date": 1,
                "manufacturing_date": 1,
                "batch_number": 1,
            }
        },
    ]

    batches = await db.batches.aggregate(
        pipeline
    ).to_list(
        length=None
    )

    results = []

    for batch in batches:
        results.append(
            {
                "id": str(
                    batch["_id"]
                ),
                "medicine_id": batch[
                    "medicine_id"
                ],
                "pharmacy_id": batch[
                    "pharmacy_id"
                ],
                "generic_name": batch[
                    "medicine"
                ][
                    "generic_name"
                ],
                "jan_aushadhi_name": batch[
                    "medicine"
                ][
                    "jan_aushadhi_name"
                ],
                "strength": batch[
                    "medicine"
                ][
                    "strength"
                ],
                "batch_number": batch[
                    "batch_number"
                ],
                "manufacturing_date": batch[
                    "manufacturing_date"
                ],
                "expiry_date": batch[
                    "expiry_date"
                ],
                "quantity_received": batch[
                    "quantity_received"
                ],
                "available_quantity": batch[
                    "available_quantity"
                ],
                "purchase_price": batch[
                    "purchase_price"
                ],
                "mrp": batch[
                    "mrp"
                ],
                "supplier_name": batch[
                    "supplier_name"
                ],
                "invoice_number": batch[
                    "invoice_number"
                ],
                "is_archived": batch[
                    "is_archived"
                ],
            }
        )

    logger.info(
        f"Retrieved all batches for pharmacy: {pharmacy_id}"
    )

    return results


# ============================================================
# GET BATCH BY ID
# ============================================================

async def get_batch_by_id(
    batch_id: str,
    pharmacy_id: str,
):
    """
    Retrieve a single active batch
    belonging to the logged-in pharmacy,
    along with medicine details.
    """

    db = get_database()

    # --------------------------------------------------------
    # Validate batch_id
    # --------------------------------------------------------

    if not ObjectId.is_valid(
        batch_id
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid batch ID.",
        )

    pipeline = [
        {
            "$match": {
                "_id": ObjectId(
                    batch_id
                ),
                "pharmacy_id": pharmacy_id,
                "is_archived": False,
            }
        },
        {
            "$lookup": {
                "from": "medicines",
                "let": {
                    "medicineId": {
                        "$toObjectId": "$medicine_id"
                    }
                },
                "pipeline": [
                    {
                        "$match": {
                            "$expr": {
                                "$eq": [
                                    "$_id",
                                    "$$medicineId",
                                ]
                            }
                        }
                    }
                ],
                "as": "medicine",
            }
        },
        {
            "$unwind": "$medicine"
        },
    ]

    batches = await db.batches.aggregate(
        pipeline
    ).to_list(
        length=1
    )

    if not batches:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Batch not found.",
        )

    batch = batches[0]

    result = {
        "id": str(
            batch["_id"]
        ),
        "medicine_id": batch[
            "medicine_id"
        ],
        "pharmacy_id": batch[
            "pharmacy_id"
        ],
        "generic_name": batch[
            "medicine"
        ][
            "generic_name"
        ],
        "jan_aushadhi_name": batch[
            "medicine"
        ][
            "jan_aushadhi_name"
        ],
        "strength": batch[
            "medicine"
        ][
            "strength"
        ],
        "batch_number": batch[
            "batch_number"
        ],
        "manufacturing_date": batch[
            "manufacturing_date"
        ],
        "expiry_date": batch[
            "expiry_date"
        ],
        "quantity_received": batch[
            "quantity_received"
        ],
        "available_quantity": batch[
            "available_quantity"
        ],
        "purchase_price": batch[
            "purchase_price"
        ],
        "mrp": batch[
            "mrp"
        ],
        "supplier_name": batch[
            "supplier_name"
        ],
        "invoice_number": batch[
            "invoice_number"
        ],
        "is_archived": batch[
            "is_archived"
        ],
    }

    logger.info(
        f"Retrieved batch: {batch_id}"
    )

    return result


# ============================================================
# UPDATE BATCH
# ============================================================

async def update_batch(
    batch_id: str,
    batch_data: BatchUpdateRequest,
    pharmacy_id: str,
):
    """
    Update editable batch details
    belonging to the logged-in pharmacy.

    Normal batch editing does NOT modify stock quantity.
    Stock changes must go through the stock adjustment/billing
    workflow.
    """

    db = get_database()

    # --------------------------------------------------------
    # Validate batch_id
    # --------------------------------------------------------

    if not ObjectId.is_valid(
        batch_id
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid batch ID.",
        )

    # --------------------------------------------------------
    # Find batch
    # --------------------------------------------------------

    existing_batch = await db.batches.find_one(
        {
            "_id": ObjectId(
                batch_id
            ),
            "pharmacy_id": pharmacy_id,
            "is_archived": False,
        }
    )

    if not existing_batch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Batch not found.",
        )

    # --------------------------------------------------------
    # Prepare update data
    # --------------------------------------------------------

    update_data = batch_data.model_dump(
        exclude_unset=True,
        exclude_none=True,
    )

    # --------------------------------------------------------
    # Prevent empty update
    # --------------------------------------------------------

    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No data provided for update.",
        )

    # --------------------------------------------------------
    # Normalize date fields if present
    # --------------------------------------------------------

    if "manufacturing_date" in update_data:
        update_data[
            "manufacturing_date"
        ] = normalize_datetime_to_naive_utc(
            update_data[
                "manufacturing_date"
            ]
        )

    if "expiry_date" in update_data:
        update_data[
            "expiry_date"
        ] = normalize_datetime_to_naive_utc(
            update_data[
                "expiry_date"
            ]
        )

    # --------------------------------------------------------
    # Validate updated dates
    # --------------------------------------------------------

    new_manufacturing_date = update_data.get(
        "manufacturing_date",
        existing_batch.get(
            "manufacturing_date"
        ),
    )

    new_expiry_date = update_data.get(
        "expiry_date",
        existing_batch.get(
            "expiry_date"
        ),
    )

    new_manufacturing_date = (
        normalize_datetime_to_naive_utc(
            new_manufacturing_date
        )
    )

    new_expiry_date = (
        normalize_datetime_to_naive_utc(
            new_expiry_date
        )
    )

    if new_expiry_date is not None:
        if new_expiry_date <= datetime.utcnow():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Expiry date must be in the future.",
            )

    if (
        new_manufacturing_date is not None
        and new_expiry_date is not None
        and new_manufacturing_date
        > new_expiry_date
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Manufacturing date cannot be after expiry date.",
        )

    # --------------------------------------------------------
    # Validate pricing
    # --------------------------------------------------------

    new_purchase_price = update_data.get(
        "purchase_price",
        existing_batch.get(
            "purchase_price"
        ),
    )

    new_mrp = update_data.get(
        "mrp",
        existing_batch.get(
            "mrp"
        ),
    )

    if (
        new_mrp is not None
        and new_purchase_price is not None
        and new_mrp < new_purchase_price
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="MRP cannot be lower than purchase price.",
        )

    # --------------------------------------------------------
    # Update timestamp
    # --------------------------------------------------------

    update_data["updated_at"] = datetime.now(
        timezone.utc
    )

    # --------------------------------------------------------
    # Update batch
    # --------------------------------------------------------

    result = await db.batches.update_one(
        {
            "_id": ObjectId(
                batch_id
            ),
            "pharmacy_id": pharmacy_id,
            "is_archived": False,
        },
        {
            "$set": update_data
        },
    )

    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Batch not found.",
        )

    logger.info(
        f"Batch updated successfully: {batch_id}"
    )

    return {
        "message": "Batch updated successfully."
    }


# ============================================================
# ARCHIVE BATCH
# ============================================================

async def archive_batch(
    batch_id: str,
    pharmacy_id: str,
):
    """
    Archive a batch belonging to the logged-in pharmacy.

    Archived batches remain in MongoDB but are hidden
    from active inventory.
    """

    db = get_database()

    # --------------------------------------------------------
    # Validate batch_id
    # --------------------------------------------------------

    if not ObjectId.is_valid(
        batch_id
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid batch ID.",
        )

    # --------------------------------------------------------
    # Find active batch
    # --------------------------------------------------------

    batch = await db.batches.find_one(
        {
            "_id": ObjectId(
                batch_id
            ),
            "pharmacy_id": pharmacy_id,
            "is_archived": False,
        }
    )

    if not batch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Batch not found.",
        )

    # --------------------------------------------------------
    # Archive batch
    # --------------------------------------------------------

    await db.batches.update_one(
        {
            "_id": ObjectId(
                batch_id
            ),
            "pharmacy_id": pharmacy_id,
        },
        {
            "$set": {
                "is_archived": True,
                "updated_at": datetime.now(
                    timezone.utc
                ),
            }
        },
    )

    logger.info(
        f"Batch archived successfully: {batch_id}"
    )

    return {
        "message": "Batch archived successfully."
    }


# ============================================================
# RESTORE BATCH
# ============================================================

async def restore_batch(
    batch_id: str,
    pharmacy_id: str,
):
    """
    Restore an archived batch belonging
    to the logged-in pharmacy.
    """

    db = get_database()

    # --------------------------------------------------------
    # Validate batch_id
    # --------------------------------------------------------

    if not ObjectId.is_valid(
        batch_id
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid batch ID.",
        )

    # --------------------------------------------------------
    # Find archived batch
    # --------------------------------------------------------

    batch = await db.batches.find_one(
        {
            "_id": ObjectId(
                batch_id
            ),
            "pharmacy_id": pharmacy_id,
            "is_archived": True,
        }
    )

    if not batch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Archived batch not found.",
        )

    # --------------------------------------------------------
    # Restore batch
    # --------------------------------------------------------

    await db.batches.update_one(
        {
            "_id": ObjectId(
                batch_id
            ),
            "pharmacy_id": pharmacy_id,
        },
        {
            "$set": {
                "is_archived": False,
                "updated_at": datetime.now(
                    timezone.utc
                ),
            }
        },
    )

    logger.info(
        f"Batch restored successfully: {batch_id}"
    )

    return {
        "message": "Batch restored successfully."
    }


# ============================================================
# SEARCH BATCHES
# ============================================================

async def search_batches(
    query: str,
    pharmacy_id: str,
):
    """
    Search active medicine batches
    belonging to the logged-in pharmacy.
    """

    db = get_database()

    # --------------------------------------------------------
    # Validate query
    # --------------------------------------------------------

    query = query.strip()

    if not query:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Search query cannot be empty.",
        )

    # --------------------------------------------------------
    # Search pipeline
    # --------------------------------------------------------

    pipeline = [
        {
            "$match": {
                "pharmacy_id": pharmacy_id,
                "is_archived": False,
            }
        },
        {
            "$lookup": {
                "from": "medicines",
                "let": {
                    "medicineId": {
                        "$toObjectId": "$medicine_id"
                    }
                },
                "pipeline": [
                    {
                        "$match": {
                            "$expr": {
                                "$eq": [
                                    "$_id",
                                    "$$medicineId",
                                ]
                            }
                        }
                    }
                ],
                "as": "medicine",
            }
        },
        {
            "$unwind": "$medicine"
        },
        {
            "$match": {
                "$or": [
                    {
                        "batch_number": {
                            "$regex": query,
                            "$options": "i",
                        }
                    },
                    {
                        "supplier_name": {
                            "$regex": query,
                            "$options": "i",
                        }
                    },
                    {
                        "invoice_number": {
                            "$regex": query,
                            "$options": "i",
                        }
                    },
                    {
                        "medicine.generic_name": {
                            "$regex": query,
                            "$options": "i",
                        }
                    },
                    {
                        "medicine.jan_aushadhi_name": {
                            "$regex": query,
                            "$options": "i",
                        }
                    },
                ]
            }
        },
        {
            "$sort": {
                "expiry_date": 1,
                "manufacturing_date": 1,
                "batch_number": 1,
            }
        },
    ]

    batches = await db.batches.aggregate(
        pipeline
    ).to_list(
        length=None
    )

    results = []

    for batch in batches:
        results.append(
            {
                "id": str(
                    batch["_id"]
                ),
                "medicine_id": batch[
                    "medicine_id"
                ],
                "pharmacy_id": batch[
                    "pharmacy_id"
                ],
                "generic_name": batch[
                    "medicine"
                ][
                    "generic_name"
                ],
                "jan_aushadhi_name": batch[
                    "medicine"
                ][
                    "jan_aushadhi_name"
                ],
                "strength": batch[
                    "medicine"
                ][
                    "strength"
                ],
                "batch_number": batch[
                    "batch_number"
                ],
                "manufacturing_date": batch[
                    "manufacturing_date"
                ],
                "expiry_date": batch[
                    "expiry_date"
                ],
                "quantity_received": batch[
                    "quantity_received"
                ],
                "available_quantity": batch[
                    "available_quantity"
                ],
                "purchase_price": batch[
                    "purchase_price"
                ],
                "mrp": batch[
                    "mrp"
                ],
                "supplier_name": batch[
                    "supplier_name"
                ],
                "invoice_number": batch[
                    "invoice_number"
                ],
                "is_archived": batch[
                    "is_archived"
                ],
            }
        )

    logger.info(
        f"Batch search completed: {query}"
    )

    return results


# ============================================================
# GET AVAILABLE BATCHES
# ============================================================

async def get_available_batches(
    medicine_id: str,
    pharmacy_id: str | None = None,
    session=None,
):
    """
    Retrieve all available batches for a medicine
    following FEFO order.

    FEFO = First Expiry, First Out.

    session is supported for MongoDB transactions.
    """

    db = get_database()

    # --------------------------------------------------------
    # Validate medicine_id
    # --------------------------------------------------------

    if not ObjectId.is_valid(
        medicine_id
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid medicine ID.",
        )

    # --------------------------------------------------------
    # Use naive UTC datetime for consistency
    # with stored batch expiry dates.
    # --------------------------------------------------------

    current_datetime = datetime.utcnow()

    filters = {
        "medicine_id": medicine_id,
        "is_archived": False,
        "available_quantity": {
            "$gt": 0,
        },
        "expiry_date": {
            "$gt": current_datetime,
        },
    }

    # --------------------------------------------------------
    # Pharmacy isolation
    # --------------------------------------------------------

    if pharmacy_id is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Pharmacy ID is required for stock operations.",
        )

    filters[
        "pharmacy_id"
    ] = pharmacy_id

    # --------------------------------------------------------
    # Retrieve batches using FEFO
    # --------------------------------------------------------

    batches = await db.batches.find(
        filters,
        session=session,
    ).sort(
        [
            (
                "expiry_date",
                1,
            ),
            (
                "manufacturing_date",
                1,
            ),
            (
                "batch_number",
                1,
            ),
        ]
    ).to_list(
        length=None
    )

    logger.info(
        f"Retrieved available batches for medicine: {medicine_id}, "
        f"pharmacy: {pharmacy_id}"
    )

    return batches


# ============================================================
# ALLOCATE STOCK
# ============================================================

async def allocate_stock(
    medicine_id: str,
    required_quantity: int,
    pharmacy_id: str | None = None,
    session=None,
):
    """
    Allocate stock using FEFO.

    This function ONLY calculates the allocation.
    It does not modify the database.

    session is supported so the batch reads can participate
    in a MongoDB transaction.
    """

    if required_quantity <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Required quantity must be greater than zero.",
        )

    if pharmacy_id is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Pharmacy ID is required for stock allocation.",
        )

    batches = await get_available_batches(
        medicine_id=medicine_id,
        pharmacy_id=pharmacy_id,
        session=session,
    )

    remaining_quantity = required_quantity

    allocations = []

    # --------------------------------------------------------
    # FEFO allocation
    # --------------------------------------------------------

    for batch in batches:

        if remaining_quantity == 0:
            break

        available = batch[
            "available_quantity"
        ]

        allocated_quantity = min(
            available,
            remaining_quantity,
        )

        allocations.append(
            {
                "batch_id": str(
                    batch["_id"]
                ),
                "batch_number": batch[
                    "batch_number"
                ],
                "allocated_quantity": (
                    allocated_quantity
                ),
            }
        )

        remaining_quantity -= (
            allocated_quantity
        )

    # --------------------------------------------------------
    # Not enough stock
    # --------------------------------------------------------

    if remaining_quantity > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Insufficient stock available.",
        )

    logger.info(
        f"Stock allocated successfully for medicine: "
        f"{medicine_id}, quantity: {required_quantity}"
    )

    return allocations


# ============================================================
# DEDUCT ALLOCATED STOCK
# ============================================================

async def deduct_allocated_stock(
    allocations: list,
    pharmacy_id: str,
    session=None,
):
    """
    Deduct stock from allocated batches.

    IMPORTANT:
    - Pharmacy isolation is enforced.
    - available_quantity can never become negative.
    - session allows the caller to run this inside
      a MongoDB transaction.
    """

    db = get_database()

    # --------------------------------------------------------
    # Validate pharmacy
    # --------------------------------------------------------

    if not pharmacy_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Pharmacy ID is required for stock deduction.",
        )

    if not allocations:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No stock allocations provided.",
        )

    # --------------------------------------------------------
    # Deduct each allocated batch
    # --------------------------------------------------------

    for allocation in allocations:

        batch_id = allocation.get(
            "batch_id"
        )

        batch_number = allocation.get(
            "batch_number",
            "Unknown",
        )

        allocated_quantity = allocation.get(
            "allocated_quantity"
        )

        # ----------------------------------------------------
        # Validate batch ID
        # ----------------------------------------------------

        if not batch_id or not ObjectId.is_valid(
            batch_id
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"Invalid batch ID for batch "
                    f"{batch_number}."
                ),
            )

        # ----------------------------------------------------
        # Validate quantity
        # ----------------------------------------------------

        if (
            not isinstance(
                allocated_quantity,
                int,
            )
            or allocated_quantity <= 0
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"Invalid allocated quantity "
                    f"for batch {batch_number}."
                ),
            )

        # ----------------------------------------------------
        # Pharmacy-safe atomic deduction
        # ----------------------------------------------------

        result = await db.batches.update_one(
            {
                "_id": ObjectId(
                    batch_id
                ),
                "pharmacy_id": pharmacy_id,
                "is_archived": False,
                "available_quantity": {
                    "$gte": allocated_quantity,
                },
            },
            {
                "$inc": {
                    "available_quantity": (
                        -allocated_quantity
                    ),
                },
                "$set": {
                    "updated_at": datetime.now(
                        timezone.utc
                    ),
                },
            },
            session=session,
        )

        # ----------------------------------------------------
        # Prevent negative stock / invalid batch access
        # ----------------------------------------------------

        if result.modified_count == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"Unable to deduct stock from batch "
                    f"{batch_number}. "
                    f"The batch may not belong to this pharmacy, "
                    f"may be archived, or may not have enough stock."
                ),
            )

    logger.info(
        f"Allocated stock deducted successfully "
        f"for pharmacy: {pharmacy_id}"
    )


# ============================================================
# PROCESS STOCK DEDUCTION
# ============================================================

async def process_stock_deduction(
    medicine_id: str,
    required_quantity: int,
    pharmacy_id: str | None = None,
    session=None,
):
    """
    Complete FEFO stock deduction workflow.

    Steps:
        1. Validate pharmacy.
        2. Find available batches.
        3. Allocate stock using FEFO.
        4. Deduct allocated stock.
        5. Return allocation summary.

    session can be supplied by Billing so the complete
    operation runs inside one MongoDB transaction.
    """

    if pharmacy_id is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Pharmacy ID is required for stock deduction.",
        )

    # --------------------------------------------------------
    # Allocate stock
    # --------------------------------------------------------

    allocations = await allocate_stock(
        medicine_id=medicine_id,
        required_quantity=required_quantity,
        pharmacy_id=pharmacy_id,
        session=session,
    )

    # --------------------------------------------------------
    # Deduct stock
    # --------------------------------------------------------

    await deduct_allocated_stock(
        allocations=allocations,
        pharmacy_id=pharmacy_id,
        session=session,
    )

    logger.info(
        f"Stock deducted successfully for medicine: "
        f"{medicine_id}, pharmacy: {pharmacy_id}"
    )

    return {
        "medicine_id": medicine_id,
        "requested_quantity": required_quantity,
        "allocated_quantity": required_quantity,
        "allocations": allocations,
    }