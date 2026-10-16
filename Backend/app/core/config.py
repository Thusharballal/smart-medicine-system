from pydantic_settings import (
    BaseSettings,
    SettingsConfigDict,
)
class Settings(BaseSettings):
    # ==========================================================
    # APPLICATION
    # ==========================================================
    APP_NAME: str
    APP_VERSION: str
    APP_ENV: str
    DEBUG: bool
    HOST: str
    PORT: int
    # ==========================================================
    # MONGODB
    # ==========================================================
    MONGODB_URL: str
    DATABASE_NAME: str
    # ==========================================================
    # JWT AUTHENTICATION
    # ==========================================================
    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int
    # ==========================================================
    # GMAIL SMTP
    # ==========================================================
    SMTP_SERVER: str
    SMTP_PORT: int
    SMTP_EMAIL: str
    SMTP_PASSWORD: str
    SMTP_FROM: str
    # ==========================================================
    # ENVIRONMENT CONFIGURATION
    # ==========================================================
    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
        case_sensitive=True,
    )
settings = Settings()