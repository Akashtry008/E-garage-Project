from models.NotificationModel import NotificationCreate, NotificationUpdate, NotificationOut, NotificationPreferences
from bson import ObjectId
from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from config.database import notification_collection, user_collection, notification_preferences_collection, service_provider_collection
from datetime import datetime
import logging
from typing import List, Optional

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def create_notification(notification: NotificationCreate):
    try:
        logger.info(f"Creating new notification for user: {notification.user_id}")
        
        # Prepare data for insertion
        notification_data = notification.dict()
        
        # Convert string IDs to ObjectId where needed
        notification_data["user_id"] = ObjectId(notification.user_id)
        
        if notification.related_id:
            notification_data["related_id"] = ObjectId(notification.related_id)
        
        # Add timestamps
        notification_data["created_at"] = datetime.now()
        notification_data["updated_at"] = datetime.now()
        
        # Insert into database
        result = await notification_collection.insert_one(notification_data)
        
        if result.inserted_id:
            # Get the newly created notification with its ID
            new_notification = await notification_collection.find_one({"_id": result.inserted_id})
            
            # Convert ObjectId fields to strings for response
            new_notification["_id"] = str(new_notification["_id"])
            new_notification["user_id"] = str(new_notification["user_id"])
            
            if "related_id" in new_notification and new_notification["related_id"]:
                new_notification["related_id"] = str(new_notification["related_id"])
            
            return JSONResponse(
                status_code=201,
                content={
                    "message": "Notification created successfully",
                    "notification": new_notification,
                    "status": True
                }
            )
        else:
            logger.error("Failed to create notification")
            return JSONResponse(
                status_code=500,
                content={"message": "Failed to create notification", "status": False}
            )
    except Exception as e:
        logger.error(f"Error creating notification: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"message": f"An error occurred: {str(e)}", "status": False}
        )

async def get_user_notifications(user_id: str, unread_only: bool = False):
    try:
        logger.info(f"Getting notifications for user: {user_id}")
        
        # Build query
        query = {"user_id": ObjectId(user_id)}
        
        if unread_only:
            query["is_read"] = False
        
        # Find notifications
        notifications = await notification_collection.find(query).sort("created_at", -1).to_list(length=100)
        
        # Process notifications for response
        processed_notifications = []
        for notification in notifications:
            # Convert ObjectId fields to strings
            notification["_id"] = str(notification["_id"])
            notification["user_id"] = str(notification["user_id"])
            
            if "related_id" in notification and notification["related_id"]:
                notification["related_id"] = str(notification["related_id"])
            
            processed_notifications.append(notification)
        
        return JSONResponse(
            status_code=200,
            content={
                "message": "Notifications fetched successfully",
                "notifications": processed_notifications,
                "count": len(processed_notifications),
                "status": True
            }
        )
    except Exception as e:
        logger.error(f"Error getting notifications for user: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"message": f"An error occurred: {str(e)}", "status": False}
        )

async def get_notification_by_id(notification_id: str):
    try:
        logger.info(f"Getting notification by ID: {notification_id}")
        
        # Find the notification
        notification = await notification_collection.find_one({"_id": ObjectId(notification_id)})
        
        if not notification:
            logger.warning(f"Notification not found: {notification_id}")
            return JSONResponse(
                status_code=404,
                content={"message": "Notification not found", "status": False}
            )
        
        # Convert ObjectId fields to strings
        notification["_id"] = str(notification["_id"])
        notification["user_id"] = str(notification["user_id"])
        
        if "related_id" in notification and notification["related_id"]:
            notification["related_id"] = str(notification["related_id"])
        
        return JSONResponse(
            status_code=200,
            content={
                "message": "Notification fetched successfully",
                "notification": notification,
                "status": True
            }
        )
    except Exception as e:
        logger.error(f"Error getting notification by ID: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"message": f"An error occurred: {str(e)}", "status": False}
        )

async def mark_notification_read(notification_id: str, is_read: bool = True):
    try:
        logger.info(f"Marking notification {notification_id} as {'read' if is_read else 'unread'}")
        
        # Check if notification exists
        existing_notification = await notification_collection.find_one({"_id": ObjectId(notification_id)})
        if not existing_notification:
            logger.warning(f"Notification not found: {notification_id}")
            return JSONResponse(
                status_code=404,
                content={"message": "Notification not found", "status": False}
            )
        
        # Update notification read status
        result = await notification_collection.update_one(
            {"_id": ObjectId(notification_id)},
            {
                "$set": {
                    "is_read": is_read,
                    "updated_at": datetime.now()
                }
            }
        )
        
        if result.modified_count == 0:
            if existing_notification.get("is_read") == is_read:
                return JSONResponse(
                    status_code=200,
                    content={"message": f"Notification already {'read' if is_read else 'unread'}", "status": True}
                )
            else:
                logger.warning(f"Failed to update notification read status: {notification_id}")
                return JSONResponse(
                    status_code=500,
                    content={"message": "Failed to update notification", "status": False}
                )
        
        return JSONResponse(
            status_code=200,
            content={
                "message": f"Notification marked as {'read' if is_read else 'unread'} successfully",
                "status": True
            }
        )
    except Exception as e:
        logger.error(f"Error marking notification as read: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"message": f"An error occurred: {str(e)}", "status": False}
        )

