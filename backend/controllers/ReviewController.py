from models.ReviewModel import ReviewCreate, ReviewUpdate, ReviewOut
from bson import ObjectId
from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from config.database import review_collection, user_collection, service_collection, service_provider_collection
from controllers.ServiceProviderController import update_provider_rating
from datetime import datetime
import logging
from typing import Dict, Any, List

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def create_review(review: ReviewCreate):
    try:
        logger.info(f"Creating new review by user: {review.user_id}")
        
        # Check if user has already reviewed this service provider
        existing_review = await review_collection.find_one({
            "user_id": ObjectId(review.user_id),
            "service_provider_id": ObjectId(review.service_provider_id)
        })
        
        if existing_review:
            logger.warning(f"User {review.user_id} has already reviewed service provider {review.service_provider_id}")
            return JSONResponse(
                status_code=400,
                content={"message": "You have already reviewed this service provider", "status": False}
            )
        
        # Prepare data for insertion
        review_data = review.dict()
        
        # Convert string IDs to ObjectId where needed
        review_data["user_id"] = ObjectId(review.user_id)
        review_data["service_provider_id"] = ObjectId(review.service_provider_id)
        
        if review.service_id:
            review_data["service_id"] = ObjectId(review.service_id)
        
        # Add timestamps
        review_data["created_at"] = datetime.now()
        review_data["updated_at"] = datetime.now()
        
        # Insert into database
        result = await review_collection.insert_one(review_data)
        
        if result.inserted_id:
            # Get the newly created review with its ID
            new_review = await review_collection.find_one({"_id": result.inserted_id})
            
            # Convert ObjectId fields to strings for response
            new_review["_id"] = str(new_review["_id"])
            new_review["user_id"] = str(new_review["user_id"])
            new_review["service_provider_id"] = str(new_review["service_provider_id"])
            
            if "service_id" in new_review and new_review["service_id"]:
                new_review["service_id"] = str(new_review["service_id"])
            
            # Update service provider's average rating
            await update_provider_rating(str(review.service_provider_id), review.rating)
            
            return JSONResponse(
                status_code=201,
                content={
                    "message": "Review created successfully",
                    "review": new_review,
                    "status": True
                }
            )
        else:
            logger.error("Failed to create review")
            return JSONResponse(
                status_code=500,
                content={"message": "Failed to create review", "status": False}
            )
    except Exception as e:
        logger.error(f"Error creating review: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"message": f"An error occurred: {str(e)}", "status": False}
        )

async def get_all_reviews():
    try:
        logger.info("Getting all reviews")
        reviews = await review_collection.find().to_list(length=1000)
        
        # Process reviews for response
        processed_reviews = []
        for review in reviews:
            # Convert ObjectId fields to strings
            review["_id"] = str(review["_id"])
            review["user_id"] = str(review["user_id"])
            review["service_provider_id"] = str(review["service_provider_id"])
            
            if "service_id" in review and review["service_id"]:
                review["service_id"] = str(review["service_id"])
            
            processed_reviews.append(review)
        
        return JSONResponse(
            status_code=200,
            content={
                "message": "Reviews fetched successfully",
                "reviews": processed_reviews,
                "status": True
            }
        )
    except Exception as e:
        logger.error(f"Error getting all reviews: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"message": f"An error occurred: {str(e)}", "status": False}
        )

async def get_review_by_id(review_id: str):
    try:
        logger.info(f"Getting review by ID: {review_id}")
        
        # Find the review
        review = await review_collection.find_one({"_id": ObjectId(review_id)})
        
        if not review:
            logger.warning(f"Review not found: {review_id}")
            return JSONResponse(
                status_code=404,
                content={"message": "Review not found", "status": False}
            )
        
        # Convert ObjectId fields to strings
        review["_id"] = str(review["_id"])
        review["user_id"] = str(review["user_id"])
        review["service_provider_id"] = str(review["service_provider_id"])
        
        if "service_id" in review and review["service_id"]:
            review["service_id"] = str(review["service_id"])
        
        # Get related data
        user = await user_collection.find_one({"_id": ObjectId(review["user_id"])})
        if user:
            user["_id"] = str(user["_id"])
            if "password" in user:
                del user["password"]
            review["user"] = user
        
        service_provider = await service_provider_collection.find_one({"_id": ObjectId(review["service_provider_id"])})
        if service_provider:
            service_provider["_id"] = str(service_provider["_id"])
            review["service_provider"] = service_provider
        
        if "service_id" in review and review["service_id"]:
            service = await service_collection.find_one({"_id": ObjectId(review["service_id"])})
            if service:
                service["_id"] = str(service["_id"])
                review["service"] = service
        
        return JSONResponse(
            status_code=200,
            content={
                "message": "Review fetched successfully",
                "review": review,
                "status": True
            }
        )
    except Exception as e:
        logger.error(f"Error getting review by ID: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"message": f"An error occurred: {str(e)}", "status": False}
        )

