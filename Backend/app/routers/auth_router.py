from fastapi import APIRouter, Depends, status
from app.schemas.token_schema import TokenPayload
from app.schemas.auth_schemas import (
    RegisterRequest,
    LoginRequest,
    VerifyOTPRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    ResendOTPRequest,
    TokenResponse,
    MessageResponse,
)
from app.utils.jwt_helper import get_current_user
from app.services.auth_service import (
    register_user,
    login_user,
    verify_otp,
    forgot_password,
    reset_password,
    resend_otp,
)
router = APIRouter(
    prefix="/api/v1/auth",
    tags=["Authentication"]
)
@router.get("/health")
async def authentication_health():
    """Health check endpoint for the Authentication module."""
    return {
        "success": True,
        "module": "Authentication",
        "message": "Authentication Router is Working Successfully"
    }

@router.get("/me")
async def get_me(
    current_user: TokenPayload = Depends(get_current_user)
):
    return current_user

@router.post("/register")
async def register(
    user_data: RegisterRequest
):
    """Register a new user."""
    return await register_user(user_data)
@router.post(
    "/login",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    summary="User Login",
)
async def login(
    user_data: LoginRequest,
):
    """Authenticate a user and return a JWT access token."""
    return await login_user(user_data)
@router.post(
    "/verify-otp",
    response_model=MessageResponse,
    status_code=status.HTTP_200_OK,
    summary="Verify Email OTP"
)
async def verify_email_otp(
    otp_data: VerifyOTPRequest
):
    """Verify the OTP sent to the user's email."""
    return await verify_otp(otp_data)
@router.post(
    "/forgot-password",
    response_model=MessageResponse,
    status_code=status.HTTP_200_OK,
    summary="Forgot Password"
)
async def forgot_password_api(
    request: ForgotPasswordRequest
):
    """Send a password reset OTP to the user's email."""
    return await forgot_password(request)
@router.post(
    "/reset-password",
    response_model=MessageResponse,
    status_code=status.HTTP_200_OK,
    summary="Reset Password"
)
async def reset_password_api(
    request: ResetPasswordRequest
):
    """Reset the user's password after OTP verification."""
    return await reset_password(request)
@router.post(
    "/resend-otp",
    response_model=MessageResponse,
    status_code=status.HTTP_200_OK,
    summary="Resend OTP"
)
async def resend_otp_api(
    request: ResendOTPRequest
):
    """Generate and send a new OTP to the user's email."""
    return await resend_otp(request)