from datetime import datetime
from typing import List, Optional
from bson import ObjectId
from fastapi import HTTPException, status
import math
from app.database.connection import (
    get_database,
)
from app.models.billing_model import BillingModel, BillItemModel
from app.models.inventory_movement_model import InventoryMovementModel
from app.services.inventory_movement_service import (
    create_inventory_movement,
)
from app.schemas.billing_schema import (
    BillItemResponse,
    BillResponse,
    CreateBillRequest,
    BillHistoryItemResponse,
    BillHistoryResponse,
    BillDetailResponse,
)
from app.utils.logger import logger
async def create_bill(
    bill_data: CreateBillRequest,
    current_user: dict,
):
    """ Create a new bill."""
    db = get_database()
    bill_items: List[BillItemResponse] = []
    subtotal = 0.0
    for item in bill_data.items:
    # Find medicine
        medicine = await db.medicines.find_one(
            {
                "_id": ObjectId(item.medicine_id),
                "is_archived": False,
            }
        )
        if not medicine:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Medicine not found."
            )
        # Find FEFO batch
        batch = await db.batches.find_one(
            {
                "medicine_id": item.medicine_id,
                "is_archived": False,
                "available_quantity": {
                    "$gt": 0
                }
            },
            sort=[
                ("expiry_date", 1)
            ]
        )
        if not batch:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No stock available for {medicine['jan_aushadhi_name']}."
            )
        if batch["available_quantity"] < item.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient stock for {medicine['jan_aushadhi_name']}."
            )
        unit_price = batch["mrp"]
        total_price = unit_price * item.quantity
        subtotal += total_price
        bill_items.append(
            BillItemResponse(
                medicine_id=item.medicine_id,
                medicine_name=medicine["jan_aushadhi_name"],
                batch_id=str(batch["_id"]),
                batch_number=batch["batch_number"],
                quantity=item.quantity,
                unit_price=unit_price,
                total_price=total_price,
            )
        )
    tax = subtotal * bill_data.gst_percentage / 100
    total_amount = (subtotal- bill_data.discount + tax)
    if total_amount < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Total amount cannot be negative."
        )
    bill_number = f"INV-{datetime.now().strftime('%Y%m%d%H%M%S')}"
    bill = BillingModel(
        bill_number=bill_number,
        customer_name=bill_data.customer_name,
        customer_phone=bill_data.customer_phone,
        items=[
            BillItemModel(
                medicine_id=item.medicine_id,
                batch_id=item.batch_id,
                quantity=item.quantity,
                unit_price=item.unit_price,
                total_price=item.total_price,
            )
            for item in bill_items
        ],
        subtotal=subtotal,
        discount=bill_data.discount,
        gst_percentage=bill_data.gst_percentage,
        tax=tax,
        total_amount=total_amount,
        payment_method=bill_data.payment_method,
        created_by=str(current_user["_id"]),
    )
    await db.bills.insert_one(
        bill.model_dump()
    )

    for item in bill_items:
        # Reduce Batch Quantity
        await db.batches.update_one(
            {
                "_id": ObjectId(item.batch_id)
            },
            {
                "$inc": {
                    "available_quantity": -item.quantity
                }
            }
        )
        # Record Inventory Movement
        movement = InventoryMovementModel(
            medicine_id=item.medicine_id,
            batch_id=item.batch_id,
            batch_number=item.batch_number,
            movement_type="SALE",
            quantity=item.quantity,
            reference_id=bill.bill_number,
            reference_type="BILL",
            created_by=str(current_user["_id"]),
        )
        await create_inventory_movement(movement)
    logger.info(
    f"Bill {bill_number} created successfully."
)
    return BillResponse(
        bill_number=bill.bill_number,
        customer_name=bill.customer_name,
        customer_phone=bill.customer_phone,
        items=bill_items,
        subtotal=bill.subtotal,
        discount=bill.discount,
        gst_percentage=bill.gst_percentage,
        tax=bill.tax,
        total_amount=bill.total_amount,
        payment_method=bill.payment_method,
        payment_status=bill.payment_status,
        created_by=bill.created_by,
        created_at=bill.created_at,
    )

