from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query, status
from app.core.security import get_current_user
from app.schemas.notification_scheme import (
    NotificationCreate,
    NotificationResponse,
)
from app.services.notification_service import NotificationService
router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"],
)
# ==========================================================
# SERIALIZE NOTIFICATION
# ==========================================================
def serialize_notification(notification: dict) -> dict:
    return {
        "id": str(notification["_id"]),
        "user_id": str(notification["user_id"]),
        "title": notification["title"],
        "description": notification["description"],
        "type": notification["type"],
        "is_read": notification["is_read"],
        "created_at": notification["created_at"],
        "updated_at": notification["updated_at"],
        "read_at": notification.get("read_at"),
    }
# ==========================================================
# GET CURRENT USER ID
# ==========================================================
def get_user_object_id(current_user: dict) -> ObjectId:
    """
    Get the MongoDB ObjectId directly from the
    authenticated MongoDB user document.
    get_current_user() returns the original MongoDB
    document, therefore the user ID is stored in `_id`,
    not `id`.
    """
    user_id = current_user.get("_id")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authenticated user ID is missing.",
        )
    # Already a MongoDB ObjectId
    if isinstance(user_id, ObjectId):
        return user_id

    # Convert string ID to ObjectId if necessary
    try:
        return ObjectId(user_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authenticated user ID.",
        )
# ==========================================================
# CREATE NOTIFICATION
# ==========================================================
@router.post(
    "",
    response_model=NotificationResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_notification(
    data: NotificationCreate,
    current_user: dict = Depends(get_current_user),
):
    user_id = get_user_object_id(current_user)
    # ------------------------------------------------------
    # Verify that notification belongs to current user
    # ------------------------------------------------------
    try:
        requested_user_id = ObjectId(data.user_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID.",
        )
    if requested_user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only create notifications for yourself.",
        )
    notification = await NotificationService.create_notification(
        data
    )
    return serialize_notification(notification)
# ==========================================================
# GET USER NOTIFICATIONS
# =========================================================
@router.get(
    "",
    response_model=list[NotificationResponse],
)
async def get_notifications(
    unread_only: bool = Query(False),
    current_user: dict = Depends(get_current_user),
):
    user_id = get_user_object_id(current_user)
    notifications = (
        await NotificationService.get_user_notifications(
            user_id=user_id,
            unread_only=unread_only,
        )
    )
    return [
        serialize_notification(notification)
        for notification in notifications
    ]
# =========================================================
# GET UNREAD COUNT
# ==========================================================
@router.get("/unread-count")
async def get_unread_count(
    current_user: dict = Depends(get_current_user),
):
    user_id = get_user_object_id(current_user)
    count = await NotificationService.get_unread_count(
        user_id
    )
    return {
        "unread_count": count
    }
# ==========================================================
# MARK ONE NOTIFICATION AS READ
# ==========================================================
@router.patch(
    "/{notification_id}/read",
    response_model=NotificationResponse,
)
async def mark_notification_as_read(
    notification_id: str,
    current_user: dict = Depends(get_current_user),
):
    user_id = get_user_object_id(current_user)
    notification = await NotificationService.mark_as_read(
        notification_id=notification_id,
        user_id=user_id,
    )
    if notification is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found.",
        )
    return serialize_notification(notification)
# ==========================================================
# MARK ALL NOTIFICATIONS AS READ
# ==========================================================
@router.patch("/read-all")
async def mark_all_notifications_as_read(
    current_user: dict = Depends(get_current_user),
):
    user_id = get_user_object_id(current_user)
    count = await NotificationService.mark_all_as_read(
        user_id
    )
    return {
        "message": "All notifications marked as read.",
        "updated_count": count,
    }
# ==========================================================
# DELETE NOTIFICATION
# ==========================================================
@router.delete("/{notification_id}")
async def delete_notification(
    notification_id: str,
    current_user: dict = Depends(get_current_user),
):
    user_id = get_user_object_id(current_user)
    deleted = await NotificationService.delete_notification(
        notification_id=notification_id,
        user_id=user_id,
    )
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found.",
        )
    return {
        "message": "Notification deleted successfully."
    }