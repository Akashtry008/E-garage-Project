from fastapi import FastAPI, Depends, HTTPException, Request
from routes.UserRoutes import user_router
from routes.AuthRoutes import router as auth_router
from routes.ServiceProviderRoutes import router as service_provider_router
from routes.RoleRoutes import router as role_router
from routes.StateRoutes import router as state_router
from routes.CityRoutes import router as city_router
from routes.AreaRoutes import router as area_router
from routes.CategoryRoutes import router as category_router
from routes.SubCategoryRoutes import router as subcategory_router
from routes.ProductRoutes import router as product_router
from routes.ServiceRoutes import router as service_router
from routes.BookingRoutes import router as booking_router
from routes.ReviewRoutes import router as review_router
from routes.NotificationRoutes import router as notification_router
from routes.DashboardRoutes import router as dashboard_router
from routes.ContactRoutes import contact_router
from routes.PaymentRoutes import payment_router
# Removing non-existent modules
# from routes.SearchRoutes import router as search_router
# from routes.StatisticsRoutes import router as statistics_router
from fastapi.middleware.cors import CORSMiddleware
import logging
from config.database import create_indexes
import time
from fastapi import FastAPI
from routes import BookingRoutes
from bson import ObjectId
import json
from typing import Any
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

app = FastAPI()
# app.include_router(BookingRoutes.router)

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="E-Garage API",
    description="API for E-Garage service provider management system",
    version="1.0.0"
)

# Custom JSON encoder to handle ObjectId serialization
class CustomJSONEncoder(json.JSONEncoder):
    def default(self, obj: Any) -> Any:
        if isinstance(obj, ObjectId):
            return str(obj)
        return super().default(obj)

# Configure JSON serialization to handle ObjectId
app.json_encoder = CustomJSONEncoder

# Global exception handler for ObjectId serialization errors
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    # Check if it's a PydanticSerializationError for ObjectId
    if "PydanticSerializationError" in str(exc) and "bson.objectid.ObjectId" in str(exc):
        logger.error(f"ObjectId serialization error: {str(exc)}")
        return JSONResponse(
            status_code=500,
            content={"message": "Data serialization error", "detail": "The server encountered an error processing the request"},
        )
    # Re-raise other exceptions
    raise exc

# Configure CORS
origins = [
    "http://localhost",
    "http://localhost:3000",
    "http://localhost:5173",  # For Vite development server
    "http://localhost:5174",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "http://127.0.0.1:3000",
    "*"  # Allow all origins in development (restrict in production)
]

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or ["http://localhost:3000"] if React is on port 3000
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


# Include routers
app.include_router(auth_router, prefix="/api")
app.include_router(user_router, prefix="/api/users")
app.include_router(service_provider_router)
app.include_router(role_router, prefix="/api")
app.include_router(state_router, prefix="/api")
app.include_router(city_router, prefix="/api")
app.include_router(area_router, prefix="/api")
app.include_router(category_router, prefix="/api")
app.include_router(subcategory_router, prefix="/api")
app.include_router(product_router, prefix="/api")
app.include_router(service_router, prefix="/api")
app.include_router(booking_router, prefix="/api")
app.include_router(review_router)
app.include_router(notification_router)
app.include_router(dashboard_router)
app.include_router(contact_router)
app.include_router(payment_router)
# Removed non-existent routers
# app.include_router(search_router)
# app.include_router(statistics_router)

# Add request logging middleware
@app.middleware("http")
async def log_requests(request, call_next):
    start_time = time.time()
    logger.info(f"Request: {request.method} {request.url}")
    response = await call_next(request)
    process_time = time.time() - start_time
    logger.info(f"Response status: {response.status_code}, Took: {process_time:.4f}s")
    return response

@app.on_event("startup")
async def startup_event():
    """
    Execute actions on application startup
    """
    logger.info("Starting up E-Garage API")
    try:
        # Create database indexes
        create_indexes()  # Removed 'await' if create_indexes is not async
        logger.info("Database indexes created successfully")
    except Exception as e:
        logger.error(f"Error creating database indexes: {str(e)}")

@app.get("/api/health")
async def health_check():
    """
    Health check endpoint
    """
    return {"status": "healthy", "message": "API is running"}

@app.get("/")
async def root():
    """
    Root endpoint
    """
    return {
        "message": "Welcome to E-Garage API",
        "documentation": "/docs",
        "version": "1.0.0"
    }