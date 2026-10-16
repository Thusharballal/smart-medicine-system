from typing import List

from fastapi import Depends, HTTPException, status
from fastapi.security import (
    HTTPBearer,
    HTTPAuthorizationCredentials,
)

from app.database.connection import get_database
from app.utils.jwt_helper import verify_access_token
from app.utils.constants import (
    UserRole,
    UserStatus,
    PharmacyStatus,
)


# ==========================================================
# HTTP BEARER SECURITY
# ==========================================================

security = HTTPBearer()


# ==========================================================
# GET CURRENT AUTHENTICATED USER
# ==========================================================

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(
        security
    ),
):
    """
    Authenticate both normal users and pharmacy owners.

    The JWT contains the email in the `sub` field.

    The function first searches the users collection.
    If the account is not found there, it searches the
    pharmacies collection.

    Returns the original MongoDB document with `_id`
    intact so backend services can use ObjectId.
    """

    print("==================================================")
    print("🔐 get_current_user() STARTED")
    print("==================================================")

    # ------------------------------------------------------
    # Get JWT token
    # ------------------------------------------------------

    token = credentials.credentials

    print("🔑 JWT token received")

    # ------------------------------------------------------
    # Verify JWT
    # ------------------------------------------------------

    try:
        payload = verify_access_token(token)

        print("✅ JWT verified")

    except Exception as error:

        print("❌ JWT verification failed:", error)

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token.",
        )

    # ------------------------------------------------------
    # Get Database
    # ------------------------------------------------------

    database = get_database()

    print("🗄️ Database object:", database)

    if database is None:

        print("❌ Database connection is not available")

        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database connection is not available.",
        )

    # ------------------------------------------------------
    # Get Email From JWT
    # ------------------------------------------------------

    email = payload.sub

    print("📧 Email from JWT:", email)

    if not email:

        print("❌ Email missing from JWT")

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token.",
        )

    # ======================================================
    # 1. SEARCH NORMAL USERS
    # ======================================================

    print("🔎 Searching users collection...")

    try:

        user = await database.users.find_one(
            {
                "email": email
            }
        )

    except Exception as error:

        print(
            "❌ MongoDB users query failed:",
            error,
        )

        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Unable to access user database.",
        )

    print(
        "👤 MongoDB user found:",
        user is not None,
    )

    # ------------------------------------------------------
    # User Found
    # ------------------------------------------------------

    if user is not None:

        # --------------------------------------------------
        # Check User Status
        # --------------------------------------------------

        user_status = str(
            user.get(
                "status",
                UserStatus.ACTIVE.value,
            )
        ).upper()

        print(
            "📊 User status:",
            user_status,
        )

        # --------------------------------------------------
        # Suspended
        # --------------------------------------------------

        if user_status == UserStatus.SUSPENDED.value:

            print("🚫 User account suspended")

            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your account has been suspended.",
            )

        # --------------------------------------------------
        # Deleted
        # --------------------------------------------------

        if user_status == UserStatus.DELETED.value:

            print("🚫 User account deleted")

            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your account is no longer active.",
            )

        # --------------------------------------------------
        # Other Inactive Status
        # --------------------------------------------------

        if user_status != UserStatus.ACTIVE.value:

            print(
                "🚫 User account is not active:",
                user_status,
            )

            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your account is not active.",
            )

        # --------------------------------------------------
        # User Authentication Successful
        # --------------------------------------------------

        print("✅ User authentication successful")
        print("👤 Role:", user.get("role"))
        print("🆔 User ID:", user.get("_id"))

        print("==================================================")

        return user

    # ======================================================
    # 2. SEARCH PHARMACY OWNERS
    # ======================================================

    print(
        "🔎 User not found. "
        "Searching pharmacies collection..."
    )

    try:

        pharmacy = await database.pharmacies.find_one(
            {
                "email": email
            }
        )

    except Exception as error:

        print(
            "❌ MongoDB pharmacies query failed:",
            error,
        )

        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Unable to access pharmacy database.",
        )

    print(
        "🏥 MongoDB pharmacy found:",
        pharmacy is not None,
    )

    # ------------------------------------------------------
    # Pharmacy Not Found
    # ------------------------------------------------------

    if pharmacy is None:

        print("❌ User/pharmacy not found")

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authenticated account not found.",
        )
    # ------------------------------------------------------
    # Check Pharmacy Status
    # ------------------------------------------------------
    pharmacy_status = str(
        pharmacy.get(
            "status",
            PharmacyStatus.PENDING.value,
        )
    ).upper()
    print(
        "🏥 Pharmacy status:",
        pharmacy_status,
    )
    # ------------------------------------------------------
    # Pending
    # ------------------------------------------------------
    if pharmacy_status == PharmacyStatus.PENDING.value:
        print(
            "⏳ Pharmacy registration pending approval"
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "Your pharmacy registration is pending "
                "admin approval."
            ),
        )
    # ------------------------------------------------------
    # Rejected
    # ------------------------------------------------------
    if pharmacy_status == PharmacyStatus.REJECTED.value:
        print("🚫 Pharmacy registration rejected")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "Your pharmacy registration has been rejected."
            ),
        )
    # ------------------------------------------------------
    # Suspended
    # ------------------------------------------------------
    if pharmacy_status == PharmacyStatus.SUSPENDED.value:
        print("🚫 Pharmacy account suspended")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your pharmacy account has been suspended.",
        )
    # ------------------------------------------------------
    # Only Approved Pharmacies
    # ------------------------------------------------------
    if pharmacy_status != PharmacyStatus.APPROVED.value:
        print(
            "🚫 Pharmacy account is not active:",
            pharmacy_status,
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your pharmacy account is not active.",
        )
    # ------------------------------------------------------
    # Ensure Pharmacy Has Correct Role
    # ------------------------------------------------------
    pharmacy["role"] = UserRole.PHARMACY_OWNER.value
    print(
        "👤 Pharmacy role:",
        pharmacy["role"],
    )
    # ------------------------------------------------------
    # Pharmacy Authentication Successful
    # ------------------------------------------------------
    print(
        "✅ Pharmacy owner authentication successful"
    )
    print(
        "🆔 Pharmacy ID:",
        pharmacy.get("_id"),
    )
    print("==================================================")
    return pharmacy
