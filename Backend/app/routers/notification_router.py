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
def serialize_notification(notification: dict) -> dict:
    return {
        "id": str(notification["_id"]),
        "user_id": notification["user_id"],
        "title": notification["title"],
        "description": notification["description"],
        "type": notification["type"],
        "is_read": notification["is_read"],
        "created_at": notification["created_at"],
        "updated_at": notification["updated_at"],
        "read_at": notification.get("read_at"),
    }
# ==========================================================
# Create Notification
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
    if data.user_id != current_user["_id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only create notifications for yourself.",
        )
    notification = await NotificationService.create_notification(
        data
    )
    return serialize_notification(notification)
# ==========================================================
# Get User Notifications
# ==========================================================
@router.get(
    "",
    response_model=list[NotificationResponse],
)
async def get_notifications(
    unread_only: bool = Query(False),
    current_user: dict = Depends(get_current_user),
):
    user_id = current_user["_id"]
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
# ==========================================================
# Get Unread Count
# ==========================================================
@router.get("/unread-count")
async def get_unread_count(
    current_user: dict = Depends(get_current_user),
):
    user_id = current_user["_id"]
    count = await NotificationService.get_unread_count(
        user_id
    )
    return {
        "unread_count": count
    }
# ==========================================================
# Mark One Notification as Read
# ==========================================================
@router.patch(
    "/{notification_id}/read",
    response_model=NotificationResponse,
)
async def mark_notification_as_read(
    notification_id: str,
    current_user: dict = Depends(get_current_user),
):
    user_id = current_user["_id"]
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
# Mark All Notifications as Read
# ==========================================================
@router.patch("/read-all")
async def mark_all_notifications_as_read(
    current_user: dict = Depends(get_current_user),
):
    user_id = current_user["_id"]
    count = await NotificationService.mark_all_as_read(
        user_id
    )
    return {
        "message": "All notifications marked as read.",
        "updated_count": count,
    }
# ==========================================================
# Delete Notification
# ==========================================================
@router.delete("/{notification_id}")
async def delete_notification(
    notification_id: str,
    current_user: dict = Depends(get_current_user),
):
    user_id = current_user["_id"]
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