from datetime import datetime, timezone
from bson import ObjectId
from fastapi import HTTPException, status

from app.database.connection import get_database

from app.schemas.user_schema import (
    UserDashboardResponse,
    UserProfileResponse,
    UpdateUserRequest,
)

from app.utils.constants import (
    UserRole,
    UserStatus,
)


# =========================================================
# USER DASHBOARD
# =========================================================

async def get_user_dashboard(current_user):
    """Get dashboard data for the logged-in user."""

    db = get_database()

    # Get latest user document
    user = await db.users.find_one(
        {
            "email": current_user["email"]
        }
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )

    return UserDashboardResponse(
        full_name=user["full_name"],
        email=user["email"],
        total_searches=0,
        saved_medicines=0,
        nearby_pharmacies=0,
        recent_activity=[],
    )


# =========================================================
# USER PROFILE
# =========================================================

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


# =========================================================
# UPDATE CURRENT USER PROFILE
# =========================================================

async def update_user_profile(
    current_user: dict,
    update_data: UpdateUserRequest,
):
    """Update the profile of the logged-in user."""

    db = get_database()

    # Update only editable fields
    await db.users.update_one(
        {
            "email": current_user["email"]
        },
        {
            "$set": {
                "full_name": update_data.full_name,
                "phone_number": update_data.phone_number,
            }
        },
    )

    # Fetch the updated document
    updated_user = await db.users.find_one(
        {
            "email": current_user["email"]
        }
    )

    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )

    return UserProfileResponse(
        full_name=updated_user["full_name"],
        email=updated_user["email"],
        phone_number=updated_user["phone_number"],
        role=updated_user["role"],
        status=updated_user["status"],
        is_email_verified=updated_user["is_email_verified"],
    )


# =========================================================
# ADMIN - GET USERS WITH ROLE FILTER + PAGINATION
# =========================================================

async def get_all_users(
    page: int = 1,
    page_size: int = 10,
    role: str | None = None,
):
    """
    Retrieve paginated users for the Admin Users page.

    Optional role filter:
        USER
        PHARMACY_OWNER

    Pagination:
        page      -> Current page number
        page_size -> Number of users per page
    """

    db = get_database()

    # -----------------------------------------------------
    # Validate page
    # -----------------------------------------------------

    if page < 1:
        page = 1

    # -----------------------------------------------------
    # Validate page size
    # -----------------------------------------------------

    if page_size < 1:
        page_size = 10

    if page_size > 100:
        page_size = 100

    # -----------------------------------------------------
    # Build query
    # -----------------------------------------------------

    query = {}

    if role:
        role = str(role).upper()

        allowed_roles = [
            UserRole.USER.value,
            UserRole.PHARMACY_OWNER.value,
        ]

        if role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid user role filter.",
            )

        query["role"] = role

    # -----------------------------------------------------
    # Calculate skip
    # -----------------------------------------------------

    skip = (page - 1) * page_size

    # -----------------------------------------------------
    # Count matching users
    # -----------------------------------------------------

    total_users = await db.users.count_documents(
        query
    )

    # -----------------------------------------------------
    # Fetch requested page
    # -----------------------------------------------------

    users = await (
        db.users
        .find(query)
        .sort("created_at", -1)
        .skip(skip)
        .limit(page_size)
        .to_list(length=page_size)
    )

    # -----------------------------------------------------
    # Format users
    # -----------------------------------------------------

    results = []

    for user in users:
        user["id"] = str(user["_id"])
        del user["_id"]

        # Never send authentication credentials
        # to the frontend.
        user.pop("password_hash", None)
        user.pop("hashed_password", None)

        results.append(user)

    # -----------------------------------------------------
    # Calculate total pages
    # -----------------------------------------------------

    if total_users > 0:
        total_pages = (
            total_users + page_size - 1
        ) // page_size
    else:
        total_pages = 0

    # -----------------------------------------------------
    # Return paginated response
    # -----------------------------------------------------

    return {
        "users": results,

        "pagination": {
            "page": page,
            "page_size": page_size,
            "total_users": total_users,
            "total_pages": total_pages,
        },
    }


# =========================================================
# ADMIN - GET USER BY ID
# =========================================================

async def get_user_by_id(user_id: str):
    """Retrieve a single user for Admin viewing."""

    db = get_database()

    try:
        object_id = ObjectId(user_id)

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID.",
        )

    user = await db.users.find_one(
        {
            "_id": object_id
        }
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )

    user["id"] = str(user["_id"])
    del user["_id"]

    # Never expose authentication credentials
    user.pop("password_hash", None)
    user.pop("hashed_password", None)

    return user


# =========================================================
# ADMIN ACTION VALIDATION
# =========================================================

