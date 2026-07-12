from datetime import datetime, timezone
from fastapi import HTTPException, status
from app.database.connection import get_database
from app.models.user_model import UserModel
from app.utils.constants import UserRole, UserStatus
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
from app.schemas.auth_schemas import VerifyOTPRequest
async def register_user(
    user_data: RegisterRequest
):
    """Register a new user."""
    db=get_database()
    existing_user = await db.users.find_one(
    {"email": user_data.email}
)   
    if existing_user:
        raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Email is already registered."
    )
        
    hashed_password = hash_password(user_data.password)
    new_user = UserModel(
        full_name=user_data.full_name,
        email=user_data.email,
        phone_number=user_data.phone_number,
        hashed_password=hashed_password,
        role=UserRole.USER,
        status=UserStatus.ACTIVE,
        is_email_verified=False,
        last_login=None
)
    await db.users.insert_one(
        new_user.dict()
    )
    otp = generate_otp()
    logger.info(f"Generated OTP: {otp}")
    # Create OTP document
   # Create OTP document
    otp_record = OTPModel(
    email=user_data.email,
        otp=otp
)

    logger.info(f"OTP Record: {otp_record}")

    # Save OTP to MongoDB
    await db.otp_verifications.insert_one(
    otp_record.model_dump()
)

    logger.info("OTP saved successfully.")

# Send OTP email
    send_otp_email(
    recipient_email=user_data.email,
    otp=otp
)

    logger.info("OTP email sent successfully.")
    
    logger.info(
    f"New user registered: {user_data.email}"
)
    return {
    "message": "User registered successfully. Please verify your email using the OTP sent to your email address."
}
async def login_user(user_data: LoginRequest):
    """Authenticate a user and generate an access token."""
    db = get_database()
    # Find user by email
    user = await db.users.find_one(
        {"email": user_data.email}
    )

    # Check if user exists
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    # Verify password
    if not verify_password(
        user_data.password,
        user["hashed_password"]
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )
    # Check account status
    if user["status"] != UserStatus.ACTIVE:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account is inactive."
        )
    # Generate JWT access token
    access_token = create_access_token(
        {
            "sub": user["email"],
            "role": user["role"]
        }
    )
    # Update last login time
    await db.users.update_one(
        {"_id": user["_id"]},
        {
            "$set": {
                "last_login": datetime.now(timezone.utc)
            }
        }
    )

    logger.info(
        f"User logged in successfully: {user['email']}"
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }
async def verify_otp(
    otp_data: VerifyOTPRequest
):
    """Verify the user's email OTP."""

    db = get_database()

    print("Email received:", repr(otp_data.email))
    print("OTP received:", repr(otp_data.otp))

    otp_record = await db.otp_verifications.find_one(
    {
        "email": otp_data.email,
        "otp": otp_data.otp
    }
)
    print("MongoDB result:", otp_record)
    if not otp_record:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid OTP."
        )
    # Check if OTP has already been used
    if otp_record["used"]:
        raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="OTP has already been used."
    )
# Check if OTP has expired
    expiry_time = otp_record["expires_at"]

    # Make MongoDB datetime timezone-aware if needed
    if expiry_time.tzinfo is None:
        expiry_time = expiry_time.replace(tzinfo=timezone.utc)

    if datetime.now(timezone.utc) > expiry_time:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OTP has expired."
        )
# Mark OTP as used
    await db.otp_verifications.update_one(
    {"_id": otp_record["_id"]},
    {
        "$set": {
            "used": True
        }
    }
)
# Mark user email as verified
    await db.users.update_one(
    {"email": otp_data.email},
    {
        "$set": {
            "is_email_verified": True
        }
    }
)
    logger.info(
        f"Email verified successfully: {otp_data.email}"
)
    return {
    "message": "Email verified successfully."
}
async def forgot_password(
    request: ForgotPasswordRequest
):
    """Generate and send an OTP for password reset."""
    db = get_database()

    # Check whether the user exists
    user = await db.users.find_one(
        {"email": request.email}
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User with this email does not exist."
        )

    # Generate a new OTP
    otp = generate_otp()

    # Create OTP document
    otp_record = OTPModel(
        email=request.email,
        otp=otp
    )
    # Save OTP in MongoDB
    await db.otp_verifications.insert_one(
        otp_record.model_dump()
    )
    # Send OTP email
    send_otp_email(
        recipient_email=request.email,
        otp=otp
    )
    logger.info(
        f"Password reset OTP sent to {request.email}"
    )
    return {
        "message": "Password reset OTP sent successfully."
    }
async def reset_password(
    request: ResetPasswordRequest
):
    """Reset the user's password after verifying the OTP."""
    db = get_database()
    # Find OTP record
    otp_record = await db.otp_verifications.find_one(
        {
            "email": request.email,
            "otp": request.otp
        }
    )
    # Check if OTP exists
    if not otp_record:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid OTP."
        )
    # Check if OTP has already been used
    if otp_record["used"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OTP has already been used."
        )
    # Check if OTP has expired
    expiry_time = otp_record["expires_at"]
    if expiry_time.tzinfo is None:
        expiry_time = expiry_time.replace(tzinfo=timezone.utc)
    if datetime.now(timezone.utc) > expiry_time:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OTP has expired."
        )
    # Hash the new password
    new_hashed_password = hash_password(
        request.new_password
    )

    # Update user password
    await db.users.update_one(
        {
            "email": request.email
        },
        {
            "$set": {
                "hashed_password": new_hashed_password
            }
        }
    )
    # Mark OTP as used
    await db.otp_verifications.update_one(
        {
            "_id": otp_record["_id"]
        },
        {
            "$set": {
                "used": True
            }
        }
    )
    logger.info(
        f"Password reset successfully for {request.email}"
    )
    return {
        "message": "Password reset successfully."
    }
async def resend_otp(
    request: ResendOTPRequest
):
    """Generate and resend a new OTP."""

    db = get_database()
    # Check whether the user exists
    user = await db.users.find_one(
        {
            "email": request.email
        }
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found."
        )
    # Mark all previous unused OTPs as used
    await db.otp_verifications.update_many(
        {
            "email": request.email,
            "used": False
        },
        {
            "$set": {
                "used": True
            }
        }
    )
    # Generate a new OTP
    otp = generate_otp()
    # Create a new OTP record
    otp_record = OTPModel(
        email=request.email,
        otp=otp
    )
    # Save the new OTP
    await db.otp_verifications.insert_one(
        otp_record.model_dump()
    )
    # Send the OTP email
    send_otp_email(
        recipient_email=request.email,
        otp=otp
    )

    logger.info(
        f"OTP resent successfully to {request.email}"
    )

    return {
        "message": "OTP resent successfully."
    }