async def mark_all_notifications_read(user_id: str):
    try:
        logger.info(f"Marking all notifications as read for user: {user_id}")
        
        # Update all unread notifications for the user
        result = await notification_collection.update_many(
            {"user_id": ObjectId(user_id), "is_read": False},
            {
                "$set": {
                    "is_read": True,
                    "updated_at": datetime.now()
                }
            }
        )
        
        return JSONResponse(
            status_code=200,
            content={
                "message": f"Marked {result.modified_count} notifications as read",
                "count": result.modified_count,
                "status": True
            }
        )
    except Exception as e:
        logger.error(f"Error marking all notifications as read: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"message": f"An error occurred: {str(e)}", "status": False}
        )

async def delete_notification(notification_id: str):
    try:
        logger.info(f"Deleting notification: {notification_id}")
        
        # Check if notification exists
        existing_notification = await notification_collection.find_one({"_id": ObjectId(notification_id)})
        if not existing_notification:
            logger.warning(f"Notification not found for deletion: {notification_id}")
            return JSONResponse(
                status_code=404,
                content={"message": "Notification not found", "status": False}
            )
        
        # Delete notification
        result = await notification_collection.delete_one({"_id": ObjectId(notification_id)})
        
        if result.deleted_count == 0:
            logger.warning(f"Failed to delete notification: {notification_id}")
            return JSONResponse(
                status_code=500,
                content={"message": "Failed to delete notification", "status": False}
            )
        
        return JSONResponse(
            status_code=200,
            content={
                "message": "Notification deleted successfully",
                "status": True
            }
        )
    except Exception as e:
        logger.error(f"Error deleting notification: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"message": f"An error occurred: {str(e)}", "status": False}
        )

async def delete_all_notifications(user_id: str):
    try:
        logger.info(f"Deleting all notifications for user: {user_id}")
        
        # Delete all notifications for the user
        result = await notification_collection.delete_many({"user_id": ObjectId(user_id)})
        
        return JSONResponse(
            status_code=200,
            content={
                "message": f"Deleted {result.deleted_count} notifications",
                "count": result.deleted_count,
                "status": True
            }
        )
    except Exception as e:
        logger.error(f"Error deleting all notifications: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"message": f"An error occurred: {str(e)}", "status": False}
        )

async def create_system_notification(user_ids: List[str], title: str, message: str, related_id: Optional[str] = None):
    """
    Create a system notification for multiple users
    """
    try:
        logger.info(f"Creating system notification for {len(user_ids)} users")
        
        created_count = 0
        for user_id in user_ids:
            notification = NotificationCreate(
                user_id=user_id,
                title=title,
                message=message,
                notification_type="system",
                related_id=related_id,
                is_read=False
            )
            
            result = await create_notification(notification)
            if result.status_code == 201:
                created_count += 1
        
        return JSONResponse(
            status_code=201,
            content={
                "message": f"Created {created_count} system notifications",
                "count": created_count,
                "status": True
            }
        )
    except Exception as e:
        logger.error(f"Error creating system notifications: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"message": f"An error occurred: {str(e)}", "status": False}
        )

async def get_service_provider_notifications(provider_id: str, unread_only: bool = False):
    try:
        logger.info(f"Getting notifications for service provider: {provider_id}")
        
        # Get user ID associated with service provider
        service_provider = await service_provider_collection.find_one({"_id": ObjectId(provider_id)})
        
        if not service_provider:
            logger.warning(f"Service provider not found: {provider_id}")
            return JSONResponse(
                status_code=404,
                content={"message": "Service provider not found", "status": False}
            )
        
        user_id = service_provider.get("user_id")
        if not user_id:
            logger.warning(f"User ID not found for service provider: {provider_id}")
            return JSONResponse(
                status_code=404,
                content={"message": "User ID not found for service provider", "status": False}
            )
        
        # Check if user_id is already an ObjectId
        if not isinstance(user_id, ObjectId):
            user_id = ObjectId(user_id)
        
        # Build query
        query = {"user_id": user_id}
        
        if unread_only:
            query["is_read"] = False
        
        # Find notifications
        notifications = await notification_collection.find(query).sort("created_at", -1).to_list(length=100)
        
        # Process notifications for response
        processed_notifications = []
        for notification in notifications:
            # Convert ObjectId fields to strings
            notification["_id"] = str(notification["_id"])
            notification["user_id"] = str(notification["user_id"])
            
            if "related_id" in notification and notification["related_id"]:
                notification["related_id"] = str(notification["related_id"])
            
            processed_notifications.append(notification)
        
        return JSONResponse(
            status_code=200,
            content={
                "message": "Notifications fetched successfully",
                "data": processed_notifications,
                "count": len(processed_notifications),
                "status": True
            }
        )
    except Exception as e:
        logger.error(f"Error getting notifications for service provider: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"message": f"An error occurred: {str(e)}", "status": False}
        )

