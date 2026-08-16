from typing import List
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.database.connection import get_database
from app.utils.jwt_helper import verify_access_token
from app.utils.mongo_helper import serialize_mongo
# ==========================================================
# HTTP Bearer Security
# ==========================================================
security = HTTPBearer()
# ==========================================================
# Get Current Authenticated User
# ==========================================================
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    """Get the authenticated MongoDB user from the JWT."""
    token = credentials.credentials
    payload = verify_access_token(token)
    database = get_database()
    user = await database.users.find_one({
        "email": payload.sub
    })
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found.",
        )
    return serialize_mongo(user)
# ==========================================================
# Role-Based Access Control
# ==========================================================
def require_role(
    allowed_roles: List[str],
):
    """Allow access only to the specified roles."""
    async def role_checker(
        current_user: dict = Depends(get_current_user),
    ) -> dict:
        if current_user["role"] not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to perform this action.",
            )
        return current_user
    return role_checker