# ==========================================================
# GET CURRENT AUTHENTICATED PHARMACY
# ==========================================================
async def get_current_pharmacy(
    credentials: HTTPAuthorizationCredentials = Depends(
        security
    ),
):
    """
    Authenticate the pharmacy owner directly.
    This dependency is used by pharmacy-specific APIs.
    The pharmacy must exist and have APPROVED status.
    Returns the original MongoDB pharmacy document
    with `_id` intact.
    """
    print("🏥 get_current_pharmacy() STARTED")
    # ------------------------------------------------------
    # Get JWT token
    # ------------------------------------------------------
    token = credentials.credentials
    # ------------------------------------------------------
    # Verify JWT
    # ------------------------------------------------------
    try:
        payload = verify_access_token(token)
    except Exception as error:
        print(
            "❌ Pharmacy JWT verification failed:",
            error,
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token.",
        )
    # ------------------------------------------------------
    # Get Database
    # ------------------------------------------------------
    database = get_database()
    if database is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database connection is not available.",
        )
    # -----------------------------------------------------
    # Get Email From JWT
    # ------------------------------------------------------
    email = payload.sub
    if not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token.",
        )
    # ------------------------------------------------------
    # Find Pharmacy
    # ------------------------------------------------------
    print(
        "🔎 Searching pharmacy:",
        email,
    )
    pharmacy = await database.pharmacies.find_one(
        {
            "email": email
        }
    )
    # ------------------------------------------------------
    # Pharmacy Not Found
    # ------------------------------------------------------
    if pharmacy is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Pharmacy not found.",
        )
    # ------------------------------------------------------
    # Pharmacy Status
    # ------------------------------------------------------
    pharmacy_status = str(
        pharmacy.get(
            "status",
            PharmacyStatus.PENDING.value,
        )
    ).upper()
    print(
        "🏥 Pharmacy status:",
        pharmacy_status,
    )
    # ------------------------------------------------------
    # Pending
    # ------------------------------------------------------
    if pharmacy_status == PharmacyStatus.PENDING.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "Your pharmacy registration is pending "
                "admin approval."
            ),
        )
    # ------------------------------------------------------
    # Rejected
    # ------------------------------------------------------
    if pharmacy_status == PharmacyStatus.REJECTED.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "Your pharmacy registration has been rejected."
            ),
        )
    # ------------------------------------------------------
    # Suspended
    # ------------------------------------------------------
    if pharmacy_status == PharmacyStatus.SUSPENDED.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your pharmacy account has been suspended.",
        )
    # ------------------------------------------------------
    # Only Approved Pharmacies
    # ------------------------------------------------------
    if pharmacy_status != PharmacyStatus.APPROVED.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your pharmacy account is not active.",
        )
    # ------------------------------------------------------
    # Return Original MongoDB Document
    # ------------------------------------------------------
    print("✅ Pharmacy authentication successful")
    return pharmacy
# ==========================================================
# ROLE-BASED ACCESS CONTROL
# ==========================================================
def require_role(
    allowed_roles: List[str],
):
    """
    Allow access only to users having one of the
    specified roles.
    Example:
        Depends(
            require_role(
                [
                    UserRole.ADMIN.value,
                    UserRole.PHARMACY_OWNER.value,
                ]
            )
        )
    """
    async def role_checker(
        current_user: dict = Depends(
            get_current_user
        ),
    ) -> dict:
        # --------------------------------------------------
        # Get Current User Role
        # --------------------------------------------------
        user_role = str(
            current_user.get(
                "role",
                "",
            )
        ).upper()
        # --------------------------------------------------
        # Normalize Allowed Roles
        # --------------------------------------------------
        normalized_roles = [
            str(role).upper()
            for role in allowed_roles
        ]
        print(
            "🔐 RBAC CHECK"
        )
        print(
            "👤 Current role:",
            user_role,
        )
        print(
            "✅ Allowed roles:",
            normalized_roles,
        )
        # --------------------------------------------------
        # Check Permission
        # --------------------------------------------------
        if user_role not in normalized_roles:
            print(
                "❌ RBAC ACCESS DENIED"
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    "You do not have permission "
                    "to perform this action."
                ),
            )
        # --------------------------------------------------
        # Access Granted
        # --------------------------------------------------
        print(
            "✅ RBAC ACCESS GRANTED"
        )
        return current_user
    return role_checker
# ==========================================================
# ADMIN ONLY
# ==========================================================
def require_admin():
    """
    Dependency for ADMIN-only endpoints.
    """
    return require_role(
        [
            UserRole.ADMIN.value,
        ]
    )
# ==========================================================
# USER OR ADMIN
# ==========================================================
def require_user_or_admin():
    """Dependency allowing USER and ADMIN roles."""
    return require_role(
        [
            UserRole.USER.value,
            UserRole.ADMIN.value,
        ]
    )
# ==========================================================
# PHARMACY OWNER OR ADMIN
# ==========================================================
def require_pharmacy_or_admin():
    """
    Dependency allowing PHARMACY_OWNER and ADMIN roles.
    """
    return require_role(
        [
            UserRole.PHARMACY_OWNER.value,
            UserRole.ADMIN.value,
        ]
    )