async def get_service_provider_notification_preferences(provider_id: str):
    try:
        logger.info(f"Getting notification preferences for service provider: {provider_id}")
        
        # Find preferences
        preferences = await notification_preferences_collection.find_one({"service_provider_id": ObjectId(provider_id)})
        
        if not preferences:
            # Return default preferences if none exist
            default_preferences = {
                "service_provider_id": str(provider_id),
                "email_notifications": True,
                "push_notifications": True,
                "notify_on_booking": True,
                "notify_on_review": True,
                "notify_on_payment": True
            }
            
            return JSONResponse(
                status_code=200,
                content={
                    "message": "Default notification preferences",
                    "data": default_preferences,
                    "status": True
                }
            )
        
        # Convert ObjectId fields to strings
        preferences["_id"] = str(preferences["_id"])
        preferences["service_provider_id"] = str(preferences["service_provider_id"])
        
        return JSONResponse(
            status_code=200,
            content={
                "message": "Notification preferences fetched successfully",
                "data": preferences,
                "status": True
            }
        )
    except Exception as e:
        logger.error(f"Error getting notification preferences: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"message": f"An error occurred: {str(e)}", "status": False}
        )

async def update_service_provider_notification_preferences(provider_id: str, preferences: dict):
    try:
        logger.info(f"Updating notification preferences for service provider: {provider_id}")
        
        # Prepare update data
        update_data = {
            "service_provider_id": ObjectId(provider_id),
            "email_notifications": preferences.get("email_notifications", True),
            "push_notifications": preferences.get("push_notifications", True),
            "notify_on_booking": preferences.get("notify_on_booking", True),
            "notify_on_review": preferences.get("notify_on_review", True),
            "notify_on_payment": preferences.get("notify_on_payment", True),
            "updated_at": datetime.now()
        }
        
        # Check if preferences exist
        existing_preferences = await notification_preferences_collection.find_one({"service_provider_id": ObjectId(provider_id)})
        
        if existing_preferences:
            # Update existing preferences
            result = await notification_preferences_collection.update_one(
                {"service_provider_id": ObjectId(provider_id)},
                {"$set": update_data}
            )
        else:
            # Create new preferences
            update_data["created_at"] = datetime.now()
            result = await notification_preferences_collection.insert_one(update_data)
        
        return JSONResponse(
            status_code=200,
            content={
                "message": "Notification preferences updated successfully",
                "status": True
            }
        )
    except Exception as e:
        logger.error(f"Error updating notification preferences: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"message": f"An error occurred: {str(e)}", "status": False}
        )

async def mark_all_service_provider_notifications_read(provider_id: str):
    try:
        logger.info(f"Marking all notifications as read for service provider: {provider_id}")
        
        # Get user ID associated with service provider
        service_provider = await service_provider_collection.find_one({"_id": ObjectId(provider_id)})
        
        if not service_provider:
            logger.warning(f"Service provider not found: {provider_id}")
            return JSONResponse(
                status_code=404,
                content={"message": "Service provider not found", "status": False}
            )
        
        user_id = service_provider.get("user_id")
        if not user_id:
            logger.warning(f"User ID not found for service provider: {provider_id}")
            return JSONResponse(
                status_code=404,
                content={"message": "User ID not found for service provider", "status": False}
            )
        
        # Check if user_id is already an ObjectId
        if not isinstance(user_id, ObjectId):
            user_id = ObjectId(user_id)
        
        # Update all unread notifications for the user
        result = await notification_collection.update_many(
            {"user_id": user_id, "is_read": False},
            {
                "$set": {
                    "is_read": True,
                    "updated_at": datetime.now()
                }
            }
        )
        
        return JSONResponse(
            status_code=200,
            content={
                "message": f"Marked {result.modified_count} notifications as read",
                "count": result.modified_count,
                "status": True
            }
        )
    except Exception as e:
        logger.error(f"Error marking all notifications as read: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"message": f"An error occurred: {str(e)}", "status": False}
        )

async def batch_delete_notifications(notification_ids: List[str]):
    try:
        logger.info(f"Batch deleting {len(notification_ids)} notifications")
        
        # Convert string IDs to ObjectIds
        object_ids = [ObjectId(notification_id) for notification_id in notification_ids]
        
        # Delete notifications
        result = await notification_collection.delete_many({"_id": {"$in": object_ids}})
        
        return JSONResponse(
            status_code=200,
            content={
                "message": f"Deleted {result.deleted_count} notifications",
                "count": result.deleted_count,
                "status": True
            }
        )
    except Exception as e:
        logger.error(f"Error batch deleting notifications: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"message": f"An error occurred: {str(e)}", "status": False}
        ) 