from datetime import datetime, timedelta, timezone
from fastapi import HTTPException, status
from jose import JWTError, jwt
from app.core.config import settings
from app.schemas.token_schema import TokenPayload
# ==========================================================
# CREATE JWT ACCESS TOKEN
# =========================================================
def create_access_token(
    data: dict,
) -> str:
    """
    Create a JWT access token.
    """
    to_encode = data.copy()
    expire = (
        datetime.now(timezone.utc)
        + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    )
    to_encode.update(
        {
            "exp": expire,
        }
    )
    return jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM,
    )
# ==========================================================
# VERIFY JWT ACCESS TOKEN
# ==========================================================
def verify_access_token(
    token: str,
) -> TokenPayload:
    """
    Verify and decode a JWT access token.
    """
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[
                settings.ALGORITHM
            ],
        )
        return TokenPayload(
            **payload
        )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token.",
            headers={
                "WWW-Authenticate": "Bearer"
            },
        )