async def get_bill_history(
    page: int = 1,
    page_size: int = 10,
    search: Optional[str] = None,
    status_filter: Optional[str] = None,
    current_user: dict = None,
):
    """
    Get paginated bill history with optional search and filters.
    
    Args:
        page: Page number (1-indexed)
        page_size: Number of bills per page
        search: Search by bill number, customer name, or phone
        status_filter: Filter by payment status (paid, pending, cancelled)
        current_user: Current authenticated user
    
    Returns:
        BillHistoryResponse with paginated bills
    """
    db = get_database()
    
    # Build query
    query = {"is_archived": False}
    
    # Add search filter
    if search:
        search_regex = {"$regex": search, "$options": "i"}
        query["$or"] = [
            {"bill_number": search_regex},
            {"customer_name": search_regex},
            {"customer_phone": search_regex},
        ]
    
    # Add status filter
    if status_filter:
        query["payment_status"] = status_filter.upper()
    
    # Get total count
    total = await db.bills.count_documents(query)
    
    # Calculate pagination
    total_pages = math.ceil(total / page_size) if total > 0 else 1
    skip = (page - 1) * page_size
    
    # Fetch bills
    bills_cursor = db.bills.find(query).sort("created_at", -1).skip(skip).limit(page_size)
    bills = await bills_cursor.to_list(length=page_size)
    
    # Transform to response format
    bill_items = []
    for bill in bills:
        bill_items.append(
            BillHistoryItemResponse(
                bill_number=bill["bill_number"],
                customer_name=bill.get("customer_name"),
                customer_phone=bill.get("customer_phone"),
                medicine_count=len(bill["items"]),
                total_amount=bill["total_amount"],
                payment_method=bill["payment_method"],
                payment_status=bill["payment_status"],
                created_at=bill["created_at"],
                created_by=bill["created_by"],
            )
        )
    
    return BillHistoryResponse(
        bills=bill_items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


async def get_bill_by_number(
    bill_number: str,
    current_user: dict = None,
):
    """
    Get complete bill details by bill number.
    
    Args:
        bill_number: Bill number to retrieve
        current_user: Current authenticated user
    
    Returns:
        BillDetailResponse with complete bill information
    """
    db = get_database()
    
    # Find bill
    bill = await db.bills.find_one({
        "bill_number": bill_number,
        "is_archived": False,
    })
    
    if not bill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bill not found."
        )
    
    # Build items with medicine details
    bill_items = []
    for item in bill["items"]:
        # Get medicine details
        medicine = await db.medicines.find_one(
            {"_id": ObjectId(item["medicine_id"])}
        )
        
        # Get batch details
        batch = await db.batches.find_one(
            {"_id": ObjectId(item["batch_id"])}
        )
        
        bill_items.append(
            BillItemResponse(
                medicine_id=item["medicine_id"],
                medicine_name=medicine["jan_aushadhi_name"] if medicine else "Unknown",
                batch_id=item["batch_id"],
                batch_number=batch["batch_number"] if batch else "Unknown",
                quantity=item["quantity"],
                unit_price=item["unit_price"],
                total_price=item["total_price"],
            )
        )
    return BillDetailResponse(
        bill_number=bill["bill_number"],
        customer_name=bill.get("customer_name"),
        customer_phone=bill.get("customer_phone"),
        items=bill_items,
        subtotal=bill["subtotal"],
        discount=bill["discount"],
        gst_percentage=bill.get("gst_percentage", 0.0),
        tax=bill["tax"],
        total_amount=bill["total_amount"],
        payment_method=bill["payment_method"],
        payment_status=bill["payment_status"],
        created_by=bill["created_by"],
        created_at=bill["created_at"],
        updated_at=bill["updated_at"],
    )