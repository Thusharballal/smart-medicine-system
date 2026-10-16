from fastapi import APIRouter, Depends

from app.services.admin_service import (
    get_all_pharmacies,
    get_pharmacy_by_id,
    approve_pharmacy,
    reject_pharmacy,
    suspend_pharmacy,
    activate_pharmacy,
    get_all_users,
    get_user_by_id,
)

from app.core.security import (
    get_current_user,
    require_role,
)


router = APIRouter(
    prefix="/admin",
    tags=["Admin"],
)


# ============================================================
# ADMIN ACCESS
# ============================================================

admin_dependency = Depends(
    require_role(["ADMIN"])
)


# ============================================================
# PHARMACY MANAGEMENT
# ============================================================

@router.get(
    "/pharmacies",
    dependencies=[admin_dependency],
)
async def list_pharmacies():
    """
    Get all registered pharmacies.
    Accessible only to ADMIN.
    """
    return await get_all_pharmacies()


@router.get(
    "/pharmacies/{pharmacy_id}",
    dependencies=[admin_dependency],
)
async def pharmacy_details(pharmacy_id: str):
    """
    Get details of a specific pharmacy.
    Accessible only to ADMIN.
    """
    return await get_pharmacy_by_id(pharmacy_id)


@router.put(
    "/pharmacies/{pharmacy_id}/approve",
)
async def approve_pharmacy_registration(
    pharmacy_id: str,
    current_user: dict = Depends(
        require_role(["ADMIN"])
    ),
):
    """
    Approve a pharmacy registration.

    Changes:
        PENDING → APPROVED

    Also records the admin who approved the pharmacy.
    """

    admin_user_id = current_user["email"]

    pharmacy = await approve_pharmacy(
        pharmacy_id,
        admin_user_id,
    )

    return {
        "message": "Pharmacy approved successfully.",
        "pharmacy": pharmacy,
    }


@router.put(
    "/pharmacies/{pharmacy_id}/reject",
    dependencies=[admin_dependency],
)
async def reject_pharmacy_registration(
    pharmacy_id: str,
):
    """
    Reject a pharmacy registration.

    Changes:
        PENDING → REJECTED
    """

    pharmacy = await reject_pharmacy(pharmacy_id)
    return {
        "message": "Pharmacy rejected successfully.",
        "pharmacy": pharmacy,
    }

@router.put(
    "/pharmacies/{pharmacy_id}/suspend",
    dependencies=[admin_dependency],
)
async def suspend_pharmacy_account(
    pharmacy_id: str,
):
    """
    Suspend a pharmacy.

    Changes:
        APPROVED → SUSPENDED
    """
    pharmacy = await suspend_pharmacy(pharmacy_id)
    return {
        "message": "Pharmacy suspended successfully.",
        "pharmacy": pharmacy,
    }


@router.put(
    "/pharmacies/{pharmacy_id}/activate",
    dependencies=[admin_dependency],
)
async def activate_pharmacy_account(
    pharmacy_id: str,
):
    """
    Activate a pharmacy.
    Changes:
        SUSPENDED / REJECTED → APPROVED
    """

    pharmacy = await activate_pharmacy(pharmacy_id)

    return {
        "message": "Pharmacy activated successfully.",
        "pharmacy": pharmacy,
    }


# ============================================================
# USER MANAGEMENT
# ============================================================

@router.get(
    "/users",
    dependencies=[admin_dependency],
)
async def list_users():
    """
    Get all registered users.
    Accessible only to ADMIN.
    """
    return await get_all_users()


@router.get(
    "/users/{user_id}",
    dependencies=[admin_dependency],
)
async def user_details(user_id: str):
    """
    Get details of a specific user.
    Accessible only to ADMIN.
    """
    return await get_user_by_id(user_id)