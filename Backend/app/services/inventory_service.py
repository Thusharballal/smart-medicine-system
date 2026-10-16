from datetime import datetime, timedelta,timezone
from zoneinfo import ZoneInfo
from bson import ObjectId
from fastapi import HTTPException, status
from app.database.connection import get_database
from app.utils.logger import logger
# ============================================================
# HELPER FUNCTIONS
# ============================================================
def utc_now() -> datetime:
    """
    Return current UTC time as a timezone-naive datetime.
    Batch dates in this project are stored as naive UTC datetimes,
    so all inventory date comparisons use the same format.
    """
    return datetime.utcnow()
def normalize_datetime(value: datetime | None) -> datetime | None:
    """
    Normalize a datetime returned from MongoDB.
    MongoDB dates may sometimes be returned as naive or timezone-aware
    values depending on how they were inserted/read.
    Internally, this service works with naive UTC datetimes.
    """
    if value is None:
        return None
    if value.tzinfo is not None:
        return value.astimezone().replace(tzinfo=None)
    return value
# ============================================================
# INVENTORY DASHBOARD
# ============================================================
async def get_inventory_dashboard(pharmacy_id: str):
    """
    Retrieve inventory dashboard statistics
    for the logged-in pharmacy.
    """
    db = get_database()
    # ========================================================
    # TOTAL MEDICINES
    # ========================================================
    # Medicines are global master records.
    # Pharmacy ownership is determined by active batches.
    medicine_count_pipeline = [
        {
            "$match": {
                "pharmacy_id": pharmacy_id,
                "is_archived": False,
                "medicine_id": {
                    "$exists": True,
                    "$ne": None,
                },
            }
        },
        {
            "$group": {
                "_id": "$medicine_id",
            }
        },
        {
            "$count": "total_medicines",
        },
    ]
    medicine_count_result = await db.batches.aggregate(
        medicine_count_pipeline
    ).to_list(length=1)
    if medicine_count_result:
        total_medicines = medicine_count_result[0]["total_medicines"]
    else:
        total_medicines = 0
    # ========================================================
    # TOTAL BATCHES
    # ========================================================
    total_batches = await db.batches.count_documents(
        {
            "pharmacy_id": pharmacy_id,
            "is_archived": False,
        }
    )
    # ========================================================
    # TOTAL STOCK UNITS
    # ========================================================
    stock_pipeline = [
        {
            "$match": {
                "pharmacy_id": pharmacy_id,
                "is_archived": False,
            }
        },
        {
            "$group": {
                "_id": None,
                "total_stock": {
                    "$sum": {
                        "$ifNull": [
                            "$available_quantity",
                            0,
                        ]
                    }
                },
            }
        },
    ]
    stock_result = await db.batches.aggregate(
        stock_pipeline
    ).to_list(length=1)
    if stock_result:
        total_stock_units = stock_result[0]["total_stock"]
    else:
        total_stock_units = 0
    # ========================================================
    # TOTAL INVENTORY VALUE
    # ========================================================
    value_pipeline = [
        {
            "$match": {
                "pharmacy_id": pharmacy_id,
                "is_archived": False,
            }
        },
        {
            "$group": {
                "_id": None,
                "total_inventory_value": {
                    "$sum": {
                        "$multiply": [
                            {
                                "$ifNull": [
                                    "$available_quantity",
                                    0,
                                ]
                            },
                            {
                                "$ifNull": [
                                    "$purchase_price",
                                    0,
                                ]
                            },
                        ]
                    }
                },
            }
        },
    ]
    value_result = await db.batches.aggregate(
        value_pipeline
    ).to_list(length=1)
    if value_result:
        total_inventory_value = round(
            value_result[0]["total_inventory_value"],
            2,
        )
    else:
        total_inventory_value = 0.0
    # ========================================================
    # LOW STOCK
    # ========================================================
    low_stock_batches = await db.batches.count_documents(
        {
            "pharmacy_id": pharmacy_id,
            "is_archived": False,
            "available_quantity": {
                "$gt": 0,
                "$lte": 20,
            },
        }
    )
    # ========================================================
    # OUT OF STOCK
    # ========================================================
    out_of_stock_batches = await db.batches.count_documents(
        {
            "pharmacy_id": pharmacy_id,
            "is_archived": False,
            "available_quantity": 0,
        }
    )
    # ========================================================
    # NEAR EXPIRY
    # ========================================================
    today = utc_now()
    expiry_limit = today + timedelta(days=90)
    near_expiry_batches = await db.batches.count_documents(
        {
            "pharmacy_id": pharmacy_id,
            "is_archived": False,
            "expiry_date": {
                "$gte": today,
                "$lte": expiry_limit,
            },
        }
    )
    # ========================================================
    # INVENTORY HEALTH
    # ========================================================
    if total_batches == 0:
        inventory_health = 100.0

    else:
        # A batch is unhealthy if it is:
        #
        # 1. Low stock
        # OR
        # 2. Out of stock
        # OR
        # 3. Near expiry
        #
        # We use ONE MongoDB query with $or so the same batch
        # cannot be counted multiple times.

        unhealthy_pipeline = [
            {
                "$match": {
                    "pharmacy_id": pharmacy_id,
                    "is_archived": False,
                    "$or": [
                        {
                            "available_quantity": {
                                "$gt": 0,
                                "$lte": 20,
                            }
                        },
                        {
                            "available_quantity": 0,
                        },
                        {
                            "expiry_date": {
                                "$gte": today,
                                "$lte": expiry_limit,
                            }
                        },
                    ],
                }
            },
            {
                "$count": "unhealthy_batches",
            },
        ]
        unhealthy_result = await db.batches.aggregate(
            unhealthy_pipeline
        ).to_list(length=1)

        if unhealthy_result:
            unhealthy_batches = unhealthy_result[0][
                "unhealthy_batches"
            ]
        else:
            unhealthy_batches = 0
        healthy_batches = max(
            total_batches - unhealthy_batches,
            0,
        )
        inventory_health = round(
            (
                healthy_batches
                / total_batches
            ) * 100,
            2,
        )
    # ========================================================
    # AVERAGE STOCK PER BATCH
    # ========================================================
    if total_batches == 0:
        average_stock_per_batch = 0.0
    else:
        average_stock_per_batch = round(
            total_stock_units / total_batches,
            2,
        )
    # ========================================================
    # TODAY'S SALES
    # ========================================================
    # Use the Indian calendar day, converted to naive UTC
    # because this service stores dates as naive UTC.
    india_tz = ZoneInfo("Asia/Kolkata")
    now_india = datetime.now(india_tz)
    start_of_day = now_india.replace(
        hour=0,
        minute=0,
        second=0,
        microsecond=0
    )
    start_of_next_day = start_of_day + timedelta(days=1)
    start_utc = start_of_day.astimezone(
        timezone.utc
    ).replace(tzinfo=None)
    end_utc = start_of_next_day.astimezone(
        timezone.utc
    ).replace(tzinfo=None)
    sales_pipeline = [
        {
            "$match": {
                "pharmacy_id": pharmacy_id,
                "created_at": {
                    "$gte": start_utc,
                    "$lt": end_utc
                },
                "payment_status": "PAID",
                "$or": [
                    {"is_archived": False},
                    {"is_archived": {"$exists": False}}
                ]
            }
        },
        {
            "$group": {
                "_id": None,
                "today_sales": {
                    "$sum": {
                        "$ifNull": ["$total_amount", 0]
                    }
                }
            }
        }
    ]
    sales_result = await db.bills.aggregate(
        sales_pipeline
    ).to_list(length=1)
    today_sales = (
        round(float(sales_result[0]["today_sales"]), 2)
        if sales_result
        else 0.0
    )

    # ========================================================
    # LOGGING
    # ========================================================
    logger.info(
        "Inventory dashboard generated successfully "
        f"for pharmacy: {pharmacy_id}"
    )
    # ========================================================
    # RESPONSE
    # ========================================================

    return {
        "total_medicines": total_medicines,
        "total_batches": total_batches,
        "total_stock_units": total_stock_units,
        "low_stock_batches": low_stock_batches,
        "out_of_stock_batches": out_of_stock_batches,
        "near_expiry_batches": near_expiry_batches,
        "inventory_health": inventory_health,
        "today_sales": today_sales,
        "total_inventory_value": total_inventory_value,
        "average_stock_per_batch": average_stock_per_batch,
    }


