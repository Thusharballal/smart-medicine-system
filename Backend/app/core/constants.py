"""
Application Constants
This file contains all constant values used throughout the project.
Avoid hardcoding strings in different files.
"""
from enum import Enum
# ==========================================================
# MongoDB Collection Names
# ==========================================================
USERS_COLLECTION = "users"
MEDICINES_COLLECTION = "medicines"
PHARMACIES_COLLECTION = "pharmacies"
INVENTORY_COLLECTION = "inventory"
NOTIFICATIONS_COLLECTION = "notifications"
GENERIC_MEDICINE_COLLECTION = "generic_medicine_mapping"
OTP_COLLECTION = "otp_verifications"
WATCHLIST_COLLECTION = "watchlists"
PRESCRIPTION_COLLECTION = "prescriptions"
RECENT_SEARCH_COLLECTION = "recent_searches"
# ==========================================================
# User Roles
# ==========================================================
class UserRole(str, Enum):
    USER = "USER"
    ADMIN = "ADMIN"
    PHARMACY_OWNER = "PHARMACY_OWNER"
# ==========================================================
# User Account Status
# ==========================================================
class UserStatus(str, Enum):
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"
    SUSPENDED = "SUSPENDED"
    DELETED = "DELETED"
# ==========================================================
# Pharmacy Status
# ==========================================================
class PharmacyStatus(str, Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    SUSPENDED = "SUSPENDED"
# ==========================================================
# Backward-Compatible Role Constants
# ==========================================================
ROLE_USER = UserRole.USER.value
ROLE_PHARMACY = UserRole.PHARMACY_OWNER.value
ROLE_ADMIN = UserRole.ADMIN.value
# ==========================================================
# Backward-Compatible Status Constants
# ==========================================================
STATUS_ACTIVE = UserStatus.ACTIVE.value
STATUS_INACTIVE = UserStatus.INACTIVE.value
STATUS_PENDING = PharmacyStatus.PENDING.value
STATUS_BLOCKED = "BLOCKED"
# ==========================================================
# OTP Configuration
# ==========================================================
OTP_LENGTH = 6
OTP_EXPIRY_MINUTES = 10
MAX_OTP_ATTEMPTS = 5
# ==========================================================
# JWT Configuration
# ==========================================================
TOKEN_TYPE = "Bearer"
ACCESS_TOKEN = "ACCESS_TOKEN"
REFRESH_TOKEN = "REFRESH_TOKEN"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7
# ==========================================================
# Password Configuration
# ==========================================================
MIN_PASSWORD_LENGTH = 8
MAX_PASSWORD_LENGTH = 20
PASSWORD_REQUIRE_UPPERCASE = True
PASSWORD_REQUIRE_LOWERCASE = True
PASSWORD_REQUIRE_NUMBER = True
PASSWORD_REQUIRE_SPECIAL_CHARACTER = True
# ==========================================================
# API Success Messages
# ==========================================================
SUCCESS = "Success"
USER_REGISTERED = "User registered successfully."
LOGIN_SUCCESS = "Login successful."
LOGOUT_SUCCESS = "Logout successful."
OTP_SENT = "OTP sent successfully."
OTP_VERIFIED = "OTP verified successfully."
PASSWORD_RESET_SUCCESS = "Password reset successfully."
MEDICINE_FOUND = "Medicine found."
INVENTORY_UPDATED = "Inventory updated successfully."
PROFILE_UPDATED = "Profile updated successfully."
NOTIFICATION_SENT = "Notification sent successfully."
# ==========================================================
# API Error Messages
# ==========================================================
FAILED = "Failed"
USER_NOT_FOUND = "User not found."
EMAIL_ALREADY_EXISTS = "Email already exists."
INVALID_CREDENTIALS = "Invalid email or password."
INVALID_OTP = "Invalid OTP."
OTP_EXPIRED = "OTP has expired."
PASSWORD_MISMATCH = "Passwords do not match."
MEDICINE_NOT_FOUND = "Medicine not found."
UNAUTHORIZED = "Unauthorized access."
FORBIDDEN = "Access denied."
SERVER_ERROR = "Internal server error."
# =========================================================
# HTTP Status Codes
# ==========================================================
HTTP_OK = 200
HTTP_CREATED = 201
HTTP_BAD_REQUEST = 400
HTTP_UNAUTHORIZED = 401
HTTP_FORBIDDEN = 403
HTTP_NOT_FOUND = 404
HTTP_INTERNAL_SERVER_ERROR = 500