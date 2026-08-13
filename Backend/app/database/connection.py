from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.core.config import settings
from app.utils.logger import logger
from motor.motor_asyncio import AsyncIOMotorClientSession
client: AsyncIOMotorClient | None = None
database: AsyncIOMotorDatabase | None = None

async def connect_to_mongodb() -> None:
    """Establish a connection with MongoDB."""
    global client, database
    try:
        client = AsyncIOMotorClient(settings.MONGODB_URL)
        database = client[settings.DATABASE_NAME]
        await client.admin.command("ping")
        logger.info("MongoDB connected successfully.")
    except Exception as error:
        logger.error(f"MongoDB connection error: {error}")
        raise

async def close_mongodb_connection() -> None:
    """Close the MongoDB connection."""
    global client
    if client is not None:
        client.close()
        logger.info("MongoDB connection closed.")

def get_database() -> AsyncIOMotorDatabase:
    """Return the MongoDB database instance."""
    return database
async def start_db_session() -> AsyncIOMotorClientSession:
    """
    Start a MongoDB transaction session.
    """
    if client is None:
        raise RuntimeError("MongoDB is not connected.")

    return await client.start_session()