# ============================================================
# LOW STOCK BATCHES
# ============================================================

async def get_low_stock_batches(pharmacy_id: str):
    """
    Retrieve all active low-stock batches
    for the logged-in pharmacy.
    """

    db = get_database()

    pipeline = [
        # ----------------------------------------------------
        # Filter pharmacy and low stock
        # ----------------------------------------------------

        {
            "$match": {
                "pharmacy_id": pharmacy_id,
                "is_archived": False,
                "available_quantity": {
                    "$gt": 0,
                    "$lte": 20,
                },
            }
        },

        # ----------------------------------------------------
        # Get medicine information
        # ----------------------------------------------------

        {
            "$lookup": {
                "from": "medicines",
                "let": {
                    "medicineId": {
                        "$toObjectId": "$medicine_id",
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
        # ----------------------------------------------------
        # Convert medicine array to object
        # ----------------------------------------------------
        {
            "$unwind": "$medicine",
        },
        # ----------------------------------------------------
        # Lowest stock first
        # ----------------------------------------------------
        {
            "$sort": {
                "available_quantity": 1,
            }
        },
    ]
    batches = await db.batches.aggregate(
        pipeline
    ).to_list(length=None)
    results = []
    for batch in batches:
        results.append(
            {
                "batch_id": str(batch["_id"]),
                "medicine_id": batch["medicine_id"],
                "generic_name": batch["medicine"].get(
                    "generic_name",
                    "",
                ),
                "jan_aushadhi_name": batch["medicine"].get(
                    "jan_aushadhi_name",
                    "",
                ),
                "strength": batch["medicine"].get(
                    "strength",
                    "",
                ),
                "batch_number": batch["batch_number"],
                "available_quantity": batch[
                    "available_quantity"
                ],
                "expiry_date": normalize_datetime(
                    batch.get("expiry_date")
                ),
            }
        )

    logger.info(
        "Low stock batches retrieved successfully "
        f"for pharmacy: {pharmacy_id}"
    )

    return results


# ============================================================
# NEAR EXPIRY BATCHES
# ============================================================

async def get_near_expiry_batches(pharmacy_id: str):
    """
    Retrieve all active batches expiring
    within the next 90 days.
    """

    db = get_database()

    # Use the same naive UTC format used by batch_service.
    today = utc_now()

    expiry_limit = today + timedelta(days=90)

    pipeline = [
        # ----------------------------------------------------
        # Filter pharmacy and expiry range
        # ----------------------------------------------------

        {
            "$match": {
                "pharmacy_id": pharmacy_id,
                "is_archived": False,
                "expiry_date": {
                    "$gte": today,
                    "$lte": expiry_limit,
                },
            }
        },

        # ----------------------------------------------------
        # Get medicine information
        # ----------------------------------------------------

        {
            "$lookup": {
                "from": "medicines",
                "let": {
                    "medicineId": {
                        "$toObjectId": "$medicine_id",
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
        # ----------------------------------------------------
        # Convert medicine array to object
        # ----------------------------------------------------
        {
            "$unwind": "$medicine",
        },
        # ----------------------------------------------------
        # Earliest expiry first
        # ----------------------------------------------------
        {
            "$sort": {
                "expiry_date": 1,
            }
        },
    ]
    batches = await db.batches.aggregate(
        pipeline
    ).to_list(length=None)
    results = []
    for batch in batches:
        expiry_date = normalize_datetime(
            batch.get("expiry_date")
        )
        if expiry_date is None:
            continue
        # ----------------------------------------------------
        # Calculate remaining days
        # ----------------------------------------------------
        days_remaining = (
            expiry_date - today
        ).days

        # Prevent negative values in case of a small timing
        # difference between MongoDB filtering and Python.
        days_remaining = max(
            days_remaining,
            0,
        )

        results.append(
            {
                "batch_id": str(batch["_id"]),
                "medicine_id": batch["medicine_id"],
                "generic_name": batch["medicine"].get(
                    "generic_name",
                    "",
                ),
                "jan_aushadhi_name": batch["medicine"].get(
                    "jan_aushadhi_name",
                    "",
                ),
                "strength": batch["medicine"].get(
                    "strength",
                    "",
                ),
                "batch_number": batch["batch_number"],
                "available_quantity": batch[
                    "available_quantity"
                ],
                "expiry_date": expiry_date,
                "days_remaining": days_remaining,
            }
        )
    logger.info(
        "Near expiry batches retrieved successfully "
        f"for pharmacy: {pharmacy_id}"
    )
    return results
# ============================================================
# OUT OF STOCK BATCHES
# ============================================================

async def get_out_of_stock_batches(pharmacy_id: str):
    """
    Retrieve all active out-of-stock batches
    for the logged-in pharmacy.
    """
    db = get_database()
    pipeline = [
        # ----------------------------------------------------
        # Filter pharmacy and zero stock
        # ----------------------------------------------------

        {
            "$match": {
                "pharmacy_id": pharmacy_id,
                "is_archived": False,
                "available_quantity": 0,
            }
        },

        # ----------------------------------------------------
        # Get medicine information
        # ----------------------------------------------------

        {
            "$lookup": {
                "from": "medicines",
                "let": {
                    "medicineId": {
                        "$toObjectId": "$medicine_id",
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
        # ----------------------------------------------------
        # Convert medicine array to object
        # ----------------------------------------------------
        {
            "$unwind": "$medicine",
        },
        # ----------------------------------------------------
        # Sort alphabetically
        # ----------------------------------------------------
        {
            "$sort": {
                "medicine.jan_aushadhi_name": 1,
            }
        },
    ]
    batches = await db.batches.aggregate(
        pipeline
    ).to_list(length=None)
    results = []
    for batch in batches:
        results.append(
            {
                "batch_id": str(batch["_id"]),
                "medicine_id": batch["medicine_id"],
                "generic_name": batch["medicine"].get(
                    "generic_name",
                    "",
                ),
                "jan_aushadhi_name": batch["medicine"].get(
                    "jan_aushadhi_name",
                    "",
                ),
                "strength": batch["medicine"].get(
                    "strength",
                    "",
                ),
                "batch_number": batch["batch_number"],
                "available_quantity": batch[
                    "available_quantity"
                ],
            }
        )

    logger.info(
        "Out of stock batches retrieved successfully "
        f"for pharmacy: {pharmacy_id}"
    )

    return results


# ============================================================
# RECENT INVENTORY ACTIVITIES
# ============================================================

async def get_recent_inventory_activities(
    pharmacy_id: str,
):
    """
    Retrieve recent inventory activities
    for the logged-in pharmacy.

    Activities are obtained from inventory_movements
    instead of directly assuming every new batch is
    a 'Batch Added' activity.

    Supported movement types:

        PURCHASE
        SALE
        RETURN
        ADJUSTMENT
    """

    db = get_database()

    # ========================================================
    # INVENTORY MOVEMENT PIPELINE
    # ========================================================

    pipeline = [
        # ----------------------------------------------------
        # Lookup the related batch.
        #
        # inventory_movements currently stores batch_id
        # as a string, while batches use ObjectId.
        # ----------------------------------------------------

        {
            "$lookup": {
                "from": "batches",
                "let": {
                    "batchId": "$batch_id",
                },
                "pipeline": [
                    {
                        "$match": {
                            "$expr": {
                                "$eq": [
                                    "$_id",
                                    {
                                        "$convert": {
                                            "input": "$$batchId",
                                            "to": "objectId",
                                            "onError": None,
                                            "onNull": None,
                                        }
                                    },
                                ]
                            }
                        }
                    }
                ],
                "as": "batch",
            }
        },
        # ----------------------------------------------------
        # Only movements whose batch still exists
        # ----------------------------------------------------
        {
            "$unwind": "$batch",
        },
        # ----------------------------------------------------
        # Only this pharmacy's movements
        # ----------------------------------------------------
        {
            "$match": {
                "batch.pharmacy_id": pharmacy_id,
                "batch.is_archived": False,
            }
        },
        # ----------------------------------------------------
        # Lookup medicine
        # ----------------------------------------------------
        {
            "$lookup": {
                "from": "medicines",
                "let": {
                    "medicineId": "$medicine_id",
                },
                "pipeline": [
                    {
                        "$match": {
                            "$expr": {
                                "$eq": [
                                    "$_id",
                                    {
                                        "$convert": {
                                            "input": "$$medicineId",
                                            "to": "objectId",
                                            "onError": None,
                                            "onNull": None,
                                        }
                                    },
                                ]
                            }
                        }
                    }
                ],
                "as": "medicine",
            }
        },
        # ----------------------------------------------------
        # Convert medicine array to object
        # ----------------------------------------------------
        {
            "$unwind": "$medicine",
        },
        # ----------------------------------------------------
        # Latest activity first
        # ----------------------------------------------------
        {
            "$sort": {
                "created_at": -1,
            }
        },
        # ----------------------------------------------------
        # Dashboard currently displays 10 activities
        # ----------------------------------------------------
        {
            "$limit": 10,
        },
    ]
    movements = await db.inventory_movements.aggregate(
        pipeline
    ).to_list(length=10)
    activities = []
    # ========================================================
    # MOVEMENT LABELS
    # ========================================================
    activity_labels = {
        "PURCHASE": "Purchase",
        "SALE": "Sale",
        "RETURN": "Return",
        "ADJUSTMENT": "Stock Adjustment",
    }
    # ========================================================
    # BUILD ACTIVITY RESPONSE
    # ========================================================
    for movement in movements:
        movement_type = str(
            movement.get(
                "movement_type",
                "ADJUSTMENT",
            )
        ).upper()
        activity_type = activity_labels.get(
            movement_type,
            movement_type.replace("_", " ").title(),
        )
        medicine = movement.get(
            "medicine",
            {},
        )
        medicine_name = medicine.get(
            "jan_aushadhi_name"
        )
        if not medicine_name:
            medicine_name = medicine.get(
                "generic_name",
                "Unknown Medicine",
            )
        batch_number = movement.get(
            "batch_number"
        )
        quantity = movement.get(
            "quantity",
            0,
        )
        # ----------------------------------------------------
        # Generate readable description
        # ----------------------------------------------------
        if movement_type == "PURCHASE":
            description = (
                f"Purchased {quantity} units "
                f"of {medicine_name}"
            )
        elif movement_type == "SALE":
            description = (
                f"Sold {quantity} units "
                f"of {medicine_name}"
            )
        elif movement_type == "RETURN":
            description = (
                f"Returned {quantity} units "
                f"of {medicine_name}"
            )
        elif movement_type == "ADJUSTMENT":
            description = (
                f"Adjusted stock by {quantity} units "
                f"for {medicine_name}"
            )
        else:
            description = (
                f"{activity_type}: "
                f"{quantity} units of {medicine_name}"
            )
        activity_time = normalize_datetime(
            movement.get("created_at")
        )
        if activity_time is None:
            activity_time = utc_now()
        activities.append(
            {
                "activity_type": activity_type,
                "medicine_name": medicine_name,
                "batch_number": batch_number,
                "activity_time": activity_time,
                "description": description,
            }
        )
    # ========================================================
    # LOGGING
    # ========================================================
    logger.info(
        "Recent inventory activities retrieved successfully "
        f"for pharmacy: {pharmacy_id}"
    )
    return activities[:10]
# ============================================================
# MEDICINE AVAILABILITY
# ============================================================
async def get_medicine_availability(
    medicine_id: str,
    pharmacy_id: str,
):
    """
    Get current available quantity of a medicine
    across all active batches for a pharmacy.
    """
    db = get_database()
    # ========================================================
    # VALIDATE MEDICINE ID
    # ========================================================
    try:
        medicine_object_id = ObjectId(
            medicine_id
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid medicine ID.",
        )
    # ========================================================
    # FIND MEDICINE
    # ========================================================
    # Medicines are global master records.
    # Pharmacy-specific availability is determined
    # from batches.
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
    # CALCULATE TOTAL AVAILABLE QUANTITY
    # ========================================================
    pipeline = [
        {
            "$match": {
                "medicine_id": medicine_id,
                "pharmacy_id": pharmacy_id,
                "is_archived": False,
                "available_quantity": {
                    "$gt": 0,
                },
            }
        },
        {
            "$group": {
                "_id": None,
                "total_available_quantity": {
                    "$sum": "$available_quantity",
                },
            }
        },
    ]
    result = await db.batches.aggregate(
        pipeline
    ).to_list(length=1)
    if result:
        available_quantity = result[0][
            "total_available_quantity"
        ]
    else:
        available_quantity = 0
    # ========================================================
    # LOGGING
    # ========================================================
    logger.info(
        "Medicine availability checked: "
        f"medicine={medicine_id}, "
        f"pharmacy={pharmacy_id}, "
        f"quantity={available_quantity}"
    )
    # ========================================================
    # RESPONSE
    # ========================================================
    return {
        "medicine_id": medicine_id,
        "medicine_name": medicine.get(
            "jan_aushadhi_name",
            medicine.get(
                "generic_name",
                "Unknown Medicine",
            ),
        ),
        "available_quantity": available_quantity,
    }