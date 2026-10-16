from datetime import datetime, timezone
from math import radians, sin, cos, sqrt, atan2
from bson import ObjectId
from fastapi import HTTPException, status
from app.database.connection import get_database
from app.models.pharmacy_model import PharmacyModel
from app.schemas.pharmacy_schema import (
    PharmacyCreateRequest,
    PharmacyUpdateRequest,
)
from app.utils.constants import PharmacyStatus
from app.utils.logger import logger
from app.utils.mongo_helper import serialize_mongo
from app.utils.password import hash_password
# ============================================================
# Helper: Calculate Distance
# ============================================================
def calculate_distance_km(
    latitude1: float,
    longitude1: float,
    latitude2: float,
    longitude2: float,
) -> float:
    """
    Calculate distance between two geographic coordinates
    using the Haversine formula.
    Returns distance in kilometers.
    """
    earth_radius_km = 6371.0
    lat1 = radians(latitude1)
    lon1 = radians(longitude1)
    lat2 = radians(latitude2)
    lon2 = radians(longitude2)
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = (
        sin(dlat / 2) ** 2
        + cos(lat1)
        * cos(lat2)
        * sin(dlon / 2) ** 2
    )
    c = 2 * atan2(
        sqrt(a),
        sqrt(1 - a),
    )
    return earth_radius_km * c
# ============================================================
# Helper: Get Pharmacy ObjectId
# ============================================================
def get_pharmacy_object_id(
    current_pharmacy: dict,
) -> ObjectId:
    """
    Get MongoDB ObjectId from authenticated pharmacy.
    """
    pharmacy_id = current_pharmacy.get("id")
    # Backward compatibility
    if pharmacy_id is None:
        pharmacy_id = current_pharmacy.get("_id")
    if pharmacy_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authenticated pharmacy ID is missing.",
        )
    if isinstance(pharmacy_id, ObjectId):
        return pharmacy_id
    if not ObjectId.is_valid(str(pharmacy_id)):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid pharmacy ID.",
        )
    return ObjectId(str(pharmacy_id))
# ============================================================
# CREATE PHARMACY
# ============================================================
async def create_pharmacy(
    pharmacy_data: PharmacyCreateRequest,
):
    """
    Create a new pharmacy account.
    New pharmacies start with PENDING status.
    """
    db = get_database()
    if db is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database connection is not available.",
        )
    # ========================================================
    # Normalize Email
    # ========================================================
    email = str(
        pharmacy_data.email
    ).strip().lower()
    # ========================================================
    # Check Duplicate Pharmacy Email
    # ========================================================
    existing_pharmacy = await db.pharmacies.find_one(
        {
            "email": email,
        }
    )
    if existing_pharmacy:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Pharmacy email is already registered.",
        )
    # ========================================================
    # Check Email in Users Collection
    # ========================================================
    existing_user = await db.users.find_one(
        {
            "email": email,
        }
    )
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "This email is already registered as a user. "
                "Please use another email address."
            ),
        )
    # ========================================================
    # Check Duplicate Kendra Code
    # ========================================================
    existing_kendra = await db.pharmacies.find_one(
        {
            "kendra_code": pharmacy_data.kendra_code,
        }
    )
    if existing_kendra:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Kendra Code is already registered.",
        )
    # ========================================================
    # Hash Password
    # ========================================================
    hashed_password = hash_password(
        pharmacy_data.password
    )
    # ========================================================
    # Create Pharmacy Model
    # ========================================================
    new_pharmacy = PharmacyModel(
        owner_name=pharmacy_data.owner_name.strip(),
        pharmacy_name=pharmacy_data.pharmacy_name.strip(),
        email=email,
        phone_number=(
            pharmacy_data.phone_number.strip()
        ),
        hashed_password=hashed_password,
        drug_license_number=(
            pharmacy_data.drug_license_number.strip()
        ),
        kendra_code=(
            pharmacy_data.kendra_code.strip()
        ),
        gst_number=(
            pharmacy_data.gst_number.strip()
        ),
        address=pharmacy_data.address.strip(),
        city=pharmacy_data.city.strip(),
        state=pharmacy_data.state.strip(),
        pin_code=pharmacy_data.pin_code.strip(),
        latitude=pharmacy_data.latitude,
        longitude=pharmacy_data.longitude,
        status=PharmacyStatus.PENDING,
        is_email_verified=False,
        approved_by=None,
        approved_at=None,
        last_login=None,
    )

    # ========================================================
    # Save Pharmacy
    # ========================================================

    result = await db.pharmacies.insert_one(
        new_pharmacy.model_dump()
    )

    logger.info(
        f"New pharmacy registered: "
        f"{pharmacy_data.pharmacy_name} "
        f"({email})"
    )

    return {
        "message": (
            "Pharmacy registered successfully. "
            "Waiting for admin approval."
        ),
        "pharmacy_id": str(
            result.inserted_id
        ),
    }


