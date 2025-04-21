from fastapi import APIRouter
from fastapi.middleware.cors import CORSMiddleware
from backend.routes.UserRoutes import router as user_router
from backend.routes.ServiceRoutes import router as service_router
from backend.routes.ServiceProviderRoutes import router as sp_router
from backend.routes.BookingRoutes import router as booking_router
from backend.routes.AdminRoutes import router as admin_router
from backend.routes.AuthRoutes import router as auth_router
from backend.routes.NotificationRoutes import router as notification_router
from backend.routes.ContactRoutes import router as contact_router

app_router = APIRouter()
app_router.include_router(user_router, prefix="/api")
app_router.include_router(auth_router, prefix="/api")
app_router.include_router(service_router, prefix="/api")
app_router.include_router(sp_router, prefix="/api")
app_router.include_router(booking_router, prefix="/api")
app_router.include_router(admin_router, prefix="/api/admin")
app_router.include_router(notification_router, prefix="/api/notification")
app_router.include_router(contact_router, prefix="/api") 