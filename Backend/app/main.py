from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers.notification_router import router as notification_router
from app.core.config import settings
from app.database.connection import connect_to_mongodb, close_mongodb_connection
from app.routers.auth_router import router as auth_router
from app.routers.medicine_router import router as medicine_router
from app.routers.batch_router import router as batch_router
from app.routers.inventory_router import router as inventory_router
from app.routers.user_router import router as user_router
from app.routers.billing_router import router as billing_router
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
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(auth_router)
app.include_router(
    medicine_router,
    prefix="/api/v1"
)
app.include_router(billing_router)
@app.get("/")
async def root():
    return {
        "message": "Smart Medicine Availability & Intelligent Janaushadhi Recommendation System Backend is Running"
    }
app.include_router(batch_router)
app.include_router(inventory_router)
app.include_router(user_router)
app.include_router(notification_router, prefix="/api/v1")