# ============================================================
# GET CURRENT PHARMACY PROFILE
# ============================================================

async def get_pharmacy_profile(
    current_pharmacy: dict,
):
    """
    Return currently authenticated pharmacy profile.
    """

    return serialize_mongo(
        current_pharmacy
    )


# ============================================================
# UPDATE CURRENT PHARMACY PROFILE
# ============================================================

async def update_pharmacy_profile(
    current_pharmacy: dict,
    pharmacy_data: PharmacyUpdateRequest,
):
    """
    Update editable fields of the currently
    authenticated pharmacy.
    """

    db = get_database()

    # ========================================================
    # Get Pharmacy ID
    # ========================================================

    pharmacy_id = get_pharmacy_object_id(
        current_pharmacy
    )

    # ========================================================
    # Get Update Data
    # ========================================================

    update_data = pharmacy_data.model_dump(
        exclude_unset=True,
        exclude_none=True,
    )

    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No profile data provided for update.",
        )

    # ========================================================
    # Protected Fields
    # ========================================================

    protected_fields = {
        "email",
        "hashed_password",
        "status",
        "approved_by",
        "approved_at",
        "is_email_verified",
        "last_login",
        "owner_name",
        "drug_license_number",
        "kendra_code",
        "gst_number",
    }

    update_data = {
        key: value
        for key, value in update_data.items()
        if key not in protected_fields
    }

    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No editable profile fields provided.",
        )

    # ========================================================
    # Clean String Fields
    # ========================================================

    string_fields = {
        "pharmacy_name",
        "phone_number",
        "address",
        "city",
        "state",
        "pin_code",
    }

    for field in string_fields:
        if field in update_data:
            update_data[field] = (
                update_data[field].strip()
            )

    # ========================================================
    # Validate Latitude
    # ========================================================

    latitude = update_data.get("latitude")

    if latitude is not None:
        if latitude < -90 or latitude > 90:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Latitude must be between -90 and 90.",
            )

    # ========================================================
    # Validate Longitude
    # ========================================================

    longitude = update_data.get("longitude")

    if longitude is not None:
        if longitude < -180 or longitude > 180:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Longitude must be between -180 and 180.",
            )

    # ========================================================
    # Update Timestamp
    # ========================================================

    update_data["updated_at"] = datetime.now(
        timezone.utc
    )

    # ========================================================
    # Update Pharmacy
    # ========================================================

    result = await db.pharmacies.update_one(
        {
            "_id": pharmacy_id,
        },
        {
            "$set": update_data,
        },
    )

    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pharmacy not found.",
        )

    # ========================================================
    # Fetch Updated Pharmacy
    # ========================================================

    updated_pharmacy = await db.pharmacies.find_one(
        {
            "_id": pharmacy_id,
        }
    )

    if updated_pharmacy is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pharmacy not found.",
        )

    logger.info(
        f"Pharmacy profile updated: {pharmacy_id}"
    )

    return serialize_mongo(
        updated_pharmacy
    )


# ============================================================
# GET NEARBY PHARMACIES
# ============================================================

