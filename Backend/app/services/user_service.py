from app.database.connection import get_database
from app.schemas.user_schema import UserDashboardResponse
from app.schemas.user_schema import UserProfileResponse
from app.schemas.user_schema import UpdateUserRequest
async def get_user_dashboard(current_user):
    """Get dashboard data for the logged-in user."""
    db = get_database()
    # Get latest user document
    user = await db.users.find_one(
        {"email": current_user["email"]}
    )
    return UserDashboardResponse(
        full_name=user["full_name"],
        email=user["email"],
        total_searches=0,
        saved_medicines=0,
        nearby_pharmacies=0,
        recent_activity=[]
    )
async def get_user_profile(current_user):
    """Return the profile of the currently logged-in user."""
    return UserProfileResponse(
        full_name=current_user["full_name"],
        email=current_user["email"],
        phone_number=current_user["phone_number"],
        role=current_user["role"],
        status=current_user["status"],
        is_email_verified=current_user["is_email_verified"],
    )
async def update_user_profile(
    current_user: dict,
    update_data: UpdateUserRequest
):
    """Update the profile of the logged-in user."""
    db = get_database()
    # Update only editable fields
    await db.users.update_one(
        {"email": current_user["email"]},
        {
            "$set": {
                "full_name": update_data.full_name,
                "phone_number": update_data.phone_number,
            }
        }
    )
    # Fetch the updated document
    updated_user = await db.users.find_one(
        {"email": current_user["email"]}
    )
    return UserProfileResponse(
        full_name=updated_user["full_name"],
        email=updated_user["email"],
        phone_number=updated_user["phone_number"],
        role=updated_user["role"],
        status=updated_user["status"],
        is_email_verified=updated_user["is_email_verified"],
    )
async def get_all_users():
    """Retrieve all users for the Admin Users page."""
    db = get_database()
    users = await db.users.find(
        {}
    ).to_list(length=None)
    results = []
    for user in users:
        user["id"] = str(user["_id"])
        del user["_id"]
        # Never send sensitive authentication data to the frontend
        user.pop("password_hash", None)
        user.pop("hashed_password", None)
        results.append(user)
    return results
from bson import ObjectId
from fastapi import HTTPException, status
from datetime import datetime, timezone
from app.utils.constants import UserStatus
async def get_user_by_id(user_id: str):
    """Retrieve a single user for Admin viewing."""
    db = get_database()
    try:
        object_id = ObjectId(user_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID."
        )
    user = await db.users.find_one({"_id": object_id})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found."
        )
    user["id"] = str(user["_id"])
    del user["_id"]
    # Never expose authentication credentials
    user.pop("password_hash", None)
    user.pop("hashed_password", None)
    return user
async def update_admin_user(
    user_id: str,
    update_data
):
    """Allow an Admin to update another user's account."""
    db = get_database()
    try:
        object_id = ObjectId(user_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID."
        )
    existing_user = await db.users.find_one(
        {"_id": object_id}
    )
    if not existing_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found."
        )
    update_fields = update_data.model_dump()
    # Normalize role and status
    update_fields["role"] = update_fields["role"].upper()
    update_fields["status"] = update_fields["status"].upper()
    await db.users.update_one(
        {"_id": object_id},
        {
            "$set": {
                **update_fields,
                "updated_at": datetime.now(timezone.utc)
            }
        }
    )
    return {
        "message": "User updated successfully."
    }
async def deactivate_user(user_id: str):
    """Suspend a user account instead of permanently deleting it."""
    db = get_database()
    try:
        object_id = ObjectId(user_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID."
        )
    existing_user = await db.users.find_one(
        {"_id": object_id}
    )
    if not existing_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found."
        )
    await db.users.update_one(
        {"_id": object_id},
        {
            "$set": {
                "status": UserStatus.SUSPENDED.value,
                "updated_at": datetime.now(timezone.utc)
            }
        }
    )
    return {
        "message": "User deactivated successfully."
    }
async def delete_user(user_id: str):
    """Permanently delete a user account."""
    db = get_database()
    try:
        object_id = ObjectId(user_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID."
        )
    existing_user = await db.users.find_one(
        {"_id": object_id}
    )
    if not existing_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found."
        )
    await db.users.delete_one(
        {"_id": object_id}
    )
    return {
        "message": "User deleted successfully."
    }