from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # ===========================
    # Application Settings
    # ===========================
    APP_NAME: str
    APP_VERSION: str
    APP_ENV: str
    DEBUG: bool

    # ===========================
    # Server Settings
    # ===========================
    HOST: str
    PORT: int

    # ===========================
    # MongoDB Settings
    # ===========================
    MONGODB_URI: str
    DATABASE_NAME: str

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()