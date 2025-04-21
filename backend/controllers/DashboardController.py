from bson import ObjectId
from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from config.database import (
    user_collection, service_provider_collection, service_collection, 
    booking_collection, review_collection, category_collection
)
from datetime import datetime, timedelta
import logging
from typing import Dict, Any, List, Optional

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def get_admin_dashboard_stats():
    try:
        logger.info("Getting admin dashboard statistics")
        
        # Get counts from collections
        total_users = await user_collection.count_documents({})
        total_service_providers = await service_provider_collection.count_documents({})
        total_services = await service_collection.count_documents({})
        total_bookings = await booking_collection.count_documents({})
        total_reviews = await review_collection.count_documents({})
        total_categories = await category_collection.count_documents({})
        
        # Get recent activity
        recent_users = await user_collection.find().sort("created_at", -1).limit(5).to_list(length=5)
        recent_service_providers = await service_provider_collection.find().sort("created_at", -1).limit(5).to_list(length=5)
        recent_bookings = await booking_collection.find().sort("created_at", -1).limit(5).to_list(length=5)
        
        # Process recent items to convert ObjectIds to strings
        processed_users = []
        for user in recent_users:
            user["_id"] = str(user["_id"])
            if "password" in user:
                del user["password"]
            processed_users.append(user)
            
        processed_providers = []
        for provider in recent_service_providers:
            provider["_id"] = str(provider["_id"])
            provider["user_id"] = str(provider["user_id"])
            processed_providers.append(provider)
            
        processed_bookings = []
        for booking in recent_bookings:
            booking["_id"] = str(booking["_id"])
            booking["user_id"] = str(booking["user_id"])
            booking["service_id"] = str(booking["service_id"])
            booking["service_provider_id"] = str(booking["service_provider_id"])
            processed_bookings.append(booking)
        
        # Get booking status counts
        pending_bookings = await booking_collection.count_documents({"status": "pending"})
        confirmed_bookings = await booking_collection.count_documents({"status": "confirmed"})
        completed_bookings = await booking_collection.count_documents({"status": "completed"})
        cancelled_bookings = await booking_collection.count_documents({"status": "cancelled"})
        
        # Get verified vs unverified service providers
        verified_providers = await service_provider_collection.count_documents({"is_verified": True})
        unverified_providers = await service_provider_collection.count_documents({"is_verified": False})
        
        # Get revenue data (assuming price field in bookings)
        completed_bookings_data = await booking_collection.find({"status": "completed"}).to_list(length=1000)
        total_revenue = sum(booking.get("price", 0) for booking in completed_bookings_data)
        
        # Get monthly booking counts for the past 6 months
        today = datetime.now()
        monthly_data = []
        
        for i in range(5, -1, -1):
            month_start = datetime(today.year, today.month, 1) - timedelta(days=30*i)
            month_end = (datetime(today.year, today.month, 1) - timedelta(days=30*(i-1))) if i > 0 else datetime(today.year, today.month + 1, 1)
            
            month_bookings = await booking_collection.count_documents({
                "created_at": {
                    "$gte": month_start,
                    "$lt": month_end
                }
            })
            
            month_name = month_start.strftime("%b %Y")
            monthly_data.append({
                "month": month_name,
                "count": month_bookings
            })
        
        # Compile all stats into one response
        dashboard_stats = {
            "counts": {
                "users": total_users,
                "service_providers": total_service_providers,
                "services": total_services,
                "bookings": total_bookings,
                "reviews": total_reviews,
                "categories": total_categories
            },
            "booking_status": {
                "pending": pending_bookings,
                "confirmed": confirmed_bookings,
                "completed": completed_bookings,
                "cancelled": cancelled_bookings
            },
            "provider_verification": {
                "verified": verified_providers,
                "unverified": unverified_providers
            },
            "revenue": {
                "total": round(total_revenue, 2)
            },
            "monthly_bookings": monthly_data,
            "recent": {
                "users": processed_users,
                "service_providers": processed_providers,
                "bookings": processed_bookings
            }
        }
        
        return JSONResponse(
            status_code=200,
            content={
                "message": "Dashboard statistics fetched successfully",
                "data": dashboard_stats,
                "status": True
            }
        )
    except Exception as e:
        logger.error(f"Error getting admin dashboard statistics: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"message": f"An error occurred: {str(e)}", "status": False}
        )

