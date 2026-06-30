from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings

# Create MongoDB client
client = AsyncIOMotorClient(settings.MONGODB_URI)

# Select the database
database = client[settings.DATABASE_NAME]


def get_database():
    """
    Returns the MongoDB database instance.
    """
    return database