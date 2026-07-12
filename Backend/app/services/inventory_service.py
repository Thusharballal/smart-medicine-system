from datetime import datetime, timezone, timedelta
from app.database.connection import get_database
from app.utils.logger import logger
async def get_inventory_dashboard():
    """Retrieve inventory dashboard statistics."""
    db = get_database()
    # ----------------------------
    # Total Medicines
    # ----------------------------
    total_medicines = await db.medicines.count_documents(
        {
            "is_archived": False
        }
    )
    # ----------------------------
    # Total Batches
    # ----------------------------
    total_batches = await db.batches.count_documents(
        {
            "is_archived": False
        }
    )
    # ----------------------------
    # Total Stock Units
    # ----------------------------
    pipeline = [
        {
            "$match": {
                "is_archived": False
            }
        },
        {
            "$group": {
                "_id": None,
                "total_stock": {
                    "$sum": "$available_quantity"
                }
            }
        }
    ]
    stock_result = await db.batches.aggregate(
        pipeline
    ).to_list(length=1)
    if stock_result:
        total_stock_units = stock_result[0]["total_stock"]
    else:
        total_stock_units = 0
# ----------------------------
# Total Inventory Value
# ----------------------------
    value_pipeline = [
            {
                "$match": {
                    "is_archived": False
                }
            },
            {
                "$group": {
                    "_id": None,
                    "total_inventory_value": {
                        "$sum": {
                            "$multiply": [
                                "$available_quantity",
                                "$purchase_price"
                            ]
                        }
                    }
                }
            }
        ]
    
    value_result = await db.batches.aggregate(
            value_pipeline
        ).to_list(length=1)
    if value_result:
        total_inventory_value = round(
        value_result[0]["total_inventory_value"],
        2
    )
    else:
        total_inventory_value = 0.0
    # ----------------------------
    # Low Stock
    # ----------------------------
    low_stock_batches = await db.batches.count_documents(
        {
            "is_archived": False,
            "available_quantity": {
                "$lte": 20,
                "$gt": 0
            }
        }
    )
    # ----------------------------
    # Out Of Stock
    # ----------------------------
    out_of_stock_batches = await db.batches.count_documents(
        {
            "is_archived": False,
            "available_quantity": 0
        }
    )
    # ----------------------------
    # Near Expiry
    # ----------------------------
    expiry_limit = datetime.now(
        timezone.utc
    ) + timedelta(days=90)
    near_expiry_batches = await db.batches.count_documents(
        {
            "is_archived": False,
            "expiry_date": {
                "$lte": expiry_limit
            }
        }
    )
    # ----------------------------
    # Inventory Health
    # ----------------------------
    if total_batches == 0:

        inventory_health = 100.0
    else:
        healthy_batches = (
            total_batches
            - low_stock_batches
            - out_of_stock_batches
            - near_expiry_batches
        )
        inventory_health = round(
            (
                healthy_batches
                / total_batches
            ) * 100,
            2
        )
        if inventory_health < 0:
            inventory_health = 0.0
        # ----------------------------
    # Average Stock Per Batch
    # ----------------------------
    if total_batches == 0:
        average_stock_per_batch = 0.0
    else:
        average_stock_per_batch = round(
            total_stock_units / total_batches,
            2
        )
    logger.info(
        "Inventory dashboard generated successfully."
    )
    return {
    "total_medicines": total_medicines,
    "total_batches": total_batches,
    "total_stock_units": total_stock_units,
    "low_stock_batches": low_stock_batches,
    "out_of_stock_batches": out_of_stock_batches,
    "near_expiry_batches": near_expiry_batches,
    "inventory_health": inventory_health,
    "total_inventory_value": total_inventory_value,
    "average_stock_per_batch": average_stock_per_batch
    }
