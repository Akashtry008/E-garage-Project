from fastapi import APIRouter, Depends, Path
from controllers.DashboardController import (
    get_admin_dashboard_stats, 
    get_provider_dashboard_stats, 
    get_user_dashboard_stats
)

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("/admin")
async def get_admin_stats():
    """Get dashboard statistics for admin"""
    return await get_admin_dashboard_stats()

@router.get("/provider/{provider_id}")
async def get_provider_stats(provider_id: str = Path(..., description="The ID of the service provider")):
    """Get dashboard statistics for a service provider"""
    return await get_provider_dashboard_stats(provider_id)

@router.get("/user/{user_id}")
async def get_user_stats(user_id: str = Path(..., description="The ID of the user")):
    """Get dashboard statistics for a user"""
    return await get_user_dashboard_stats(user_id) 