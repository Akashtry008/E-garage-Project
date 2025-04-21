from bson import ObjectId
from models.ServiceProviderModel import ServiceProvider, ServiceProviderCreate, ServiceProviderUpdate, ServiceProviderOut, ServiceProviderFilter
from config.database import service_provider_collection, user_collection, category_collection, sub_category_collection, area_collection, city_collection, state_collection
from fastapi import APIRouter, HTTPException, UploadFile, File
from fastapi.responses import JSONResponse
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime
import os
import shutil
from uuid import uuid4

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Define upload directory
UPLOAD_DIR = "uploads/avatars"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Create a new service provider
async def create_service_provider(service_provider: ServiceProviderCreate):
    try:
        logger.info(f"Creating new service provider for user ID: {service_provider.user_id}")
        
        # Check if user exists
        user = await user_collection.find_one({"_id": ObjectId(service_provider.user_id)})
        if not user:
            logger.warning(f"User not found: {service_provider.user_id}")
            return JSONResponse(
                status_code=404,
                content={"message": "User not found", "status": False}
            )
            
        # Check if service provider already exists for this user
        existing_provider = await service_provider_collection.find_one({"user_id": service_provider.user_id})
        if existing_provider:
            logger.warning(f"Service provider already exists for user: {service_provider.user_id}")
            return JSONResponse(
                status_code=400,
                content={"message": "Service provider already exists for this user", "status": False}
            )
        
        # Prepare data for insertion
        provider_data = service_provider.dict()
        
        # Convert string IDs to ObjectId where needed
        provider_data["user_id"] = ObjectId(service_provider.user_id)
        provider_data["category_id"] = ObjectId(service_provider.category_id)
        
        if service_provider.sub_category_ids:
            provider_data["sub_category_ids"] = [ObjectId(id) for id in service_provider.sub_category_ids]
        
        if service_provider.area_id:
            provider_data["area_id"] = ObjectId(service_provider.area_id)
        
        if service_provider.city_id:
            provider_data["city_id"] = ObjectId(service_provider.city_id)
            
        if service_provider.state_id:
            provider_data["state_id"] = ObjectId(service_provider.state_id)
            
        # Add timestamps
        provider_data["created_at"] = datetime.now()
        provider_data["updated_at"] = datetime.now()
        
        # Insert into database
        result = await service_provider_collection.insert_one(provider_data)
        
        if result.inserted_id:
            # Get the newly created service provider with its ID
            new_provider = await service_provider_collection.find_one({"_id": result.inserted_id})
            
            # Convert ObjectId fields to strings for response
            new_provider["_id"] = str(new_provider["_id"])
            new_provider["user_id"] = str(new_provider["user_id"])
            new_provider["category_id"] = str(new_provider["category_id"])
            
            if "sub_category_ids" in new_provider and new_provider["sub_category_ids"]:
                new_provider["sub_category_ids"] = [str(id) for id in new_provider["sub_category_ids"]]
                
            if "area_id" in new_provider and new_provider["area_id"]:
                new_provider["area_id"] = str(new_provider["area_id"])
                
            if "city_id" in new_provider and new_provider["city_id"]:
                new_provider["city_id"] = str(new_provider["city_id"])
                
            if "state_id" in new_provider and new_provider["state_id"]:
                new_provider["state_id"] = str(new_provider["state_id"])
            
            return JSONResponse(
                status_code=201,
                content={
                    "message": "Service provider created successfully",
                    "service_provider": new_provider,
                    "status": True
                }
            )
        else:
            logger.error("Failed to create service provider")
            return JSONResponse(
                status_code=500,
                content={"message": "Failed to create service provider", "status": False}
            )
    except Exception as e:
        logger.error(f"Error creating service provider: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"message": f"An error occurred: {str(e)}", "status": False}
        )