async def get_nearby_pharmacies(
    medicine_id: str,
    latitude: float,
    longitude: float,
):
    """
    Find approved pharmacies that currently have
    the requested medicine in stock.

    Distance is calculated from the user's supplied
    latitude and longitude to each pharmacy.
    """

    db = get_database()

    # ========================================================
    # Validate Coordinates
    # ========================================================

    if latitude < -90 or latitude > 90:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid latitude.",
        )

    if longitude < -180 or longitude > 180:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid longitude.",
        )

    # ========================================================
    # Validate Medicine ID
    # ========================================================

    if not ObjectId.is_valid(medicine_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid medicine ID.",
        )

    medicine_object_id = ObjectId(
        medicine_id
    )

    # ========================================================
    # Check Medicine
    # ========================================================

    medicine = await db.medicines.find_one(
        {
            "_id": medicine_object_id,
            "is_archived": False,
        }
    )

    if not medicine:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medicine not found.",
        )

    # ========================================================
    # Current Time
    # ========================================================

    now = datetime.now(
        timezone.utc
    )

    # ========================================================
    # Aggregation Pipeline
    # ========================================================

    pipeline = [

        # ----------------------------------------------------
        # STEP 1
        # Active batches with available stock
        # ----------------------------------------------------

        {
            "$match": {
                "is_archived": False,

                "available_quantity": {
                    "$gt": 0,
                },

                "expiry_date": {
                    "$gt": now,
                },

                "$or": [
                    {
                        "medicine_id": medicine_id,
                    },
                    {
                        "medicine_id": medicine_object_id,
                    },
                ],
            }
        },

        # ----------------------------------------------------
        # STEP 2
        # Convert pharmacy_id to ObjectId
        # ----------------------------------------------------

        {
            "$addFields": {
                "pharmacy_object_id": {
                    "$convert": {
                        "input": "$pharmacy_id",
                        "to": "objectId",
                        "onError": None,
                        "onNull": None,
                    }
                }
            }
        },

        # ----------------------------------------------------
        # STEP 3
        # Join pharmacies collection
        # ----------------------------------------------------

        {
            "$lookup": {
                "from": "pharmacies",

                "localField":
                    "pharmacy_object_id",

                "foreignField":
                    "_id",

                "as": "pharmacy",
            }
        },

        # ----------------------------------------------------
        # STEP 4
        # Remove missing pharmacies
        # ----------------------------------------------------

        {
            "$unwind": "$pharmacy"
        },

        # ----------------------------------------------------
        # STEP 5
        # Approved pharmacies with coordinates
        # ----------------------------------------------------

        {
            "$match": {
                "pharmacy.status": "APPROVED",

                "pharmacy.latitude": {
                    "$ne": None,
                },

                "pharmacy.longitude": {
                    "$ne": None,
                },
            }
        },

        # ----------------------------------------------------
        # STEP 6
        # Group batches by pharmacy
        # ----------------------------------------------------

        {
            "$group": {

                "_id":
                    "$pharmacy._id",

                "pharmacy_name": {
                    "$first":
                        "$pharmacy.pharmacy_name",
                },

                "address": {
                    "$first":
                        "$pharmacy.address",
                },

                "city": {
                    "$first":
                        "$pharmacy.city",
                },

                "state": {
                    "$first":
                        "$pharmacy.state",
                },

                "pin_code": {
                    "$first":
                        "$pharmacy.pin_code",
                },

                "latitude": {
                    "$first":
                        "$pharmacy.latitude",
                },

                "longitude": {
                    "$first":
                        "$pharmacy.longitude",
                },

                "available_quantity": {
                    "$sum":
                        "$available_quantity",
                },

                "mrp": {
                    "$min":
                        "$mrp",
                },
            }
        },
    ]

    # ========================================================
    # Execute Query
    # ========================================================

    pharmacies = await db[
        "medicine_batches"
    ].aggregate(
        pipeline
    ).to_list(
        length=None
    )

    # ========================================================
    # Build Response
    # ========================================================

    results = []

    for pharmacy in pharmacies:

        pharmacy_latitude = pharmacy.get(
            "latitude"
        )

        pharmacy_longitude = pharmacy.get(
            "longitude"
        )

        if (
            pharmacy_latitude is None
            or pharmacy_longitude is None
        ):
            continue

        # ====================================================
        # Calculate Distance
        # ====================================================

        distance = calculate_distance_km(
            latitude,
            longitude,
            float(pharmacy_latitude),
            float(pharmacy_longitude),
        )

        # ====================================================
        # Available Quantity
        # ====================================================

        available_quantity = int(
            pharmacy.get(
                "available_quantity",
                0,
            )
        )

        if available_quantity <= 0:
            continue

        # ====================================================
        # Stock Status
        # ====================================================

        if available_quantity <= 5:
            stock_status = "Low Stock"
        else:
            stock_status = "In Stock"

        # ====================================================
        # MRP
        # ====================================================

        mrp = pharmacy.get(
            "mrp",
            0,
        )

        if mrp is None:
            mrp = 0

        # ====================================================
        # Add Pharmacy
        # ====================================================

        results.append(
            {
                "pharmacy_id":
                    str(pharmacy["_id"]),

                "pharmacy_name":
                    pharmacy.get(
                        "pharmacy_name",
                        "",
                    ),

                "address":
                    pharmacy.get(
                        "address",
                        "",
                    ),

                "city":
                    pharmacy.get(
                        "city",
                        "",
                    ),

                "state":
                    pharmacy.get(
                        "state",
                        "",
                    ),

                "pin_code":
                    pharmacy.get(
                        "pin_code",
                        "",
                    ),

                "latitude":
                    float(
                        pharmacy_latitude
                    ),

                "longitude":
                    float(
                        pharmacy_longitude
                    ),

                # IMPORTANT
                # Distance from user location
                # to this pharmacy
                "distance_km":
                    round(
                        distance,
                        2,
                    ),

                "available_quantity":
                    available_quantity,

                "mrp":
                    float(mrp),

                "stock_status":
                    stock_status,
            }
        )

    # ========================================================
    # Sort Nearest First
    # ========================================================

    results.sort(
        key=lambda pharmacy:
            pharmacy["distance_km"]
    )
    logger.info(
        f"Nearby pharmacies found for medicine "
        f"{medicine_id}: {len(results)}"
    )
    return results