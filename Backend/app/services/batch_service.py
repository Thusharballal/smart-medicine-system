from app.database.connection import get_database
from datetime import datetime, timezone
from bson import ObjectId
from app.models.batch_model import BatchModel
from app.schemas.batch_schema import (
    BatchCreateRequest,
    BatchUpdateRequest,
)
from app.utils.logger import logger
from fastapi import HTTPException, status
async def add_batch(
    batch_data: BatchCreateRequest
):
    """ Add a new medicine batch. """
    db = get_database()
    # Check whether the medicine exists
    medicine = await db.medicines.find_one(
    {
        "_id": ObjectId(batch_data.medicine_id),
        "is_archived": False
    }
)
    if not medicine:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medicine not found."
        )
    # Check duplicate batch number
    existing_batch = await db.batches.find_one(
    {
        "medicine_id": batch_data.medicine_id,
        "batch_number": batch_data.batch_number,
        "is_archived": False
    }
)
    if existing_batch:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Batch number already exists."
        )
    batch = BatchModel(
    **batch_data.model_dump(),
    available_quantity=batch_data.quantity_received
)
    result = await db.batches.insert_one(
        batch.model_dump()
    )
    logger.info(
        f"Batch added successfully: {batch.batch_number}"
    )
    return {
        "message": "Batch added successfully.",
        "batch_id": str(result.inserted_id)
    }
async def get_all_batches():
    """
    Retrieve all active medicine batches
    along with medicine details.
    """
    db = get_database()
    pipeline = [
        {
            "$match": {
                "is_archived": False
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
                                    "$$medicineId"
                                ]
                            }
                        }
                    }
                ],
                "as": "medicine"
            }
        },
        {
            "$unwind": "$medicine"
        }
    ]
    batches = await db.batches.aggregate(
        pipeline
    ).to_list(length=None)
    results = []
    for batch in batches:
        batch["id"] = str(batch["_id"])
        batch["generic_name"] = batch["medicine"]["generic_name"]
        batch["jan_aushadhi_name"] = batch["medicine"]["jan_aushadhi_name"]
        batch["strength"] = batch["medicine"]["strength"]
        del batch["_id"]
        del batch["medicine"]
        results.append(batch)
    logger.info(
        "Retrieved all batches successfully."
    )
    return results
async def get_batch_by_id(
    batch_id: str
):
    """
    Retrieve a single batch
    along with medicine details.
    """
    db = get_database()
    batch = await db.batches.aggregate(
        [
            {
                "$match": {
                    "_id": ObjectId(batch_id),
                    "is_archived": False
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
                                        "$$medicineId"
                                    ]
                                }
                            }
                        }
                    ],
                    "as": "medicine"
                }
            },
            {
                "$unwind": "$medicine"
            }
        ]
    ).to_list(length=1)
    if not batch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Batch not found."
        )
    batch = batch[0]
    batch["id"] = str(batch["_id"])
    batch["generic_name"] = batch["medicine"]["generic_name"]
    batch["jan_aushadhi_name"] = batch["medicine"]["jan_aushadhi_name"]
    batch["strength"] = batch["medicine"]["strength"]
    del batch["_id"]
    del batch["medicine"]
    logger.info(
        f"Retrieved batch: {batch_id}"
    )
    return batch
async def update_batch(
    batch_id: str,
    batch_data: BatchUpdateRequest
):
    """
    Update editable batch details.
    """
    db = get_database()
    existing_batch = await db.batches.find_one(
        {
            "_id": ObjectId(batch_id),
            "is_archived": False
        }
    )
    if not existing_batch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Batch not found."
        )
    update_data = batch_data.model_dump(
        exclude_unset=True
    )
    update_data["updated_at"] = datetime.now(
        timezone.utc
    )
    await db.batches.update_one(
        {
            "_id": ObjectId(batch_id)
        },
        {
            "$set": update_data
        }
    )
    logger.info(
        f"Batch updated successfully: {batch_id}"
    )
    return {
        "message": "Batch updated successfully."
    }
async def archive_batch(
    batch_id: str
):
    """
    Archive a batch.
    Archived batches remain in the database
    but are hidden from active inventory.
    """
    db = get_database()
    batch = await db.batches.find_one(
        {
            "_id": ObjectId(batch_id),
            "is_archived": False
        }
    )
    if not batch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Batch not found."
        )
    await db.batches.update_one(
        {
            "_id": ObjectId(batch_id)
        },
        {
            "$set": {
                "is_archived": True,
                "updated_at": datetime.now(
                    timezone.utc
                )
            }
        }
    )
    logger.info(
        f"Batch archived successfully: {batch_id}"
    )
    return {
        "message": "Batch archived successfully."
    }