async def get_provider_dashboard_stats(provider_id: str):
    try:
        logger.info(f"Getting service provider dashboard statistics for provider: {provider_id}")
        
        # Check if service provider exists
        provider = await service_provider_collection.find_one({"_id": ObjectId(provider_id)})
        if not provider:
            logger.warning(f"Service provider not found: {provider_id}")
            return JSONResponse(
                status_code=404,
                content={"message": "Service provider not found", "status": False}
            )
        
        # Get counts
        total_services = await service_collection.count_documents({"serviceProviderId": ObjectId(provider_id)})
        total_bookings = await booking_collection.count_documents({"service_provider_id": ObjectId(provider_id)})
        total_reviews = await review_collection.count_documents({"service_provider_id": ObjectId(provider_id)})
        
        # Get booking status counts
        pending_bookings = await booking_collection.count_documents({
            "service_provider_id": ObjectId(provider_id),
            "status": "pending"
        })
        confirmed_bookings = await booking_collection.count_documents({
            "service_provider_id": ObjectId(provider_id),
            "status": "confirmed"
        })
        completed_bookings = await booking_collection.count_documents({
            "service_provider_id": ObjectId(provider_id),
            "status": "completed"
        })
        cancelled_bookings = await booking_collection.count_documents({
            "service_provider_id": ObjectId(provider_id),
            "status": "cancelled"
        })
        
        # Get recent bookings
        recent_bookings = await booking_collection.find(
            {"service_provider_id": ObjectId(provider_id)}
        ).sort("created_at", -1).limit(10).to_list(length=10)
        
        # Process bookings to convert ObjectIds to strings
        processed_bookings = []
        for booking in recent_bookings:
            booking["_id"] = str(booking["_id"])
            booking["user_id"] = str(booking["user_id"])
            booking["service_id"] = str(booking["service_id"])
            booking["service_provider_id"] = str(booking["service_provider_id"])
            
            # Get user info
            user = await user_collection.find_one({"_id": ObjectId(booking["user_id"])})
            if user:
                user["_id"] = str(user["_id"])
                if "password" in user:
                    del user["password"]
                booking["user"] = user
                
            # Get service info
            service = await service_collection.find_one({"_id": ObjectId(booking["service_id"])})
            if service:
                service["_id"] = str(service["_id"])
                booking["service"] = service
                
            processed_bookings.append(booking)
        
        # Get recent reviews
        recent_reviews = await review_collection.find(
            {"service_provider_id": ObjectId(provider_id)}
        ).sort("created_at", -1).limit(5).to_list(length=5)
        
        # Process reviews to convert ObjectIds to strings
        processed_reviews = []
        for review in recent_reviews:
            review["_id"] = str(review["_id"])
            review["user_id"] = str(review["user_id"])
            review["service_provider_id"] = str(review["service_provider_id"])
            
            if "service_id" in review and review["service_id"]:
                review["service_id"] = str(review["service_id"])
                
            # Get user info
            user = await user_collection.find_one({"_id": ObjectId(review["user_id"])})
            if user:
                user["_id"] = str(user["_id"])
                if "password" in user:
                    del user["password"]
                review["user"] = user
                
            processed_reviews.append(review)
        
        # Get revenue data
        completed_bookings_data = await booking_collection.find({
            "service_provider_id": ObjectId(provider_id),
            "status": "completed"
        }).to_list(length=1000)
        
        total_revenue = sum(booking.get("price", 0) for booking in completed_bookings_data)
        
        # Get monthly booking counts for the past 6 months
        today = datetime.now()
        monthly_data = []
        
        for i in range(5, -1, -1):
            month_start = datetime(today.year, today.month, 1) - timedelta(days=30*i)
            month_end = (datetime(today.year, today.month, 1) - timedelta(days=30*(i-1))) if i > 0 else datetime(today.year, today.month + 1, 1)
            
            month_bookings = await booking_collection.count_documents({
                "service_provider_id": ObjectId(provider_id),
                "created_at": {
                    "$gte": month_start,
                    "$lt": month_end
                }
            })
            
            month_name = month_start.strftime("%b %Y")
            monthly_data.append({
                "month": month_name,
                "count": month_bookings
            })
        
        # Get average rating
        avg_rating = provider.get("avg_rating", 0)
        total_ratings = provider.get("total_ratings", 0)
        
        # Top services by bookings
        services = await service_collection.find({"serviceProviderId": ObjectId(provider_id)}).to_list(length=100)
        service_bookings = []
        
        for service in services:
            booking_count = await booking_collection.count_documents({
                "service_id": service["_id"],
                "service_provider_id": ObjectId(provider_id)
            })
            
            if booking_count > 0:
                service_bookings.append({
                    "service_id": str(service["_id"]),
                    "service_name": service.get("serviceName", "Unknown"),
                    "booking_count": booking_count
                })
        
        # Sort by booking count (highest first)
        service_bookings.sort(key=lambda x: x["booking_count"], reverse=True)
        top_services = service_bookings[:5]  # Top 5 services
        
        # Compile all stats into one response
        dashboard_stats = {
            "counts": {
                "services": total_services,
                "bookings": total_bookings,
                "reviews": total_reviews
            },
            "booking_status": {
                "pending": pending_bookings,
                "confirmed": confirmed_bookings,
                "completed": completed_bookings,
                "cancelled": cancelled_bookings
            },
            "ratings": {
                "average": avg_rating,
                "total": total_ratings
            },
            "revenue": {
                "total": round(total_revenue, 2)
            },
            "monthly_bookings": monthly_data,
            "top_services": top_services,
            "recent": {
                "bookings": processed_bookings,
                "reviews": processed_reviews
            }
        }
        
        return JSONResponse(
            status_code=200,
            content={
                "message": "Service provider dashboard statistics fetched successfully",
                "data": dashboard_stats,
                "status": True
            }
        )
    except Exception as e:
        logger.error(f"Error getting service provider dashboard statistics: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"message": f"An error occurred: {str(e)}", "status": False}
        )

