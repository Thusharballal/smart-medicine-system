from contextlib import asynccontextmanager
from fastapi import FastAPI

from app.core.config import settings
from app.database.connection import connect_to_mongodb, close_mongodb_connection

@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_to_mongodb()
    yield
    await close_mongodb_connection()

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    lifespan=lifespan
)

@app.get("/")
async def root():
    return {
        "message": "Smart Medicine Availability & Intelligent Janaushadhi Recommendation System Backend is Running"
    }