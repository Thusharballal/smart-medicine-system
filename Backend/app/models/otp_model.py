from datetime import datetime, timedelta, timezone
from pydantic import BaseModel, EmailStr, Field
class OTPModel(BaseModel):
    """ Model representing an OTP verification record."""
    email: EmailStr

    otp: str = Field(
        ...,
        min_length=6,
        max_length=6
    )
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )
    expires_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc) + timedelta(minutes=10)
    )
    used: bool = False