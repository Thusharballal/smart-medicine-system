from pydantic import BaseModel, EmailStr,Field
from datetime import datetime
class UserDashboardResponse(BaseModel):
    full_name: str
    email: EmailStr
    total_searches: int
    saved_medicines: int
    nearby_pharmacies: int
    recent_activity: list[str]
class UserProfileResponse(BaseModel):
    full_name: str
    email: EmailStr
    phone_number: str
    role: str
    status: str
    is_email_verified: bool
class UpdateUserRequest(BaseModel):
    """ Request schema for updating the logged-in user's profile. """
    full_name: str = Field(
        ...,
        min_length=3,
        max_length=100
    )
    phone_number: str = Field(
        ...,
        min_length=10,
        max_length=15
    )
class AdminUpdateUserRequest(BaseModel):
    """Request schema for an Admin updating another user's account."""
    full_name: str = Field(
        ...,
        min_length=3,
        max_length=100
    )
    phone_number: str = Field(
        ...,
        min_length=10,
        max_length=15
    )
    role: str = Field(
        ...,
        min_length=2,
        max_length=30
    )
    status: str = Field(
        ...,
        min_length=2,
        max_length=30
    )
class AdminUserResponse(BaseModel):
    """User information returned to Admin."""
    id: str
    full_name: str
    email: EmailStr
    phone_number: str
    role: str
    status: str
    is_email_verified: bool
    created_at: datetime | None = None
    updated_at: datetime | None = None
    last_login: datetime | None = None