async def get_low_stock_batches():
    """Retrieve all active batches having low stock."""
    db = get_database()
    pipeline = [
        {
            "$match": {
                "is_archived": False,
                "available_quantity": {
                    "$lte": 20,
                    "$gt": 0
                }
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
            "$sort": {
                "available_quantity": 1
            }
        }
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
                "generic_name":
                    batch["medicine"]["generic_name"],
                "jan_aushadhi_name":
                    batch["medicine"]["jan_aushadhi_name"],
                "strength":
                    batch["medicine"]["strength"],
                "batch_number":
                    batch["batch_number"],
                "available_quantity":
                    batch["available_quantity"],
                "expiry_date":
                    batch["expiry_date"]
            }
        )
    logger.info(
        "Low stock batches retrieved successfully."
    )
    return results
async def get_near_expiry_batches():
    """Retrieve all active batches expiring within the next 90 days."""
    db = get_database()
    today = datetime.now(
        timezone.utc
    )
    expiry_limit = today + timedelta(
        days=90
    )
    pipeline = [
        {
            "$match": {
                "is_archived": False,
                "expiry_date": {
                    "$gte": today,
                    "$lte": expiry_limit
                }
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
            "$sort": {
                "expiry_date": 1
            }
        }
    ]
    batches = await db.batches.aggregate(
        pipeline
    ).to_list(length=None)
    results = []
    for batch in batches:
        days_remaining = (
            batch["expiry_date"] - today
        ).days
        results.append(
            {
                "batch_id": str(batch["_id"]),
                "medicine_id": batch["medicine_id"],
                "generic_name":
                    batch["medicine"]["generic_name"],
                "jan_aushadhi_name":
                    batch["medicine"]["jan_aushadhi_name"],
                "strength":
                    batch["medicine"]["strength"],
                "batch_number":
                    batch["batch_number"],
                "available_quantity":
                    batch["available_quantity"],
                "expiry_date":
                    batch["expiry_date"],
                "days_remaining":
                    days_remaining
            }
        )
    logger.info(
        "Near expiry batches retrieved successfully."
    )
    return results
async def get_out_of_stock_batches():
    """ Retrieve all active batches that are out of stock."""
    db = get_database()
    pipeline = [
        {
            "$match": {
                "is_archived": False,
                "available_quantity": 0
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
            "$sort": {
                "jan_aushadhi_name": 1
            }
        }
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
                "generic_name":
                    batch["medicine"]["generic_name"],
                "jan_aushadhi_name":
                    batch["medicine"]["jan_aushadhi_name"],
                "strength":
                    batch["medicine"]["strength"],
                "batch_number":
                    batch["batch_number"],
                "available_quantity":
                    batch["available_quantity"]
            }
        )
    logger.info(
        "Out of stock batches retrieved successfully."
    )
    return results
async def get_recent_inventory_activities():
    """Retrieve recent inventory activities."""
    db = get_database()
    activities = []
    # ----------------------------
    # Recent Medicines
    # ----------------------------
    medicines = await db.medicines.find(
        {
            "is_archived": False
        }
    ).sort(
        "created_at",
        -1
    ).limit(10).to_list(length=10)
    for medicine in medicines:
        activities.append(
            {
                "activity_type": "Medicine Added",
                "medicine_name": medicine["jan_aushadhi_name"],
                "batch_number": None,
                "activity_time": medicine["created_at"],
                "description": (
                    f"Added medicine "
                    f"{medicine['jan_aushadhi_name']}"
                )
            }
        )
    # ----------------------------
    # Recent Batches
    # ----------------------------
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
            "$sort": {
                "created_at": -1
            }
        },
        {
            "$limit": 10
        }
    ]
    batches = await db.batches.aggregate(
        pipeline
    ).to_list(length=10)
    for batch in batches:
        activities.append(
            {
                "activity_type": "Batch Added",
                "medicine_name":
                    batch["medicine"]["jan_aushadhi_name"],
                "batch_number":
                    batch["batch_number"],
                "activity_time":
                    batch["created_at"],
                "description": (
                    f"Added batch "
                    f"{batch['batch_number']}"
                )
            }
        )
    activities.sort(
        key=lambda activity: activity["activity_time"],
        reverse=True
    )
    logger.info(
        "Recent inventory activities retrieved successfully."
    )
    return activities[:10]