from datetime import datetime, timezone
from fastapi import HTTPException, status
from app.database.connection import database
from app.models.user_model import User
from app.schemas.auth_schemas import (
    RegisterRequest,
    LoginRequest,
)
from app.utils.password import (
    hash_password,
    verify_password,
)
from app.utils.jwt_helper import create_access_token
from app.utils.logger import logger