from fastapi import APIRouter, Depends, Path, Query, Body
from controllers.NotificationController import (
    create_notification, get_user_notifications, get_notification_by_id, 
    mark_notification_read, mark_all_notifications_read,
    delete_notification, delete_all_notifications, create_system_notification,
    get_service_provider_notifications, get_service_provider_notification_preferences,
    update_service_provider_notification_preferences, mark_all_service_provider_notifications_read,
    batch_delete_notifications
)
from models.NotificationModel import NotificationCreate
from typing import List, Optional

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])

@router.post("/")
async def post_notification(notification: NotificationCreate):
    """Create a new notification"""
    return await create_notification(notification)

@router.post("/system")
async def post_system_notification(
    user_ids: List[str] = Body(..., embed=True),
    title: str = Body(..., embed=True),
    message: str = Body(..., embed=True),
    related_id: Optional[str] = Body(None, embed=True)
):
    """Create a system notification for multiple users"""
    return await create_system_notification(user_ids, title, message, related_id)

@router.get("/user/{user_id}")
async def get_notifications(
    user_id: str = Path(..., description="The ID of the user"),
    unread_only: bool = Query(False, description="Get only unread notifications")
):
    """Get all notifications for a specific user"""
    return await get_user_notifications(user_id, unread_only)

@router.get("/{notification_id}")
async def get_notification(notification_id: str = Path(..., description="The ID of the notification to get")):
    """Get a notification by ID"""
    return await get_notification_by_id(notification_id)

@router.patch("/{notification_id}/read")
async def mark_read(
    notification_id: str = Path(..., description="The ID of the notification to mark"),
    is_read: bool = Body(True, embed=True, description="The read status")
):
    """Mark a notification as read or unread"""
    return await mark_notification_read(notification_id, is_read)

@router.patch("/user/{user_id}/read-all")
async def mark_all_read(user_id: str = Path(..., description="The ID of the user")):
    """Mark all notifications as read for a user"""
    return await mark_all_notifications_read(user_id)

@router.delete("/{notification_id}")
async def remove_notification(notification_id: str = Path(..., description="The ID of the notification to delete")):
    """Delete a notification"""
    return await delete_notification(notification_id)

@router.delete("/user/{user_id}/all")
async def remove_all_notifications(user_id: str = Path(..., description="The ID of the user")):
    """Delete all notifications for a user"""
    return await delete_all_notifications(user_id)

# Service Provider Notification Routes
@router.get("/serviceprovider/{provider_id}")
async def get_provider_notifications(
    provider_id: str = Path(..., description="The ID of the service provider"),
    unread_only: bool = Query(False, description="Get only unread notifications")
):
    """Get all notifications for a specific service provider"""
    return await get_service_provider_notifications(provider_id, unread_only)

@router.get("/serviceprovider/{provider_id}/preferences")
async def get_provider_notification_preferences(
    provider_id: str = Path(..., description="The ID of the service provider")
):
    """Get notification preferences for a service provider"""
    return await get_service_provider_notification_preferences(provider_id)

@router.put("/serviceprovider/{provider_id}/preferences")
async def update_provider_notification_preferences(
    provider_id: str = Path(..., description="The ID of the service provider"),
    preferences: dict = Body(..., description="The notification preferences")
):
    """Update notification preferences for a service provider"""
    return await update_service_provider_notification_preferences(provider_id, preferences)

@router.put("/serviceprovider/{provider_id}/read-all")
async def mark_all_provider_notifications_read(
    provider_id: str = Path(..., description="The ID of the service provider")
):
    """Mark all notifications as read for a service provider"""
    return await mark_all_service_provider_notifications_read(provider_id)

@router.post("/batch-delete")
async def delete_multiple_notifications(
    ids: List[str] = Body(..., embed=True, description="List of notification IDs to delete")
):
    """Delete multiple notifications by ID"""
    return await batch_delete_notifications(ids) 