async def get_provider_reviews(provider_id: str):
    try:
        logger.info(f"Getting reviews for service provider: {provider_id}")
        
        # Find reviews by service provider ID
        reviews = await review_collection.find({"service_provider_id": ObjectId(provider_id)}).to_list(length=1000)
        
        # Process reviews for response
        processed_reviews = []
        for review in reviews:
            # Convert ObjectId fields to strings
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
        
        return JSONResponse(
            status_code=200,
            content={
                "message": "Provider reviews fetched successfully",
                "reviews": processed_reviews,
                "count": len(processed_reviews),
                "status": True
            }
        )
    except Exception as e:
        logger.error(f"Error getting provider reviews: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"message": f"An error occurred: {str(e)}", "status": False}
        )

async def get_user_reviews(user_id: str):
    try:
        logger.info(f"Getting reviews by user: {user_id}")
        
        # Find reviews by user ID
        reviews = await review_collection.find({"user_id": ObjectId(user_id)}).to_list(length=1000)
        
        # Process reviews for response
        processed_reviews = []
        for review in reviews:
            # Convert ObjectId fields to strings
            review["_id"] = str(review["_id"])
            review["user_id"] = str(review["user_id"])
            review["service_provider_id"] = str(review["service_provider_id"])
            
            if "service_id" in review and review["service_id"]:
                review["service_id"] = str(review["service_id"])
            
            # Get service provider info
            service_provider = await service_provider_collection.find_one({"_id": ObjectId(review["service_provider_id"])})
            if service_provider:
                service_provider["_id"] = str(service_provider["_id"])
                review["service_provider"] = service_provider
            
            # Get service info if present
            if "service_id" in review and review["service_id"]:
                service = await service_collection.find_one({"_id": ObjectId(review["service_id"])})
                if service:
                    service["_id"] = str(service["_id"])
                    review["service"] = service
            
            processed_reviews.append(review)
        
        return JSONResponse(
            status_code=200,
            content={
                "message": "User reviews fetched successfully",
                "reviews": processed_reviews,
                "count": len(processed_reviews),
                "status": True
            }
        )
    except Exception as e:
        logger.error(f"Error getting user reviews: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"message": f"An error occurred: {str(e)}", "status": False}
        )

async def update_review(review_id: str, review_data: ReviewUpdate):
    try:
        logger.info(f"Updating review: {review_id}")
        
        # Check if review exists
        existing_review = await review_collection.find_one({"_id": ObjectId(review_id)})
        if not existing_review:
            logger.warning(f"Review not found for update: {review_id}")
            return JSONResponse(
                status_code=404,
                content={"message": "Review not found", "status": False}
            )
        
        # Prepare update data
        update_data = {k: v for k, v in review_data.dict().items() if v is not None}
        
        # Add updated timestamp
        update_data["updated_at"] = datetime.now()
        
        # Update review
        result = await review_collection.update_one(
            {"_id": ObjectId(review_id)},
            {"$set": update_data}
        )
        
        if result.modified_count == 0 and result.matched_count > 0:
            logger.warning(f"No changes made to review: {review_id}")
            return JSONResponse(
                status_code=200,
                content={"message": "No changes were made", "status": True}
            )
        
        # If rating was updated, also update the service provider's average rating
        if "rating" in update_data:
            old_rating = existing_review.get("rating", 0)
            new_rating = update_data["rating"]
            
            if old_rating != new_rating:
                # Recalculate average rating for the service provider
                service_provider_id = str(existing_review["service_provider_id"])
                provider_reviews = await review_collection.find({"service_provider_id": ObjectId(service_provider_id)}).to_list(length=1000)
                
                total_rating = sum(review.get("rating", 0) for review in provider_reviews)
                avg_rating = total_rating / len(provider_reviews) if provider_reviews else 0
                
                # Update service provider's rating
                await service_provider_collection.update_one(
                    {"_id": ObjectId(service_provider_id)},
                    {"$set": {"avg_rating": round(avg_rating, 1), "total_ratings": len(provider_reviews)}}
                )
        
        # Get updated review
        updated_review = await review_collection.find_one({"_id": ObjectId(review_id)})
        
        # Convert ObjectId fields to strings
        updated_review["_id"] = str(updated_review["_id"])
        updated_review["user_id"] = str(updated_review["user_id"])
        updated_review["service_provider_id"] = str(updated_review["service_provider_id"])
        
        if "service_id" in updated_review and updated_review["service_id"]:
            updated_review["service_id"] = str(updated_review["service_id"])
        
        return JSONResponse(
            status_code=200,
            content={
                "message": "Review updated successfully",
                "review": updated_review,
                "status": True
            }
        )
    except Exception as e:
        logger.error(f"Error updating review: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"message": f"An error occurred: {str(e)}", "status": False}
        )