# Get all service providers
async def get_all_service_providers():
    try:
        logger.info("Getting all service providers")
        providers = await service_provider_collection.find().to_list(length=1000)
        
        # Process providers for response
        processed_providers = []
        for provider in providers:
            # Convert ObjectId fields to strings
            provider["_id"] = str(provider["_id"])
            provider["user_id"] = str(provider["user_id"])
            provider["category_id"] = str(provider["category_id"])
            
            if "sub_category_ids" in provider and provider["sub_category_ids"]:
                provider["sub_category_ids"] = [str(id) for id in provider["sub_category_ids"]]
                
            if "area_id" in provider and provider["area_id"]:
                provider["area_id"] = str(provider["area_id"])
                
            if "city_id" in provider and provider["city_id"]:
                provider["city_id"] = str(provider["city_id"])
                
            if "state_id" in provider and provider["state_id"]:
                provider["state_id"] = str(provider["state_id"])
            
            processed_providers.append(provider)
        
        return JSONResponse(
            status_code=200,
            content={
                "message": "Service providers fetched successfully",
                "service_providers": processed_providers,
                "status": True
            }
        )
    except Exception as e:
        logger.error(f"Error getting all service providers: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"message": f"An error occurred: {str(e)}", "status": False}
        )

# Get service provider by ID
async def get_service_provider_by_id(provider_id: str):
    try:
        logger.info(f"Getting service provider by ID: {provider_id}")
        
        # Find the service provider
        provider = await service_provider_collection.find_one({"_id": ObjectId(provider_id)})
        
        if not provider:
            logger.warning(f"Service provider not found: {provider_id}")
            return JSONResponse(
                status_code=404,
                content={"message": "Service provider not found", "status": False}
            )
        
        # Convert ObjectId fields to strings
        provider["_id"] = str(provider["_id"])
        provider["user_id"] = str(provider["user_id"])
        provider["category_id"] = str(provider["category_id"])
        
        if "sub_category_ids" in provider and provider["sub_category_ids"]:
            provider["sub_category_ids"] = [str(id) for id in provider["sub_category_ids"]]
            
        if "area_id" in provider and provider["area_id"]:
            provider["area_id"] = str(provider["area_id"])
            
        if "city_id" in provider and provider["city_id"]:
            provider["city_id"] = str(provider["city_id"])
            
        if "state_id" in provider and provider["state_id"]:
            provider["state_id"] = str(provider["state_id"])
        
        # Get user details
        user = await user_collection.find_one({"_id": ObjectId(provider["user_id"])})
        if user:
            user["_id"] = str(user["_id"])
            if "password" in user:
                del user["password"]
            provider["user"] = user
        
        # Get category details
        category = await category_collection.find_one({"_id": ObjectId(provider["category_id"])})
        if category:
            category["_id"] = str(category["_id"])
            provider["category"] = category
        
        # Get subcategories details
        if "sub_category_ids" in provider and provider["sub_category_ids"]:
            subcategories = []
            for sub_id in provider["sub_category_ids"]:
                subcategory = await sub_category_collection.find_one({"_id": ObjectId(sub_id)})
                if subcategory:
                    subcategory["_id"] = str(subcategory["_id"])
                    subcategories.append(subcategory)
            provider["sub_categories"] = subcategories
        
        # Get area details if available
        if "area_id" in provider and provider["area_id"]:
            area = await area_collection.find_one({"_id": ObjectId(provider["area_id"])})
            if area:
                area["_id"] = str(area["_id"])
                provider["area"] = area
        
        # Get city details if available
        if "city_id" in provider and provider["city_id"]:
            city = await city_collection.find_one({"_id": ObjectId(provider["city_id"])})
            if city:
                city["_id"] = str(city["_id"])
                provider["city"] = city
        
        # Get state details if available
        if "state_id" in provider and provider["state_id"]:
            state = await state_collection.find_one({"_id": ObjectId(provider["state_id"])})
            if state:
                state["_id"] = str(state["_id"])
                provider["state"] = state
        
        return JSONResponse(
            status_code=200,
            content={
                "message": "Service provider fetched successfully",
                "service_provider": provider,
                "status": True
            }
        )
    except Exception as e:
        logger.error(f"Error getting service provider by ID: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"message": f"An error occurred: {str(e)}", "status": False}
        )

