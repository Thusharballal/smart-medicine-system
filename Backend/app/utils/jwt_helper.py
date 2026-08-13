from datetime import datetime, timedelta, timezone
from app.utils.mongo_helper import serialize_mongo
from app.schemas.token_schema import TokenPayload
from bson import ObjectId
from app.database.connection import get_database
from fastapi import HTTPException, status
from jose import JWTError, jwt
from app.core.config import settings
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi import Depends
from typing import List
def create_access_token(data: dict) -> str:
    """Create a JWT access token."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(
    minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(
    to_encode,
    settings.SECRET_KEY,
    algorithm=settings.ALGORITHM
)
    return encoded_jwt
def verify_access_token(token: str) -> dict:
    """ Verify a JWT access token and return its payload."""
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        return TokenPayload(**payload)
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token."
    )
security = HTTPBearer()
security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    print("Authorization Header:", credentials)
    token = credentials.credentials
    print("Token:", token)
    payload = verify_access_token(token)
    print("Payload:", payload)
    database = get_database()
    user = await database.users.find_one({"email": payload.sub})
    print("User:", user)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found."
        )
    print("User Role:", user["role"])
    return serialize_mongo(user)
def require_role(
    allowed_roles: list[str]
):
    """Create a dependency that allows access only to the specified roles."""
    async def role_checker(
        current_user: dict = Depends(get_current_user)
    ) -> dict:
        if current_user["role"] not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to perform this action."
            )
        return current_user
    return role_checker