async def get_user_dashboard_stats(user_id: str):
    try:
        logger.info(f"Getting user dashboard statistics for user: {user_id}")
        
        # Check if user exists
        user = await user_collection.find_one({"_id": ObjectId(user_id)})
        if not user:
            logger.warning(f"User not found: {user_id}")
            return JSONResponse(
                status_code=404,
                content={"message": "User not found", "status": False}
            )
        
        # Get counts
        total_bookings = await booking_collection.count_documents({"user_id": ObjectId(user_id)})
        total_reviews = await review_collection.count_documents({"user_id": ObjectId(user_id)})
        
        # Get booking status counts
        pending_bookings = await booking_collection.count_documents({
            "user_id": ObjectId(user_id),
            "status": "pending"
        })
        confirmed_bookings = await booking_collection.count_documents({
            "user_id": ObjectId(user_id),
            "status": "confirmed"
        })
        completed_bookings = await booking_collection.count_documents({
            "user_id": ObjectId(user_id),
            "status": "completed"
        })
        cancelled_bookings = await booking_collection.count_documents({
            "user_id": ObjectId(user_id),
            "status": "cancelled"
        })
        
        # Get recent bookings
        recent_bookings = await booking_collection.find(
            {"user_id": ObjectId(user_id)}
        ).sort("created_at", -1).limit(5).to_list(length=5)
        
        # Process bookings to convert ObjectIds to strings
        processed_bookings = []
        for booking in recent_bookings:
            booking["_id"] = str(booking["_id"])
            booking["user_id"] = str(booking["user_id"])
            booking["service_id"] = str(booking["service_id"])
            booking["service_provider_id"] = str(booking["service_provider_id"])
            
            # Get service info
            service = await service_collection.find_one({"_id": ObjectId(booking["service_id"])})
            if service:
                service["_id"] = str(service["_id"])
                booking["service"] = service
                
            # Get service provider info
            provider = await service_provider_collection.find_one({"_id": ObjectId(booking["service_provider_id"])})
            if provider:
                provider["_id"] = str(provider["_id"])
                provider["user_id"] = str(provider["user_id"])
                booking["service_provider"] = provider
                
            processed_bookings.append(booking)
        
        # Get monthly booking counts for the past 6 months
        today = datetime.now()
        monthly_data = []
        
        for i in range(5, -1, -1):
            month_start = datetime(today.year, today.month, 1) - timedelta(days=30*i)
            month_end = (datetime(today.year, today.month, 1) - timedelta(days=30*(i-1))) if i > 0 else datetime(today.year, today.month + 1, 1)
            
            month_bookings = await booking_collection.count_documents({
                "user_id": ObjectId(user_id),
                "created_at": {
                    "$gte": month_start,
                    "$lt": month_end
                }
            })
            
            month_name = month_start.strftime("%b %Y")
            monthly_data.append({
                "month": month_name,
                "count": month_bookings
            })
        
        # Get total spending
        bookings_data = await booking_collection.find({"user_id": ObjectId(user_id)}).to_list(length=1000)
        total_spent = sum(booking.get("price", 0) for booking in bookings_data)
        
        # Compile all stats into one response
        dashboard_stats = {
            "counts": {
                "bookings": total_bookings,
                "reviews": total_reviews
            },
            "booking_status": {
                "pending": pending_bookings,
                "confirmed": confirmed_bookings,
                "completed": completed_bookings,
                "cancelled": cancelled_bookings
            },
            "spending": {
                "total": round(total_spent, 2)
            },
            "monthly_bookings": monthly_data,
            "recent": {
                "bookings": processed_bookings
            }
        }
        
        return JSONResponse(
            status_code=200,
            content={
                "message": "User dashboard statistics fetched successfully",
                "data": dashboard_stats,
                "status": True
            }
        )
    except Exception as e:
        logger.error(f"Error getting user dashboard statistics: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"message": f"An error occurred: {str(e)}", "status": False}
        ) 