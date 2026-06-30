from fastapi import FastAPI
from app.utils.logger import logger
from app.core.config import settings
from app.database.connection import get_database

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION
)

# Log when the application starts
logger.info("Smart Medicine System API Started Successfully")


@app.get("/")
async def root():

    # Log when the root API is accessed
    logger.info("Root API Accessed")

    return {
        "message": "Welcome to Smart Medicine System API"
    }


@app.get("/database")
async def test_database():

    # Log database API access
    logger.info("Database Connection Test API Accessed")

    db = get_database()

    collections = await db.list_collection_names()

    logger.info("Database Connected Successfully")

    return {
        "status": "Connected Successfully",
        "database": settings.DATABASE_NAME,
        "collections": collections
    }