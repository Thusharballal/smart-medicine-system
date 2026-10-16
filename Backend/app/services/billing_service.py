from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo
from typing import List, Optional
from uuid import uuid4
from bson import ObjectId
from fastapi import HTTPException, status
from app.database.connection import get_database, start_db_session
from app.models.billing_model import BillingModel, BillItemModel
from app.models.inventory_movement_model import InventoryMovementModel
from app.schemas.billing_schema import (
    BillItemResponse,
    BillResponse,
    CreateBillRequest,
    BillHistoryItemResponse,
    BillHistoryResponse,
    BillDetailResponse,
)
from app.services.batch_service import (
    allocate_stock,
    deduct_allocated_stock,
)
from app.services.inventory_movement_service import (
    create_inventory_movement,
)
from app.utils.logger import logger
# ============================================================
# BILL NUMBER
# ============================================================
def generate_bill_number() -> str:
    """
    Generate a unique bill number.
    Example:
    INV-20260920-103025-A1B2C3D4
    """
    now = datetime.now(timezone.utc)
    timestamp = now.strftime("%Y%m%d-%H%M%S")
    unique_part = uuid4().hex[:8].upper()
    return f"INV-{timestamp}-{unique_part}"
# ============================================================
# OBJECT ID VALIDATION
# ============================================================
def validate_object_id(
    value: str,
    field_name: str,
) -> ObjectId:
    """
    Validate a MongoDB ObjectId.
    """

    if not ObjectId.is_valid(value):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid {field_name}.",
        )

    return ObjectId(value)


