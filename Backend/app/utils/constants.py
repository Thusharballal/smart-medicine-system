from enum import Enum


class UserRole(str, Enum):
    USER = "USER"
    ADMIN = "ADMIN"


class PharmacyStatus(str, Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    SUSPENDED = "SUSPENDED"


class UserStatus(str, Enum):
    ACTIVE = "ACTIVE"
    SUSPENDED = "SUSPENDED"
    DELETED = "DELETED"


class TokenType(str, Enum):
    USER = "USER"
    ADMIN = "ADMIN"
    PHARMACY = "PHARMACY"


OTP_EXPIRY_MINUTES = 10
PASSWORD_MIN_LENGTH = 8