async def delete_review(review_id: str):
    try:
        logger.info(f"Deleting review: {review_id}")
        
        # Check if review exists
        existing_review = await review_collection.find_one({"_id": ObjectId(review_id)})
        if not existing_review:
            logger.warning(f"Review not found for deletion: {review_id}")
            return JSONResponse(
                status_code=404,
                content={"message": "Review not found", "status": False}
            )
        
        # Store the service provider ID before deleting the review
        service_provider_id = str(existing_review["service_provider_id"])
        
        # Delete review
        result = await review_collection.delete_one({"_id": ObjectId(review_id)})
        
        if result.deleted_count == 0:
            logger.warning(f"Failed to delete review: {review_id}")
            return JSONResponse(
                status_code=500,
                content={"message": "Failed to delete review", "status": False}
            )
        
        # Recalculate average rating for the service provider
        provider_reviews = await review_collection.find({"service_provider_id": ObjectId(service_provider_id)}).to_list(length=1000)
        
        if provider_reviews:
            total_rating = sum(review.get("rating", 0) for review in provider_reviews)
            avg_rating = total_rating / len(provider_reviews)
            
            # Update service provider's rating
            await service_provider_collection.update_one(
                {"_id": ObjectId(service_provider_id)},
                {"$set": {"avg_rating": round(avg_rating, 1), "total_ratings": len(provider_reviews)}}
            )
        else:
            # No reviews left, reset rating
            await service_provider_collection.update_one(
                {"_id": ObjectId(service_provider_id)},
                {"$set": {"avg_rating": 0, "total_ratings": 0}}
            )
        
        return JSONResponse(
            status_code=200,
            content={
                "message": "Review deleted successfully",
                "status": True
            }
        )
    except Exception as e:
        logger.error(f"Error deleting review: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"message": f"An error occurred: {str(e)}", "status": False}
        )

async def verify_review(review_id: str, is_verified: bool):
    try:
        logger.info(f"Setting review verification status to {is_verified} for review: {review_id}")
        
        # Check if review exists
        existing_review = await review_collection.find_one({"_id": ObjectId(review_id)})
        if not existing_review:
            logger.warning(f"Review not found: {review_id}")
            return JSONResponse(
                status_code=404,
                content={"message": "Review not found", "status": False}
            )
        
        # Update verification status
        result = await review_collection.update_one(
            {"_id": ObjectId(review_id)},
            {
                "$set": {
                    "is_verified": is_verified,
                    "updated_at": datetime.now()
                }
            }
        )
        
        if result.modified_count == 0:
            if existing_review.get("is_verified") == is_verified:
                return JSONResponse(
                    status_code=200,
                    content={"message": f"Review already {'verified' if is_verified else 'unverified'}", "status": True}
                )
            else:
                logger.warning(f"Failed to update verification status for review: {review_id}")
                return JSONResponse(
                    status_code=500,
                    content={"message": "Failed to update verification status", "status": False}
                )
        
        return JSONResponse(
            status_code=200,
            content={
                "message": f"Review {'verified' if is_verified else 'unverified'} successfully",
                "status": True
            }
        )
    except Exception as e:
        logger.error(f"Error updating review verification status: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"message": f"An error occurred: {str(e)}", "status": False}
        ) 