# ============================================================
# CREATE BILL
# ============================================================
async def create_bill(
    bill_data: CreateBillRequest,
    current_pharmacy: dict,
):
    """
    Create a bill and deduct actual pharmacy stock.

    FLOW:

        Customer purchases medicine
                ↓
        Check medicine
                ↓
        FEFO batch allocation
                ↓
        Calculate bill
                ↓
        Insert bill
                ↓
        Deduct batches.available_quantity
                ↓
        Create SALE inventory movements
                ↓
        Transaction committed

    If anything fails:
        Entire transaction is rolled back.
    """

    database = get_database()

    # --------------------------------------------------------
    # AUTHENTICATED PHARMACY
    # --------------------------------------------------------

    pharmacy_id = str(current_pharmacy["_id"])

    # ========================================================
    # BASIC VALIDATION
    # ========================================================

    if not bill_data.items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one medicine is required.",
        )

    # --------------------------------------------------------
    # Prevent duplicate medicine entries
    # --------------------------------------------------------

    medicine_ids = [
        item.medicine_id
        for item in bill_data.items
    ]

    if len(medicine_ids) != len(set(medicine_ids)):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "The same medicine cannot be added "
                "multiple times to one bill."
            ),
        )

    # ========================================================
    # START SESSION
    # ========================================================

    session = await start_db_session()

    try:

        # ====================================================
        # START TRANSACTION
        # ====================================================

        async with session.start_transaction():

            # ------------------------------------------------
            # BILL ITEMS
            # ------------------------------------------------

            bill_items: List[BillItemResponse] = []

            bill_model_items: List[BillItemModel] = []

            # ------------------------------------------------
            # ALL STOCK ALLOCATIONS
            # ------------------------------------------------

            all_allocations = []

            # ------------------------------------------------
            # SUBTOTAL
            # ------------------------------------------------

            subtotal = 0.0

            # =================================================
            # PROCESS EACH REQUESTED MEDICINE
            # =================================================

            for requested_item in bill_data.items:

                medicine_id = requested_item.medicine_id

                medicine_object_id = validate_object_id(
                    medicine_id,
                    "medicine_id",
                )

                # ---------------------------------------------
                # FIND MEDICINE
                # ---------------------------------------------

                medicine = await database.medicines.find_one(
                    {
                        "_id": medicine_object_id,
                        "is_archived": False,
                    },
                    session=session,
                )

                if not medicine:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail=(
                            f"Medicine '{medicine_id}' "
                            "not found."
                        ),
                    )

                # ---------------------------------------------
                # ALLOCATE STOCK USING FEFO
                # ---------------------------------------------

                allocations = await allocate_stock(
                    medicine_id=medicine_id,
                    required_quantity=requested_item.quantity,
                    pharmacy_id=pharmacy_id,
                    session=session,
                )

                if not allocations:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=(
                            f"Insufficient stock for "
                            f"{medicine.get('generic_name', 'medicine')}."
                        ),
                    )

                # ------------------------------------------------
                # Add medicine_id to every allocation.
                #
                # allocate_stock() returns:
                # batch_id
                # batch_number
                # allocated_quantity
                #
                # We add medicine_id here.
                # ------------------------------------------------

                normalized_allocations = []

                for allocation in allocations:

                    normalized_allocation = {
                        "medicine_id": medicine_id,
                        "batch_id": allocation["batch_id"],
                        "batch_number": allocation["batch_number"],
                        "allocated_quantity": int(
                            allocation["allocated_quantity"]
                        ),
                    }

                    normalized_allocations.append(
                        normalized_allocation
                    )

                    all_allocations.append(
                        normalized_allocation
                    )

                # ---------------------------------------------
                # PROCESS EACH FEFO BATCH
                # ---------------------------------------------

                for allocation in normalized_allocations:

                    batch_id = allocation["batch_id"]

                    batch_number = allocation["batch_number"]

                    allocated_quantity = allocation[
                        "allocated_quantity"
                    ]

                    batch_object_id = validate_object_id(
                        batch_id,
                        "batch_id",
                    )

                    # -----------------------------------------
                    # GET BATCH
                    # -----------------------------------------

                    batch = await database.batches.find_one(
                        {
                            "_id": batch_object_id,
                            "medicine_id": medicine_id,
                            "pharmacy_id": pharmacy_id,
                            "is_archived": False,
                        },
                        session=session,
                    )

                    if not batch:
                        raise HTTPException(
                            status_code=status.HTTP_404_NOT_FOUND,
                            detail=(
                                f"Batch '{batch_number}' "
                                "not found for this pharmacy."
                            ),
                        )

                    # -----------------------------------------
                    # CHECK EXPIRY
                    # -----------------------------------------

                    expiry_date = batch.get("expiry_date")

                    if expiry_date:

                        if expiry_date.tzinfo is None:
                            expiry_date = expiry_date.replace(
                                tzinfo=timezone.utc
                            )

                        if expiry_date <= datetime.now(
                            timezone.utc
                        ):
                            raise HTTPException(
                                status_code=status.HTTP_400_BAD_REQUEST,
                                detail=(
                                    f"Batch '{batch_number}' "
                                    "is expired and cannot be sold."
                                ),
                            )

                    # -----------------------------------------
                    # CHECK AVAILABLE STOCK
                    # -----------------------------------------

                    available_quantity = int(
                        batch.get(
                            "available_quantity",
                            0,
                        )
                    )

                    if available_quantity < allocated_quantity:
                        raise HTTPException(
                            status_code=status.HTTP_400_BAD_REQUEST,
                            detail=(
                                f"Insufficient stock in "
                                f"batch '{batch_number}'."
                            ),
                        )

                    # -----------------------------------------
                    # GET BATCH MRP
                    # -----------------------------------------

                    unit_price = float(
                        batch.get("mrp", 0)
                    )

                    if unit_price <= 0:
                        raise HTTPException(
                            status_code=status.HTTP_400_BAD_REQUEST,
                            detail=(
                                f"Invalid MRP for "
                                f"batch '{batch_number}'."
                            ),
                        )

                    # -----------------------------------------
                    # CALCULATE LINE TOTAL
                    # -----------------------------------------

                    total_price = round(
                        unit_price * allocated_quantity,
                        2,
                    )

                    subtotal += total_price

                    # -----------------------------------------
                    # BILL RESPONSE ITEM
                    # -----------------------------------------

                    bill_items.append(
                        BillItemResponse(
                            medicine_id=medicine_id,
                            medicine_name=(
                                medicine.get("generic_name")
                                or medicine.get("jan_aushadhi_name")
                                or medicine.get("brand_name")
                                or "Unknown Medicine"
                            ),
                            batch_id=batch_id,
                            batch_number=batch_number,
                            quantity=allocated_quantity,
                            unit_price=unit_price,
                            total_price=total_price,
                        )
                    )

                    # -----------------------------------------
                    # BILL DATABASE ITEM
                    # -----------------------------------------

                    bill_model_items.append(
                        BillItemModel(
                            medicine_id=medicine_id,
                            batch_id=batch_id,
                            quantity=allocated_quantity,
                            unit_price=unit_price,
                            total_price=total_price,
                        )
                    )

            # =================================================
            # SUBTOTAL
            # =================================================

            subtotal = round(
                subtotal,
                2,
            )

            # =================================================
            # DISCOUNT
            # =================================================

            discount = round(
                float(bill_data.discount),
                2,
            )

            if discount > subtotal:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=(
                        "Discount cannot be greater "
                        "than subtotal."
                    ),
                )

            # =================================================
            # GST
            # =================================================

            gst_percentage = float(
                bill_data.gst_percentage
            )

            taxable_amount = round(
                subtotal - discount,
                2,
            )

            tax = round(
                taxable_amount
                * gst_percentage
                / 100,
                2,
            )

            # =================================================
            # FINAL TOTAL
            # =================================================

            total_amount = round(
                taxable_amount + tax,
                2,
            )

            if total_amount < 0:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid total amount.",
                )

            # =================================================
            # GENERATE BILL NUMBER
            # =================================================

            bill_number = generate_bill_number()

            # =================================================
            # CREATE BILL MODEL
            # =================================================

            bill = BillingModel(
                bill_number=bill_number,
                pharmacy_id=pharmacy_id,
                customer_name=bill_data.customer_name,
                customer_phone=bill_data.customer_phone,
                items=bill_model_items,
                subtotal=subtotal,
                discount=discount,
                gst_percentage=gst_percentage,
                tax=tax,
                total_amount=total_amount,
                payment_method=bill_data.payment_method,
                payment_status="PAID",
                created_by=pharmacy_id,
            )

            # =================================================
            # INSERT BILL
            # =================================================

            await database.bills.insert_one(
                bill.model_dump(),
                session=session,
            )

            # =================================================
            # DEDUCT ACTUAL PHARMACY STOCK
            # =================================================

            await deduct_allocated_stock(
                allocations=all_allocations,
                pharmacy_id=pharmacy_id,
                session=session,
            )

            # =================================================
            # CREATE SALE INVENTORY MOVEMENTS
            # =================================================

            for allocation in all_allocations:

                movement = InventoryMovementModel(
                    medicine_id=allocation["medicine_id"],
                    batch_id=allocation["batch_id"],
                    batch_number=allocation["batch_number"],
                    movement_type="SALE",
                    quantity=int(
                        allocation["allocated_quantity"]
                    ),
                    reference_id=bill_number,
                    reference_type="BILL",
                    created_by=pharmacy_id,
                )

                await create_inventory_movement(
                    movement=movement,
                    session=session,
                )

            # =================================================
            # SUCCESS
            # =================================================

            logger.info(
                f"Bill created successfully: "
                f"{bill_number} | "
                f"pharmacy={pharmacy_id}"
            )

            return BillResponse(
                bill_number=bill_number,
                customer_name=bill_data.customer_name,
                customer_phone=bill_data.customer_phone,
                items=bill_items,
                subtotal=subtotal,
                discount=discount,
                gst_percentage=gst_percentage,
                tax=tax,
                total_amount=total_amount,
                payment_method=bill_data.payment_method,
                payment_status="PAID",
                created_by=pharmacy_id,
                created_at=bill.created_at,
            )

    # ========================================================
    # HTTP ERRORS
    # ========================================================

    except HTTPException:
        raise

    # ========================================================
    # UNEXPECTED ERRORS
    # ========================================================

    except Exception as error:

        logger.error(
            f"Billing transaction failed | "
            f"pharmacy={pharmacy_id} | "
            f"error={error}"
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=(
                "Failed to create bill. "
                "All billing changes were rolled back."
            ),
        )

    # ========================================================
    # CLOSE SESSION
    # ========================================================

    finally:

        await session.end_session()