# Get service provider by user ID
async def get_service_provider_by_user_id(user_id: str):
    try:
        logger.info(f"Getting service provider by user ID: {user_id}")
        
        # Find the service provider
        provider = await service_provider_collection.find_one({"user_id": ObjectId(user_id)})
        
        if not provider:
            logger.warning(f"Service provider not found for user: {user_id}")
            return JSONResponse(
                status_code=404,
                content={"message": "Service provider not found for this user", "status": False}
            )
        
        # Convert ObjectId fields to strings
        provider["_id"] = str(provider["_id"])
        provider["user_id"] = str(provider["user_id"])
        provider["category_id"] = str(provider["category_id"])
        
        if "sub_category_ids" in provider and provider["sub_category_ids"]:
            provider["sub_category_ids"] = [str(id) for id in provider["sub_category_ids"]]
            
        if "area_id" in provider and provider["area_id"]:
            provider["area_id"] = str(provider["area_id"])
            
        if "city_id" in provider and provider["city_id"]:
            provider["city_id"] = str(provider["city_id"])
            
        if "state_id" in provider and provider["state_id"]:
            provider["state_id"] = str(provider["state_id"])
        
        # Get user details
        user = await user_collection.find_one({"_id": ObjectId(provider["user_id"])})
        if user:
            user["_id"] = str(user["_id"])
            if "password" in user:
                del user["password"]
            provider["user"] = user
        
        # Get category details
        category = await category_collection.find_one({"_id": ObjectId(provider["category_id"])})
        if category:
            category["_id"] = str(category["_id"])
            provider["category"] = category
        
        # Get subcategories details
        if "sub_category_ids" in provider and provider["sub_category_ids"]:
            subcategories = []
            for sub_id in provider["sub_category_ids"]:
                subcategory = await sub_category_collection.find_one({"_id": ObjectId(sub_id)})
                if subcategory:
                    subcategory["_id"] = str(subcategory["_id"])
                    subcategories.append(subcategory)
            provider["sub_categories"] = subcategories
        
        # Get area details if available
        if "area_id" in provider and provider["area_id"]:
            area = await area_collection.find_one({"_id": ObjectId(provider["area_id"])})
            if area:
                area["_id"] = str(area["_id"])
                provider["area"] = area
        
        # Get city details if available
        if "city_id" in provider and provider["city_id"]:
            city = await city_collection.find_one({"_id": ObjectId(provider["city_id"])})
            if city:
                city["_id"] = str(city["_id"])
                provider["city"] = city
        
        # Get state details if available
        if "state_id" in provider and provider["state_id"]:
            state = await state_collection.find_one({"_id": ObjectId(provider["state_id"])})
            if state:
                state["_id"] = str(state["_id"])
                provider["state"] = state
        
        return JSONResponse(
            status_code=200,
            content={
                "message": "Service provider fetched successfully",
                "service_provider": provider,
                "status": True
            }
        )
    except Exception as e:
        logger.error(f"Error getting service provider by user ID: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"message": f"An error occurred: {str(e)}", "status": False}
        )

