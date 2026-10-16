from datetime import datetime, timezone

from bson import ObjectId
from fastapi import HTTPException, status

from app.database.connection import get_database
from app.utils.constants import PharmacyStatus
from app.utils.mongo_helper import serialize_mongo
from app.utils.logger import logger


# ============================================================
# PHARMACY MANAGEMENT
# ============================================================

async def get_all_pharmacies():
    """
    Get all registered pharmacies for admin management.
    """

    db = get_database()

    pharmacies = await db.pharmacies.find().sort(
        "created_at", -1
    ).to_list(length=None)

    return [serialize_mongo(pharmacy) for pharmacy in pharmacies]


async def get_pharmacy_by_id(pharmacy_id: str):
    """
    Get a single pharmacy by its MongoDB ID.
    """

    db = get_database()

    if not ObjectId.is_valid(pharmacy_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid pharmacy ID."
        )

    pharmacy = await db.pharmacies.find_one(
        {"_id": ObjectId(pharmacy_id)}
    )

    if pharmacy is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pharmacy not found."
        )

    return serialize_mongo(pharmacy)


async def approve_pharmacy(
    pharmacy_id: str,
    admin_user_id: str
):
    """
    Approve a pending pharmacy.

    The approving admin ID and approval timestamp
    are stored in the pharmacy document.
    """

    db = get_database()

    if not ObjectId.is_valid(pharmacy_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid pharmacy ID."
        )

    pharmacy = await db.pharmacies.find_one(
        {"_id": ObjectId(pharmacy_id)}
    )

    if pharmacy is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pharmacy not found."
        )

    if pharmacy.get("status") == PharmacyStatus.APPROVED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Pharmacy is already approved."
        )

    now = datetime.now(timezone.utc)

    await db.pharmacies.update_one(
        {"_id": ObjectId(pharmacy_id)},
        {
            "$set": {
                "status": PharmacyStatus.APPROVED,
                "approved_by": admin_user_id,
                "approved_at": now,
            }
        }
    )

    logger.info(
        f"Pharmacy approved: {pharmacy.get('pharmacy_name')} "
        f"by admin {admin_user_id}"
    )

    updated_pharmacy = await db.pharmacies.find_one(
        {"_id": ObjectId(pharmacy_id)}
    )

    return serialize_mongo(updated_pharmacy)


async def reject_pharmacy(
    pharmacy_id: str
):
    """
    Reject a pharmacy registration.
    """

    db = get_database()

    if not ObjectId.is_valid(pharmacy_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid pharmacy ID."
        )

    pharmacy = await db.pharmacies.find_one(
        {"_id": ObjectId(pharmacy_id)}
    )

    if pharmacy is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pharmacy not found."
        )

    await db.pharmacies.update_one(
        {"_id": ObjectId(pharmacy_id)},
        {
            "$set": {
                "status": PharmacyStatus.REJECTED,
                "approved_by": None,
                "approved_at": None,
            }
        }
    )

    logger.info(
        f"Pharmacy rejected: {pharmacy.get('pharmacy_name')}"
    )

    updated_pharmacy = await db.pharmacies.find_one(
        {"_id": ObjectId(pharmacy_id)}
    )

    return serialize_mongo(updated_pharmacy)


async def suspend_pharmacy(
    pharmacy_id: str
):
    """
    Suspend an approved pharmacy.
    """

    db = get_database()

    if not ObjectId.is_valid(pharmacy_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid pharmacy ID."
        )

    pharmacy = await db.pharmacies.find_one(
        {"_id": ObjectId(pharmacy_id)}
    )

    if pharmacy is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pharmacy not found."
        )

    await db.pharmacies.update_one(
        {"_id": ObjectId(pharmacy_id)},
        {
            "$set": {
                "status": PharmacyStatus.SUSPENDED
            }
        }
    )

    logger.info(
        f"Pharmacy suspended: {pharmacy.get('pharmacy_name')}"
    )

    updated_pharmacy = await db.pharmacies.find_one(
        {"_id": ObjectId(pharmacy_id)}
    )

    return serialize_mongo(updated_pharmacy)


async def activate_pharmacy(
    pharmacy_id: str
):
    """
    Reactivate a suspended or rejected pharmacy.
    """

    db = get_database()

    if not ObjectId.is_valid(pharmacy_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid pharmacy ID."
        )

    pharmacy = await db.pharmacies.find_one(
        {"_id": ObjectId(pharmacy_id)}
    )

    if pharmacy is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pharmacy not found."
        )

    await db.pharmacies.update_one(
        {"_id": ObjectId(pharmacy_id)},
        {
            "$set": {
                "status": PharmacyStatus.APPROVED,
                "approved_at": datetime.now(timezone.utc),
            }
        }
    )

    logger.info(
        f"Pharmacy activated: {pharmacy.get('pharmacy_name')}"
    )

    updated_pharmacy = await db.pharmacies.find_one(
        {"_id": ObjectId(pharmacy_id)}
    )

    return serialize_mongo(updated_pharmacy)


# ============================================================
# USER MANAGEMENT
# ============================================================

async def get_all_users():
    """
    Get all registered users for admin management.
    """

    db = get_database()

    users = await db.users.find().sort(
        "created_at", -1
    ).to_list(length=None)

    return [serialize_mongo(user) for user in users]


async def get_user_by_id(user_id: str):
    """
    Get a single user by MongoDB ID.
    """

    db = get_database()

    if not ObjectId.is_valid(user_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID."
        )

    user = await db.users.find_one(
        {"_id": ObjectId(user_id)}
    )

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found."
        )

    return serialize_mongo(user)