# ============================================================
# BILL HISTORY
# ============================================================

async def get_bill_history(
    page: int,
    page_size: int,
    search: Optional[str],
    status: Optional[str],
    current_pharmacy: dict,
):
    """
    Get bill history belonging only to the authenticated
    pharmacy.
    """

    database = get_database()

    pharmacy_id = str(
        current_pharmacy["_id"]
    )

    # ========================================================
    # BASE QUERY
    # ========================================================

    query = {
        "pharmacy_id": pharmacy_id,
        "is_archived": False,
    }

    # ========================================================
    # SEARCH
    # ========================================================

    if search:

        search_value = search.strip()

        if search_value:

            query["$or"] = [
                {
                    "bill_number": {
                        "$regex": search_value,
                        "$options": "i",
                    }
                },
                {
                    "customer_name": {
                        "$regex": search_value,
                        "$options": "i",
                    }
                },
                {
                    "customer_phone": {
                        "$regex": search_value,
                        "$options": "i",
                    }
                },
            ]

    # ========================================================
    # STATUS FILTER
    # ========================================================

    if status:

        query["payment_status"] = status.strip().upper()

    # ========================================================
    # TOTAL COUNT
    # ========================================================

    total = await database.bills.count_documents(
        query
    )

    # ========================================================
    # PAGINATION
    # ========================================================

    skip = (page - 1) * page_size

    cursor = (
        database.bills
        .find(query)
        .sort("created_at", -1)
        .skip(skip)
        .limit(page_size)
    )

    bills = await cursor.to_list(
        length=page_size
    )

    # ========================================================
    # BUILD RESPONSE
    # ========================================================

    results = []

    for bill in bills:

        items = bill.get(
            "items",
            [],
        )

        # Count unique medicines, not batches.
        distinct_medicines = {
            item.get("medicine_id")
            for item in items
            if item.get("medicine_id")
        }

        results.append(
            BillHistoryItemResponse(
                bill_number=bill["bill_number"],
                customer_name=bill.get(
                    "customer_name"
                ),
                customer_phone=bill.get(
                    "customer_phone"
                ),
                medicine_count=len(
                    distinct_medicines
                ),
                total_amount=float(
                    bill.get(
                        "total_amount",
                        0,
                    )
                ),
                payment_method=bill.get(
                    "payment_method",
                    "",
                ),
                payment_status=bill.get(
                    "payment_status",
                    "PAID",
                ),
                created_by=bill.get(
                    "created_by",
                    pharmacy_id,
                ),
                created_at=bill["created_at"],
            )
        )
    # ========================================================
    # TOTAL PAGES
    # ========================================================
    total_pages = (
        (total + page_size - 1) // page_size
        if total > 0
        else 0
    )
    return BillHistoryResponse(
        bills=results,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )
# ============================================================
# GET BILL DETAIL
# ============================================================
async def get_bill_by_number(
    bill_number: str,
    current_pharmacy: dict,
):
    """
    Get bill details for the authenticated pharmacy only.
    """
    database = get_database()
    pharmacy_id = str(
        current_pharmacy["_id"]
    )
    # ========================================================
    # FIND BILL
    # ========================================================
    bill = await database.bills.find_one(
        {
            "bill_number": bill_number,
            "pharmacy_id": pharmacy_id,
            "is_archived": False,
        }
    )
    if not bill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bill not found.",
        )
    # ========================================================
    # BUILD DETAILED ITEMS
    # ========================================================
    detailed_items = []
    for item in bill.get(
        "items",
        [],
    ):
        # ----------------------------------------------------
        # MEDICINE NAME
        # ----------------------------------------------------
        medicine_name = "Unknown Medicine"
        medicine_id = item.get(
            "medicine_id"
        )
        if (
            medicine_id
            and ObjectId.is_valid(medicine_id)
        ):
            medicine = await database.medicines.find_one(
                {
                    "_id": ObjectId(medicine_id),
                    "is_archived": False,
                }
            )
            if medicine:
                medicine_name = (
                    medicine.get(
                        "generic_name"
                    )
                    or medicine.get(
                        "jan_aushadhi_name"
                    )
                    or medicine.get(
                        "brand_name"
                    )
                    or "Unknown Medicine"
                )
        # ----------------------------------------------------
        # BATCH NUMBER
        # ----------------------------------------------------
        batch_number = item.get(
            "batch_number",
            "",
        )
        batch_id = item.get(
            "batch_id"
        )
        # Existing bills may contain only batch_id.
        # Recover batch_number from batches collection.
        if (
            not batch_number
            and batch_id
            and ObjectId.is_valid(batch_id)
        ):
            batch = await database.batches.find_one(
                {
                    "_id": ObjectId(batch_id),
                    "pharmacy_id": pharmacy_id,
                }
            )
            if batch:
                batch_number = batch.get(
                    "batch_number",
                    "",
                )
        detailed_items.append(
            {
                "medicine_id": medicine_id,
                "medicine_name": medicine_name,
                "batch_id": batch_id,
                "batch_number": batch_number,
                "quantity": item["quantity"],
                "unit_price": item["unit_price"],
                "total_price": item["total_price"],
            }
        )
    # ========================================================
    # RETURN BILL DETAILS
    # ========================================================
    return BillDetailResponse(
        bill_number=bill["bill_number"],
        customer_name=bill.get(
            "customer_name"
        ),
        customer_phone=bill.get(
            "customer_phone"
        ),
        items=detailed_items,
        subtotal=float(
            bill.get(
                "subtotal",
                0,
            )
        ),
        discount=float(
            bill.get(
                "discount",
                0,
            )
        ),
        gst_percentage=float(
            bill.get(
                "gst_percentage",
                0,
            )
        ),
        tax=float(
            bill.get(
                "tax",
                0,
            )
        ),
        total_amount=float(
            bill.get(
                "total_amount",
                0,
            )
        ),
        payment_method=bill.get(
            "payment_method",
            "",
        ),
        payment_status=bill.get(
            "payment_status",
            "PAID",
        ),
        created_by=bill.get(
            "created_by",
            pharmacy_id,
        ),
        created_at=bill["created_at"],
        updated_at=bill.get(
            "updated_at",
            bill["created_at"],
        ),
    )