# Update service provider
async def update_service_provider(provider_id: str, provider_data: ServiceProviderUpdate):
    try:
        logger.info(f"Updating service provider: {provider_id}")
        
        # Check if service provider exists
        existing_provider = await service_provider_collection.find_one({"_id": ObjectId(provider_id)})
        if not existing_provider:
            logger.warning(f"Service provider not found for update: {provider_id}")
            return JSONResponse(
                status_code=404,
                content={"message": "Service provider not found", "status": False}
            )
        
        # Prepare update data
        update_data = {k: v for k, v in provider_data.dict().items() if v is not None}
        
        # Convert string IDs to ObjectId where needed
        if "category_id" in update_data:
            update_data["category_id"] = ObjectId(update_data["category_id"])
        
        if "sub_category_ids" in update_data and update_data["sub_category_ids"]:
            update_data["sub_category_ids"] = [ObjectId(id) for id in update_data["sub_category_ids"]]
        
        if "area_id" in update_data and update_data["area_id"]:
            update_data["area_id"] = ObjectId(update_data["area_id"])
        
        if "city_id" in update_data and update_data["city_id"]:
            update_data["city_id"] = ObjectId(update_data["city_id"])
            
        if "state_id" in update_data and update_data["state_id"]:
            update_data["state_id"] = ObjectId(update_data["state_id"])
        
        # Add updated timestamp
        update_data["updated_at"] = datetime.now()
        
        # Update service provider
        result = await service_provider_collection.update_one(
            {"_id": ObjectId(provider_id)},
            {"$set": update_data}
        )
        
        if result.modified_count == 0 and result.matched_count > 0:
            logger.warning(f"No changes made to service provider: {provider_id}")
            return JSONResponse(
                status_code=200,
                content={"message": "No changes were made", "status": True}
            )
        
        # Get updated service provider
        updated_provider = await service_provider_collection.find_one({"_id": ObjectId(provider_id)})
        
        # Convert ObjectId fields to strings
        updated_provider["_id"] = str(updated_provider["_id"])
        updated_provider["user_id"] = str(updated_provider["user_id"])
        updated_provider["category_id"] = str(updated_provider["category_id"])
        
        if "sub_category_ids" in updated_provider and updated_provider["sub_category_ids"]:
            updated_provider["sub_category_ids"] = [str(id) for id in updated_provider["sub_category_ids"]]
            
        if "area_id" in updated_provider and updated_provider["area_id"]:
            updated_provider["area_id"] = str(updated_provider["area_id"])
            
        if "city_id" in updated_provider and updated_provider["city_id"]:
            updated_provider["city_id"] = str(updated_provider["city_id"])
            
        if "state_id" in updated_provider and updated_provider["state_id"]:
            updated_provider["state_id"] = str(updated_provider["state_id"])
        
        return JSONResponse(
            status_code=200,
            content={
                "message": "Service provider updated successfully",
                "service_provider": updated_provider,
                "status": True
            }
        )
    except Exception as e:
        logger.error(f"Error updating service provider: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"message": f"An error occurred: {str(e)}", "status": False}
        )

# Delete service provider
async def delete_service_provider(provider_id: str):
    try:
        logger.info(f"Deleting service provider: {provider_id}")
        
        # Check if service provider exists
        existing_provider = await service_provider_collection.find_one({"_id": ObjectId(provider_id)})
        if not existing_provider:
            logger.warning(f"Service provider not found for deletion: {provider_id}")
            return JSONResponse(
                status_code=404,
                content={"message": "Service provider not found", "status": False}
            )
        
        # Delete service provider
        result = await service_provider_collection.delete_one({"_id": ObjectId(provider_id)})
        
        if result.deleted_count == 0:
            logger.warning(f"Failed to delete service provider: {provider_id}")
            return JSONResponse(
                status_code=500,
                content={"message": "Failed to delete service provider", "status": False}
            )
        
        return JSONResponse(
            status_code=200,
            content={
                "message": "Service provider deleted successfully",
                "status": True
            }
        )
    except Exception as e:
        logger.error(f"Error deleting service provider: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"message": f"An error occurred: {str(e)}", "status": False}
        )

