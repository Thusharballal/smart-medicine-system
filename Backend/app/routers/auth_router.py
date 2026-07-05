from fastapi import APIRouter, Depends
from app.schemas.token_schema import TokenPayload
from app.utils.jwt_helper import get_current_user
from app.schemas.auth_schemas import RegisterRequest
from app.services.auth_service import register_user
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