async def restore_batch(
    batch_id: str
):
    """Restore an archived batch. """

    db = get_database()

    batch = await db.batches.find_one(
        {
            "_id": ObjectId(batch_id),
            "is_archived": True
        }
    )

    if not batch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Archived batch not found."
        )

    await db.batches.update_one(
        {
            "_id": ObjectId(batch_id)
        },
        {
            "$set": {
                "is_archived": False,
                "updated_at": datetime.now(
                    timezone.utc
                )
            }
        }
    )

    logger.info(
        f"Batch restored successfully: {batch_id}"
    )

    return {
        "message": "Batch restored successfully."
    }
async def search_batches(
    query: str
):
    """
    Search active medicine batches.
    """

    db = get_database()

    pipeline = [
        {
            "$match": {
                "is_archived": False
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
                                    "$$medicineId"
                                ]
                            }
                        }
                    }
                ],
                "as": "medicine"
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
                            "$options": "i"
                        }
                    },
                    {
                        "supplier_name": {
                            "$regex": query,
                            "$options": "i"
                        }
                    },
                    {
                        "invoice_number": {
                            "$regex": query,
                            "$options": "i"
                        }
                    },
                    {
                        "medicine.generic_name": {
                            "$regex": query,
                            "$options": "i"
                        }
                    },
                    {
                        "medicine.jan_aushadhi_name": {
                            "$regex": query,
                            "$options": "i"
                        }
                    }
                ]
            }
        },
        {
            "$sort": {
                "expiry_date": 1,
                "manufacturing_date": 1,
                "batch_number": 1
            }
        }
    ]
    batches = await db.batches.aggregate(
        pipeline
    ).to_list(length=None)
    results = []
    for batch in batches:
        batch["id"] = str(batch["_id"])
        batch["generic_name"] = batch["medicine"]["generic_name"]
        batch["jan_aushadhi_name"] = batch["medicine"]["jan_aushadhi_name"]
        batch["strength"] = batch["medicine"]["strength"]
        del batch["_id"]
        del batch["medicine"]
        results.append(batch)
    logger.info(
        f"Batch search completed: {query}"
    )
    return results
async def get_available_batches(
    medicine_id: str
):
    """
    Retrieve all available batches for a medicine
    following FEFO order. """

    db = get_database()

    batches = await db.batches.find(
        {
            "medicine_id": medicine_id,
            "is_archived": False,
            "available_quantity": {
                "$gt": 0
            }
        }
    ).sort(
        [
            ("expiry_date", 1),
            ("manufacturing_date", 1),
            ("batch_number", 1)
        ]
    ).to_list(length=None)

    logger.info(
        f"Retrieved available batches for medicine: {medicine_id}"
    )
    return batches
async def allocate_stock(
    medicine_id: str,
    required_quantity: int
):
    """
    Allocate stock using FEFO.
    This function only calculates allocation.
    It does not update the database.
    """
    batches = await get_available_batches(
        medicine_id
    )
    remaining_quantity = required_quantity
    allocations = []
    for batch in batches:
        if remaining_quantity == 0:
            break
        available = batch["available_quantity"]
        allocated_quantity = min(
            available,
            remaining_quantity
        )
        allocations.append(
            {
                "batch_id": str(batch["_id"]),
                "batch_number": batch["batch_number"],
                "allocated_quantity": allocated_quantity
            }
        )
        remaining_quantity -= allocated_quantity
    if remaining_quantity > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Insufficient stock available."
        )
    logger.info(
        f"Stock allocated successfully for medicine: {medicine_id}"
    )
    return allocations
async def deduct_allocated_stock(
    allocations: list
):
    """Deduct stock from allocated batches."""
    db = get_database()
    for allocation in allocations:
        await db.batches.update_one(
            {
                "_id": ObjectId(
                    allocation["batch_id"]
                )
            },
            {
                "$inc": {
                    "available_quantity":
                    -allocation["allocated_quantity"]
                },
                "$set": {
                    "updated_at":
                    datetime.now(
                        timezone.utc
                    )
                }
            }
        )
    logger.info(
        "Allocated stock deducted successfully."
    )
async def process_stock_deduction(
    medicine_id: str,
    required_quantity: int
):
    """
    Complete FEFO stock deduction workflow.

    Steps:
    1. Allocate stock.
    2. Deduct stock.
    3. Return allocation summary.
    """

    allocations = await allocate_stock(
        medicine_id,
        required_quantity
    )

    await deduct_allocated_stock(
        allocations
    )

    logger.info(
        f"Stock deducted successfully for medicine: {medicine_id}"
    )

    return {
        "medicine_id": medicine_id,
        "requested_quantity": required_quantity,
        "allocated_quantity": required_quantity,
        "allocations": allocations
    }