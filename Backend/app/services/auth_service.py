from datetime import datetime, timezone
from fastapi import HTTPException, status
from app.database.connection import get_database
from app.models.user_model import UserModel
from app.utils.constants import (
    UserRole,
    UserStatus,
    PharmacyStatus,
)
from app.schemas.auth_schemas import (
    RegisterRequest,
    LoginRequest,
    VerifyOTPRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    ResendOTPRequest,
)
from app.utils.password import (
    hash_password,
    verify_password,
)
from app.utils.jwt_helper import create_access_token
from app.utils.logger import logger
from app.models.otp_model import OTPModel
from app.utils.email_helper import (
    generate_otp,
    send_otp_email,
)
# =========================================================
# USER REGISTRATION
# =========================================================
async def register_user(
    user_data: RegisterRequest
):
    """Register a new user."""
    db = get_database()
    existing_user = await db.users.find_one(
        {
            "email": user_data.email
        }
    )

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is already registered.",
        )
    hashed_password = hash_password(
        user_data.password
    )
    new_user = UserModel(
        full_name=user_data.full_name,
        email=user_data.email,
        phone_number=user_data.phone_number,
        hashed_password=hashed_password,
        role=UserRole.USER,
        status=UserStatus.ACTIVE,
        is_email_verified=False,
        last_login=None,
    )

    await db.users.insert_one(
        new_user.dict()
    )

    # -----------------------------------------------------
    # Generate OTP
    # -----------------------------------------------------
    otp = generate_otp()
    logger.info(
        f"Generated OTP: {otp}"
    )

    # -----------------------------------------------------
    # Create OTP document
    # -----------------------------------------------------
    otp_record = OTPModel(
        email=user_data.email,
        otp=otp,
    )

    logger.info(
        f"OTP Record: {otp_record}"
    )
    # -----------------------------------------------------
    # Save OTP
    # -----------------------------------------------------
    await db.otp_verifications.insert_one(
        otp_record.model_dump()
    )
    logger.info(
        "OTP saved successfully."
    )
    # -----------------------------------------------------
    # Send OTP email
    # -----------------------------------------------------
    send_otp_email(
        recipient_email=user_data.email,
        otp=otp,
    )
    logger.info(
        "OTP email sent successfully."
    )
    logger.info(
        f"New user registered: {user_data.email}"
    )
    return {
        "message": (
            "User registered successfully. "
            "Please verify your email using the OTP "
            "sent to your email address."
        )
    }
## =========================================================
# LOGIN
# =========================================================