async def ensure_admin_action_allowed(
    target_user: dict,
    current_user: dict,
    new_role: str | None = None,
    new_status: str | None = None,
):
    """
    Validate whether an Admin is allowed to modify
    the target user's account.

    Rules:
    1. An admin cannot modify their own account
       through Admin Users.
    2. Normal users cannot be promoted to Admin
       through the general user update operation.
    3. Existing Admins cannot be demoted through
       the general user update operation.
    4. The last active admin cannot be removed
       from active-admin status.
    """

    # -----------------------------------------------------
    # Rule 1: Prevent admin from modifying own account
    # -----------------------------------------------------

    if target_user.get("email") == current_user.get("email"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "You cannot modify your own account "
                "from Admin Users."
            ),
        )

    # -----------------------------------------------------
    # Normalize values
    # -----------------------------------------------------

    current_role = target_user.get("role")
    current_status = target_user.get("status")

    final_role = (
        new_role
        if new_role is not None
        else current_role
    )

    final_status = (
        new_status
        if new_status is not None
        else current_status
    )

    # -----------------------------------------------------
    # Rule 2: Prevent promotion to Admin
    # -----------------------------------------------------

    if (
        final_role == UserRole.ADMIN.value
        and current_role != UserRole.ADMIN.value
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "Promoting a user to Admin is not "
                "allowed from Admin Users."
            ),
        )

    # -----------------------------------------------------
    # Rule 3: Prevent demotion of existing Admin
    # -----------------------------------------------------

    if (
        current_role == UserRole.ADMIN.value
        and final_role != UserRole.ADMIN.value
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "Demoting an Admin is not allowed "
                "from Admin Users."
            ),
        )

    # -----------------------------------------------------
    # Check whether target is active admin
    # -----------------------------------------------------

    target_is_active_admin = (
        current_role == UserRole.ADMIN.value
        and current_status == UserStatus.ACTIVE.value
    )

    # -----------------------------------------------------
    # Determine whether target remains active admin
    # -----------------------------------------------------

    final_is_active_admin = (
        final_role == UserRole.ADMIN.value
        and final_status == UserStatus.ACTIVE.value
    )

    # -----------------------------------------------------
    # Rule 4: Protect last active admin
    # -----------------------------------------------------

    if (
        target_is_active_admin
        and not final_is_active_admin
    ):
        db = get_database()

        active_admin_count = (
            await db.users.count_documents(
                {
                    "role": UserRole.ADMIN.value,
                    "status": UserStatus.ACTIVE.value,
                }
            )
        )

        if active_admin_count <= 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "You cannot remove the last "
                    "active admin."
                ),
            )


# =========================================================
# ADMIN - UPDATE USER
# =========================================================

async def update_admin_user(
    user_id: str,
    update_data,
    current_user: dict,
):
    """Allow an Admin to update another user's account."""

    db = get_database()

    try:
        object_id = ObjectId(user_id)

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID.",
        )

    # -----------------------------------------------------
    # Find target user
    # -----------------------------------------------------

    existing_user = await db.users.find_one(
        {
            "_id": object_id
        }
    )

    if not existing_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )

    # -----------------------------------------------------
    # Convert request to dictionary
    # -----------------------------------------------------

    update_fields = update_data.model_dump()

    # Convert Enum values to strings
    new_role = update_fields["role"].value
    new_status = update_fields["status"].value

    # -----------------------------------------------------
    # Validate admin action
    # -----------------------------------------------------

    await ensure_admin_action_allowed(
        target_user=existing_user,
        current_user=current_user,
        new_role=new_role,
        new_status=new_status,
    )

    # -----------------------------------------------------
    # Update database
    # -----------------------------------------------------

    await db.users.update_one(
        {
            "_id": object_id
        },
        {
            "$set": {
                "full_name": update_fields["full_name"],
                "phone_number": update_fields["phone_number"],
                "role": new_role,
                "status": new_status,
                "updated_at": datetime.now(timezone.utc),
            }
        },
    )

    return {
        "message": "User updated successfully."
    }


# =========================================================
# ADMIN - DEACTIVATE USER
# =========================================================

async def deactivate_user(
    user_id: str,
    current_user: dict,
):
    """Suspend a user account instead of permanently deleting it."""

    db = get_database()

    try:
        object_id = ObjectId(user_id)

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID.",
        )

    # -----------------------------------------------------
    # Find target user
    # -----------------------------------------------------

    existing_user = await db.users.find_one(
        {
            "_id": object_id
        }
    )

    if not existing_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )

    # -----------------------------------------------------
    # Validate admin action
    # -----------------------------------------------------

    await ensure_admin_action_allowed(
        target_user=existing_user,
        current_user=current_user,
        new_status=UserStatus.SUSPENDED.value,
    )

    # -----------------------------------------------------
    # Suspend user
    # -----------------------------------------------------

    await db.users.update_one(
        {
            "_id": object_id
        },
        {
            "$set": {
                "status": UserStatus.SUSPENDED.value,
                "updated_at": datetime.now(timezone.utc),
            }
        },
    )

    return {
        "message": "User deactivated successfully."
    }


# =========================================================
# ADMIN - DELETE USER
# =========================================================

async def delete_user(
    user_id: str,
    current_user: dict,
):
    """Permanently delete a user account."""

    db = get_database()

    try:
        object_id = ObjectId(user_id)

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID.",
        )

    # -----------------------------------------------------
    # Find target user
    # -----------------------------------------------------

    existing_user = await db.users.find_one(
        {
            "_id": object_id
        }
    )

    if not existing_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )

    # -----------------------------------------------------
    # Validate admin action
    # -----------------------------------------------------

    await ensure_admin_action_allowed(
        target_user=existing_user,
        current_user=current_user,
        new_status=UserStatus.DELETED.value,
    )

    # -----------------------------------------------------
    # Permanently delete user
    # -----------------------------------------------------

    await db.users.delete_one(
        {
            "_id": object_id
        }
    )

    return {
        "message": "User deleted successfully."
    }