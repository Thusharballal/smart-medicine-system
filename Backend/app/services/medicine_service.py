from app.database.connection import get_database
from datetime import datetime, timezone
from app.models.medicine_model import MedicineModel
from app.schemas.medicine_schema import (
    MedicineCreateRequest,
    MedicineUpdateRequest,
)
from app.utils.logger import logger
from fastapi import HTTPException, status
from bson import ObjectId
async def add_medicine(
    medicine_data: MedicineCreateRequest
):
    """Add a new medicine to the database."""
    db = get_database()
# Check whether the medicine already exists.
# A medicine is considered duplicate only if
# Generic Name + Strength + Manufacturer are the same.
    existing_medicine = await db.medicines.find_one(
        {
            "generic_name": medicine_data.generic_name,
            "strength": medicine_data.strength,
            "manufacturer": medicine_data.manufacturer
        }
    )
    if existing_medicine:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Medicine already exists."
        )
    # Create MedicineModel object
    medicine = MedicineModel(
        **medicine_data.model_dump()
    )
    # Save medicine in MongoDB
    result = await db.medicines.insert_one(
        medicine.model_dump()
    )
    logger.info(
        f"Medicine added successfully: {medicine.generic_name}"
    )
    return {
        "message": "Medicine added successfully.",
        "medicine_id": str(result.inserted_id)
    }
async def get_all_medicines():
    """Retrieve all medicines from the database."""
    db = get_database()
    medicines = await db.medicines.find(
    {
        "is_archived": False
    }
).to_list(length=None)
    results = []
    for medicine in medicines:
        medicine["id"] = str(medicine["_id"])
        del medicine["_id"]
        results.append(medicine)

    logger.info("Retrieved all medicines successfully.")

    return results
async def get_medicine_by_id(
    medicine_id: str
):
    """Retrieve a medicine using its MongoDB ID."""
    db = get_database()
    medicine = await db.medicines.find_one(
        {
            "_id": ObjectId(medicine_id)
        }
    )
    if not medicine:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medicine not found."
        )

    medicine["id"] = str(medicine["_id"])
    del medicine["_id"]
    return medicine
async def update_medicine(
    medicine_id: str,
    medicine_data: MedicineUpdateRequest
):
    """Update editable medicine details."""
    db = get_database()
    existing_medicine = await db.medicines.find_one(
        {
            "_id": ObjectId(medicine_id)
        }
    )
    if not existing_medicine:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medicine not found."
        )
    update_data = medicine_data.model_dump(
        exclude_unset=True
    )
    # Prevent modification of master identity fields
    update_data.pop("generic_name", None)
    update_data.pop("strength", None)
    update_data.pop("jan_aushadhi_name", None)

    update_data["updated_at"] = datetime.now(
        timezone.utc
    )
    await db.medicines.update_one(
        {
            "_id": ObjectId(medicine_id)
        },
        {
            "$set": update_data
        }
    )
    logger.info(
        f"Medicine updated successfully: {medicine_id}"
    )
    return {
        "message": "Medicine updated successfully."
    }
async def archive_medicine(
    medicine_id: str
):
    """Archive a medicine.
    Archived medicines are hidden from active use
    but remain available for historical records."""
    db = get_database()
    medicine = await db.medicines.find_one(
        {
            "_id": ObjectId(medicine_id)
        }
    )
    if not medicine:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medicine not found."
        )
    await db.medicines.update_one(
        {
            "_id": ObjectId(medicine_id)
        },
        {
            "$set": {
                "is_archived": True,
                "updated_at": datetime.now(timezone.utc)
            }
        }
    )
    logger.info(
        f"Medicine archived successfully: {medicine_id}"
    )
    return {
        "message": "Medicine archived successfully."
    }
async def restore_medicine(
    medicine_id: str
):
    """
    Restore an archived medicine.
    """

    db = get_database()

    medicine = await db.medicines.find_one(
        {
            "_id": ObjectId(medicine_id)
        }
    )

    if not medicine:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medicine not found."
        )

    await db.medicines.update_one(
        {
            "_id": ObjectId(medicine_id)
        },
        {
            "$set": {
                "is_archived": False,
                "updated_at": datetime.now(timezone.utc)
            }
        }
    )

    logger.info(
        f"Medicine restored successfully: {medicine_id}"
    )

    return {
        "message": "Medicine restored successfully."
    }
async def search_medicines(
    query: str
):
    """
    Search medicines by generic name, Jan Aushadhi name,
    brand names, composition or manufacturer.
    """
    db = get_database()
    medicines = await db.medicines.find(
        {
            "is_archived": False,
            "$or": [
                {
                    "generic_name": {
                        "$regex": query,
                        "$options": "i"
                    }
                },
                {
                    "jan_aushadhi_name": {
                        "$regex": query,
                        "$options": "i"
                    }
                },
                {
                    "brand_names": {
                        "$regex": query,
                        "$options": "i"
                    }
                },
                {
                    "composition": {
                        "$regex": query,
                        "$options": "i"
                    }
                },
                {
                    "manufacturer": {
                        "$regex": query,
                        "$options": "i"
                    }
                }
            ]
        }
    ).to_list(length=None)

    results = []
    for medicine in medicines:
        medicine["id"] = str(medicine["_id"])
        del medicine["_id"]
        results.append(medicine)
    logger.info(
        f"Medicine search completed: {query}"
    )
    return results