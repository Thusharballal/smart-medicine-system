from fastapi import APIRouter, Depends
from app.schemas.token_schema import TokenPayload
from app.schemas.user_schema import (
    UpdateUserRequest,
    UserProfileResponse,
    AdminUpdateUserRequest,
    AdminUserResponse,
)
from app.services.user_service import (
    update_user_profile,
    get_user_dashboard,
    get_user_profile,
    get_all_users,
    get_user_by_id,
    update_admin_user,
    deactivate_user,
    delete_user,
)
from app.core.security import (
    get_current_user,
    require_role,
)
from app.utils.constants import UserRole
# =========================================================
# ROUTER
# =========================================================
router = APIRouter(
    prefix="/api/v1/users",
    tags=["Users"],
)
# =========================================================
# USER DASHBOARD
# =========================================================
@router.get("/dashboard")
async def user_dashboard(
    current_user: TokenPayload = Depends(get_current_user),
):
    """Get dashboard details for the logged-in user."""
    return await get_user_dashboard(
        current_user
    )
# =========================================================
# GET CURRENT USER PROFILE
# =========================================================
@router.get(
    "/profile",
    response_model=UserProfileResponse,
)
async def get_profile(
    current_user: dict = Depends(get_current_user),
):
    """Get the profile of the logged-in user."""
    return await get_user_profile(
        current_user
    )
# =========================================================
# ADMIN - GET ALL USERS
# =========================================================
@router.get("/admin/all")
async def get_all_users_api(
    page: int = 1,
    page_size: int = 10,
    role: str | None = None,
    current_user: dict = Depends(
        require_role([UserRole.ADMIN])
    ),
):
    """
    Retrieve paginated users for the
    Admin Users page.
    Optional role filter:
        USER
        PHARMACY_OWNER
    """
    return await get_all_users(
        page=page,
        page_size=page_size,
        role=role,
    )
# =========================================================
# ADMIN - GET USER BY ID
# =========================================================
@router.get(
    "/admin/{user_id}",
    response_model=AdminUserResponse,
    summary="Get User By ID",
)
async def get_user_by_id_api(
    user_id: str,
    current_user: dict = Depends(
        require_role([UserRole.ADMIN])
    ),
):
    """Retrieve a specific user for Admin."""
    return await get_user_by_id(
        user_id
    )
# =========================================================
# ADMIN - UPDATE USER
# =========================================================
@router.put(
    "/admin/{user_id}",
    summary="Update User",
)
async def update_admin_user_api(
    user_id: str,
    update_data: AdminUpdateUserRequest,
    current_user: dict = Depends(
        require_role([UserRole.ADMIN])
    ),
):
    """Update another user's account as Admin."""
    return await update_admin_user(
        user_id,
        update_data,
        current_user,
    )
# =========================================================
# ADMIN - DEACTIVATE USER
# =========================================================
@router.patch(
    "/admin/{user_id}/deactivate",
    summary="Deactivate User",
)
async def deactivate_user_api(
    user_id: str,
    current_user: dict = Depends(
        require_role([UserRole.ADMIN])
    ),
):
    """Deactivate a user account."""
    return await deactivate_user(
        user_id,
        current_user,
    )
# =========================================================
# ADMIN - DELETE USER
# =========================================================
@router.delete(
    "/admin/{user_id}",
    summary="Delete User",
)
async def delete_user_api(
    user_id: str,
    current_user: dict = Depends(
        require_role([UserRole.ADMIN])
    ),
):
    """Permanently delete a user account."""
    return await delete_user(
        user_id,
        current_user,
    )
# =========================================================
# CURRENT USER - UPDATE PROFILE
# =========================================================
@router.put(
    "/me",
    response_model=UserProfileResponse,
    summary="Update Current User Profile",
)
async def update_me(
    update_data: UpdateUserRequest,
    current_user: dict = Depends(
        get_current_user
    ),
):
    """Update the profile of the currently logged-in user."""
    return await update_user_profile(
        current_user,
        update_data,
    )