# Filter service providers
async def filter_service_providers(filter_data: ServiceProviderFilter):
    try:
        logger.info("Filtering service providers")
        
        # Build filter query
        filter_query = {}
        
        if filter_data.category_id:
            filter_query["category_id"] = ObjectId(filter_data.category_id)
        
        if filter_data.sub_category_ids and len(filter_data.sub_category_ids) > 0:
            filter_query["sub_category_ids"] = {"$in": [ObjectId(id) for id in filter_data.sub_category_ids]}
        
        if filter_data.area_id:
            filter_query["area_id"] = ObjectId(filter_data.area_id)
        
        if filter_data.city_id:
            filter_query["city_id"] = ObjectId(filter_data.city_id)
        
        if filter_data.state_id:
            filter_query["state_id"] = ObjectId(filter_data.state_id)
        
        if filter_data.rating_min is not None:
            filter_query["avg_rating"] = {"$gte": filter_data.rating_min}
        
        if filter_data.is_verified is not None:
            filter_query["is_verified"] = filter_data.is_verified
        
        # Always return active service providers
        filter_query["is_active"] = True
        
        # Add search term if provided
        if filter_data.search_term:
            filter_query["$or"] = [
                {"business_name": {"$regex": filter_data.search_term, "$options": "i"}},
                {"description": {"$regex": filter_data.search_term, "$options": "i"}}
            ]
        
        # Execute query
        providers = await service_provider_collection.find(filter_query).to_list(length=1000)
        
        # Process providers for response
        processed_providers = []
        for provider in providers:
            # Convert ObjectId fields to strings
            provider["_id"] = str(provider["_id"])
            provider["user_id"] = str(provider["user_id"])
            provider["category_id"] = str(provider["category_id"])
            
            if "sub_category_ids" in provider and provider["sub_category_ids"]:
                provider["sub_category_ids"] = [str(id) for id in provider["sub_category_ids"]]
                
            if "area_id" in provider and provider["area_id"]:
                provider["area_id"] = str(provider["area_id"])
                
            if "city_id" in provider and provider["city_id"]:
                provider["city_id"] = str(provider["city_id"])
                
            if "state_id" in provider and provider["state_id"]:
                provider["state_id"] = str(provider["state_id"])
            
            # Get user details
            user = await user_collection.find_one({"_id": ObjectId(provider["user_id"])})
            if user:
                user["_id"] = str(user["_id"])
                if "password" in user:
                    del user["password"]
                provider["user"] = user
            
            # Get category details
            category = await category_collection.find_one({"_id": ObjectId(provider["category_id"])})
            if category:
                category["_id"] = str(category["_id"])
                provider["category"] = category
            
            processed_providers.append(provider)
        
        return JSONResponse(
            status_code=200,
            content={
                "message": "Service providers filtered successfully",
                "service_providers": processed_providers,
                "count": len(processed_providers),
                "status": True
            }
        )
    except Exception as e:
        logger.error(f"Error filtering service providers: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"message": f"An error occurred: {str(e)}", "status": False}
        )

# Verify service provider
async def verify_service_provider(provider_id: str, is_verified: bool):
    try:
        logger.info(f"Setting verification status to {is_verified} for service provider: {provider_id}")
        
        # Check if service provider exists
        existing_provider = await service_provider_collection.find_one({"_id": ObjectId(provider_id)})
        if not existing_provider:
            logger.warning(f"Service provider not found: {provider_id}")
            return JSONResponse(
                status_code=404,
                content={"message": "Service provider not found", "status": False}
            )
        
        # Update verification status
        result = await service_provider_collection.update_one(
            {"_id": ObjectId(provider_id)},
            {
                "$set": {
                    "is_verified": is_verified,
                    "updated_at": datetime.now()
                }
            }
        )
        
        if result.modified_count == 0:
            if existing_provider.get("is_verified") == is_verified:
                return JSONResponse(
                    status_code=200,
                    content={"message": f"Service provider already {'verified' if is_verified else 'unverified'}", "status": True}
                )
            else:
                logger.warning(f"Failed to update verification status for service provider: {provider_id}")
                return JSONResponse(
                    status_code=500,
                    content={"message": "Failed to update verification status", "status": False}
                )
        
        return JSONResponse(
            status_code=200,
            content={
                "message": f"Service provider {'verified' if is_verified else 'unverified'} successfully",
                "status": True
            }
        )
    except Exception as e:
        logger.error(f"Error updating service provider verification status: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"message": f"An error occurred: {str(e)}", "status": False}
        )

