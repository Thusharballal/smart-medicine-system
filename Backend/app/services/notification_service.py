from datetime import datetime

from bson import ObjectId

from app.database.connection import get_database
from app.schemas.notification_scheme import NotificationCreate


class NotificationService:

    # ==========================================================
    # Create Notification
    # ==========================================================
    @staticmethod
    async def create_notification(data: NotificationCreate):
        db = get_database()

        now = datetime.utcnow()

        notification = {
            "user_id": data.user_id,
            "title": data.title,
            "description": data.description,
            "type": data.type,
            "is_read": False,
            "read_at": None,
            "created_at": now,
            "updated_at": now,
        }

        result = await db.notifications.insert_one(notification)

        notification["_id"] = result.inserted_id

        return notification

    # ==========================================================
    # Get User Notifications
    # ==========================================================
    @staticmethod
    async def get_user_notifications(
        user_id: str,
        unread_only: bool = False,
    ):
        db = get_database()

        query = {
            "user_id": user_id,
        }

        if unread_only:
            query["is_read"] = False

        cursor = (
            db.notifications
            .find(query)
            .sort("created_at", -1)
        )

        notifications = await cursor.to_list(length=100)

        return notifications

    # ==========================================================
    # Get Unread Notification Count
    # ==========================================================
    @staticmethod
    async def get_unread_count(user_id: str):
        db = get_database()

        count = await db.notifications.count_documents({
            "user_id": user_id,
            "is_read": False,
        })

        return count

    # ==========================================================
    # Mark One Notification As Read
    # ==========================================================
    @staticmethod
    async def mark_as_read(
        notification_id: str,
        user_id: str,
    ):
        db = get_database()

        # Validate MongoDB ObjectId
        if not ObjectId.is_valid(notification_id):
            return None

        object_id = ObjectId(notification_id)

        # Update notification
        await db.notifications.update_one(
            {
                "_id": object_id,
                "user_id": user_id,
            },
            {
                "$set": {
                    "is_read": True,
                    "read_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow(),
                }
            },
        )

        # Fetch notification after update
        # This also works if the notification was already read.
        notification = await db.notifications.find_one({
            "_id": object_id,
            "user_id": user_id,
        })

        if notification is None:
            return None

        return notification

    # ==========================================================
    # Mark All Notifications As Read
    # ==========================================================
    @staticmethod
    async def mark_all_as_read(user_id: str):
        db = get_database()

        now = datetime.utcnow()

        result = await db.notifications.update_many(
            {
                "user_id": user_id,
                "is_read": False,
            },
            {
                "$set": {
                    "is_read": True,
                    "read_at": now,
                    "updated_at": now,
                }
            },
        )

        return result.modified_count

    # ==========================================================
    # Delete Notification
    # ==========================================================
    @staticmethod
    async def delete_notification(
        notification_id: str,
        user_id: str,
    ):
        db = get_database()

        # Validate MongoDB ObjectId
        if not ObjectId.is_valid(notification_id):
            return False

        object_id = ObjectId(notification_id)

        result = await db.notifications.delete_one({
            "_id": object_id,
            "user_id": user_id,
        })

        return result.deleted_count > 0