async def login_user(
    user_data: LoginRequest
):
    """
    Authenticate USER, ADMIN, or PHARMACY_OWNER.

    USER / ADMIN:
        Authenticated from users collection.

    PHARMACY_OWNER:
        Authenticated from pharmacies collection.

    Returns JWT access token after successful authentication.
    """

    db = get_database()

    # =====================================================
    # STEP 1 - CHECK USERS COLLECTION
    # =====================================================

    user = await db.users.find_one(
        {
            "email": user_data.email
        }
    )

    if user:

        logger.info(
            f"Login attempt for user: {user_data.email}"
        )

        # -------------------------------------------------
        # VERIFY PASSWORD
        # -------------------------------------------------

        if not verify_password(
            user_data.password,
            user["hashed_password"],
        ):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password.",
            )

        logger.info(
            "Password verified successfully."
        )

        # -------------------------------------------------
        # CHECK USER STATUS
        # -------------------------------------------------

        user_status = str(
            user.get(
                "status",
                UserStatus.ACTIVE.value,
            )
        ).upper()

        if user_status != UserStatus.ACTIVE.value:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your account is inactive.",
            )

        # -------------------------------------------------
        # GET ROLE
        # -------------------------------------------------

        user_role = user.get(
            "role",
            UserRole.USER.value,
        )

        if hasattr(user_role, "value"):
            user_role = user_role.value

        user_role = str(user_role)

        logger.info(
            f"User role: {user_role}"
        )

        # -------------------------------------------------
        # GENERATE JWT
        # -------------------------------------------------

        logger.info(
            "Generating JWT access token..."
        )

        access_token = create_access_token(
            {
                "sub": user["email"],
                "role": user_role,
            }
        )

        logger.info(
            "JWT access token generated successfully."
        )

        # -------------------------------------------------
        # UPDATE LAST LOGIN
        #
        # IMPORTANT:
        # Do not allow this non-critical operation to
        # prevent successful login.
        # -------------------------------------------------

        try:

            await db.users.update_one(
                {
                    "_id": user["_id"]
                },
                {
                    "$set": {
                        "last_login": datetime.now(
                            timezone.utc
                        )
                    }
                },
            )

            logger.info(
                "Last login updated successfully."
            )

        except Exception as update_error:

            logger.error(
                f"Failed to update last_login: "
                f"{update_error}"
            )

        # -------------------------------------------------
        # RETURN TOKEN
        # -------------------------------------------------

        logger.info(
            f"User logged in successfully: "
            f"{user['email']}"
        )

        return {
            "access_token": access_token,
            "token_type": "bearer",
        }

    # =====================================================
    # STEP 2 - CHECK PHARMACIES COLLECTION
    # =====================================================

    pharmacy = await db.pharmacies.find_one(
        {
            "email": user_data.email
        }
    )

    if pharmacy:

        logger.info(
            f"Pharmacy login attempt: "
            f"{user_data.email}"
        )

        # -------------------------------------------------
        # VERIFY PASSWORD
        # -------------------------------------------------

        if not verify_password(
            user_data.password,
            pharmacy["hashed_password"],
        ):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password.",
            )

        # -------------------------------------------------
        # CHECK PHARMACY STATUS
        # -------------------------------------------------

        pharmacy_status = str(
            pharmacy.get(
                "status",
                PharmacyStatus.PENDING.value,
            )
        ).upper()

        # -------------------------------------------------
        # PENDING
        # -------------------------------------------------

        if pharmacy_status == PharmacyStatus.PENDING.value:

            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    "Your pharmacy registration is "
                    "still pending admin approval."
                ),
            )

        # -------------------------------------------------
        # REJECTED
        # -------------------------------------------------

        if pharmacy_status == PharmacyStatus.REJECTED.value:

            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    "Your pharmacy registration has "
                    "been rejected by the administrator."
                ),
            )

        # -------------------------------------------------
        # SUSPENDED
        # -------------------------------------------------

        if pharmacy_status == PharmacyStatus.SUSPENDED.value:

            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    "Your pharmacy account has "
                    "been suspended."
                ),
            )

        # -------------------------------------------------
        # ONLY APPROVED PHARMACY CAN LOGIN
        # -------------------------------------------------

        if pharmacy_status != PharmacyStatus.APPROVED.value:

            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    "Your pharmacy account is "
                    "not active."
                ),
            )

        # -------------------------------------------------
        # GENERATE PHARMACY JWT
        # -------------------------------------------------

        logger.info(
            "Generating pharmacy JWT access token..."
        )

        access_token = create_access_token(
            {
                "sub": pharmacy["email"],
                "role": UserRole.PHARMACY_OWNER.value,
            }
        )

        logger.info(
            "Pharmacy JWT access token generated successfully."
        )

        # -------------------------------------------------
        # UPDATE LAST LOGIN
        # -------------------------------------------------

        try:

            await db.pharmacies.update_one(
                {
                    "_id": pharmacy["_id"]
                },
                {
                    "$set": {
                        "last_login": datetime.now(
                            timezone.utc
                        )
                    }
                },
            )

            logger.info(
                "Pharmacy last login updated successfully."
            )

        except Exception as update_error:

            logger.error(
                f"Failed to update pharmacy last_login: "
                f"{update_error}"
            )

        # -------------------------------------------------
        # RETURN TOKEN
        # -------------------------------------------------

        logger.info(
            f"Pharmacy owner logged in successfully: "
            f"{pharmacy['email']}"
        )

        return {
            "access_token": access_token,
            "token_type": "bearer",
        }

    # =====================================================
    # STEP 3 - NO ACCOUNT
    # =====================================================

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid email or password.",
    )
# =========================================================
# VERIFY OTP
# =========================================================
async def verify_otp(
    otp_data: VerifyOTPRequest
):
    """Verify the user's email OTP."""
    db = get_database()
    print(
        "Email received:",
        repr(otp_data.email)
    )
    print(
        "OTP received:",
        repr(otp_data.otp)
    )
    otp_record = await db.otp_verifications.find_one(
        {
            "email": otp_data.email,
            "otp": otp_data.otp,
        }
    )
    print(
        "MongoDB result:",
        otp_record
    )
    if not otp_record:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid OTP.",
        )
    # -----------------------------------------------------
    # Check whether OTP has already been used
    # -----------------------------------------------------
    if otp_record["used"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OTP has already been used.",
        )
    # -----------------------------------------------------
    # Check OTP expiry
    # -----------------------------------------------------
    expiry_time = otp_record["expires_at"]
    if expiry_time.tzinfo is None:
        expiry_time = expiry_time.replace(
            tzinfo=timezone.utc
        )
    if datetime.now(timezone.utc) > expiry_time:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OTP has expired.",
        )
    # =====================================================
    # Registration Flow
    # =====================================================
    if otp_data.flow == "register":
        await db.otp_verifications.update_one(
            {
                "_id": otp_record["_id"]
            },
            {
                "$set": {
                    "used": True
                }
            },
        )
        await db.users.update_one(
            {
                "email": otp_data.email
            },
            {
                "$set": {
                    "is_email_verified": True
                }
            },
        )
    # =====================================================
    # Forgot Password Flow
    # =====================================================
    elif otp_data.flow == "reset":
        # Only verify OTP.
        # Do NOT mark it as used here.
        pass
    logger.info(
        f"Email verified successfully: "
        f"{otp_data.email}"
    )
    return {
        "message": "Email verified successfully."
    }