# Update service provider rating
async def update_provider_rating(provider_id: str, rating: float):
    try:
        logger.info(f"Updating rating for service provider: {provider_id}")
        
        # Check if service provider exists
        existing_provider = await service_provider_collection.find_one({"_id": ObjectId(provider_id)})
        if not existing_provider:
            logger.warning(f"Service provider not found: {provider_id}")
            return JSONResponse(
                status_code=404,
                content={"message": "Service provider not found", "status": False}
            )
        
        # Calculate new average rating
        current_total = existing_provider.get("total_ratings", 0)
        current_avg = existing_provider.get("avg_rating", 0.0)
        
        new_total = current_total + 1
        new_avg = ((current_avg * current_total) + rating) / new_total
        
        # Update rating information
        result = await service_provider_collection.update_one(
            {"_id": ObjectId(provider_id)},
            {
                "$set": {
                    "avg_rating": round(new_avg, 1),
                    "total_ratings": new_total,
                    "updated_at": datetime.now()
                }
            }
        )
        
        if result.modified_count == 0:
            logger.warning(f"Failed to update rating for service provider: {provider_id}")
            return JSONResponse(
                status_code=500,
                content={"message": "Failed to update rating", "status": False}
            )
        
        return JSONResponse(
            status_code=200,
            content={
                "message": "Service provider rating updated successfully",
                "avg_rating": round(new_avg, 1),
                "total_ratings": new_total,
                "status": True
            }
        )
    except Exception as e:
        logger.error(f"Error updating service provider rating: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"message": f"An error occurred: {str(e)}", "status": False}
        )

# Upload service provider avatar
async def upload_service_provider_avatar(provider_id: str, avatar: UploadFile):
    try:
        logger.info(f"Uploading avatar for service provider: {provider_id}")
        
        # Check if service provider exists
        existing_provider = await service_provider_collection.find_one({"_id": ObjectId(provider_id)})
        if not existing_provider:
            logger.warning(f"Service provider not found for avatar upload: {provider_id}")
            return JSONResponse(
                status_code=404,
                content={"message": "Service provider not found", "status": False}
            )
        
        # Create a unique filename for the avatar
        file_ext = avatar.filename.split(".")[-1]  # Get file extension
        unique_filename = f"{provider_id}_{uuid4()}.{file_ext}"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)
        
        # Save the uploaded file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(avatar.file, buffer)
        
        # Create a relative URL for the avatar
        avatar_url = f"/uploads/avatars/{unique_filename}"
        
        # Update the service provider's avatar field
        await service_provider_collection.update_one(
            {"_id": ObjectId(provider_id)},
            {"$set": {"avatar": avatar_url, "updated_at": datetime.now()}}
        )
        
        # Also update the user's avatar if exists
        provider = await service_provider_collection.find_one({"_id": ObjectId(provider_id)})
        if provider and "user_id" in provider:
            user_id = provider["user_id"]
            await user_collection.update_one(
                {"_id": ObjectId(user_id)},
                {"$set": {"avatar": avatar_url}}
            )
        
        logger.info(f"Avatar uploaded successfully for service provider: {provider_id}")
        return JSONResponse(
            status_code=200,
            content={
                "message": "Avatar uploaded successfully",
                "avatarUrl": avatar_url,
                "status": True
            }
        )
    except Exception as e:
        logger.error(f"Error uploading avatar for service provider: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"message": f"An error occurred: {str(e)}", "status": False}
        )
