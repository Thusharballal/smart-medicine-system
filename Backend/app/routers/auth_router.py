from fastapi import APIRouter

router = APIRouter(
    prefix="/api/v1/auth",
    tags=["Authentication"]
)


@router.get("/health")
async def authentication_health():
    """
    Health check endpoint for the Authentication module.
    """
    return {
        "success": True,
        "module": "Authentication",
        "message": "Authentication Router is Working Successfully"
    }