# =========================================================
# FORGOT PASSWORD
# =========================================================
async def forgot_password(
    request: ForgotPasswordRequest
):
    """Generate and send an OTP for password reset."""

    db = get_database()
    # -----------------------------------------------------
    # Check whether user exists
    # -----------------------------------------------------
    user = await db.users.find_one(
        {
            "email": request.email
        }
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User with this email does not exist.",
        )
    # -----------------------------------------------------
    # Generate OTP
    # -----------------------------------------------------

    otp = generate_otp()

    otp_record = OTPModel(
        email=request.email,
        otp=otp,
    )

    # -----------------------------------------------------
    # Save OTP
    # -----------------------------------------------------

    await db.otp_verifications.insert_one(
        otp_record.model_dump()
    )

    # -----------------------------------------------------
    # Send OTP
    # -----------------------------------------------------

    send_otp_email(
        recipient_email=request.email,
        otp=otp,
    )

    logger.info(
        f"Password reset OTP sent to "
        f"{request.email}"
    )

    return {
        "message": (
            "Password reset OTP sent successfully."
        )
    }


# =========================================================
# RESET PASSWORD
# =========================================================

async def reset_password(
    request: ResetPasswordRequest
):
    """Reset the user's password after OTP verification."""

    db = get_database()

    # -----------------------------------------------------
    # Find OTP
    # -----------------------------------------------------

    otp_record = await db.otp_verifications.find_one(
        {
            "email": request.email,
            "otp": request.otp,
        }
    )

    if not otp_record:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid OTP.",
        )

    # -----------------------------------------------------
    # Check whether OTP was used
    # -----------------------------------------------------

    if otp_record["used"]:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OTP has already been used.",
        )

    # -----------------------------------------------------
    # Check OTP expiry
    # -----------------------------------------------------

    expiry_time = otp_record["expires_at"]

    if expiry_time.tzinfo is None:
        expiry_time = expiry_time.replace(
            tzinfo=timezone.utc
        )

    if datetime.now(timezone.utc) > expiry_time:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OTP has expired.",
        )

    # -----------------------------------------------------
    # Hash new password
    # -----------------------------------------------------

    new_hashed_password = hash_password(
        request.new_password
    )

    # -----------------------------------------------------
    # Update USER password
    # -----------------------------------------------------

    await db.users.update_one(
        {
            "email": request.email
        },
        {
            "$set": {
                "hashed_password":
                    new_hashed_password
            }
        },
    )

    # -----------------------------------------------------
    # Mark OTP as used
    # -----------------------------------------------------

    await db.otp_verifications.update_one(
        {
            "_id": otp_record["_id"]
        },
        {
            "$set": {
                "used": True
            }
        },
    )

    logger.info(
        f"Password reset successfully for "
        f"{request.email}"
    )

    return {
        "message": "Password reset successfully."
    }


# =========================================================
# RESEND OTP
# =========================================================

async def resend_otp(
    request: ResendOTPRequest
):
    """Generate and resend a new OTP."""

    db = get_database()

    # -----------------------------------------------------
    # Check whether user exists
    # -----------------------------------------------------

    user = await db.users.find_one(
        {
            "email": request.email
        }
    )

    if not user:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )

    # -----------------------------------------------------
    # Mark previous unused OTPs as used
    # -----------------------------------------------------

    await db.otp_verifications.update_many(
        {
            "email": request.email,
            "used": False,
        },
        {
            "$set": {
                "used": True
            }
        },
    )

    # -----------------------------------------------------
    # Generate new OTP
    # -----------------------------------------------------

    otp = generate_otp()

    otp_record = OTPModel(
        email=request.email,
        otp=otp,
    )

    # -----------------------------------------------------
    # Save new OTP
    # -----------------------------------------------------

    await db.otp_verifications.insert_one(
        otp_record.model_dump()
    )

    # -----------------------------------------------------
    # Send OTP email
    # -----------------------------------------------------

    send_otp_email(
        recipient_email=request.email,
        otp=otp,
    )

    logger.info(
        f"OTP resent successfully to "
        f"{request.email}"
    )

    return {
        "message": "OTP resent successfully."
    }