from fastapi import APIRouter, Depends, HTTPException, Body, Query, Path
from fastapi.responses import JSONResponse
from typing import List, Optional, Dict
import logging

from models.UserModel import UserOut, UserProfileUpdate
from controllers.UserController import (
    get_all_users,
    get_user_by_id,
    update_user_profile,
    delete_user,
    get_user_count
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create router
user_router = APIRouter(
    tags=["Users"],
    responses={404: {"description": "Not found"}}
)

@user_router.get("/", response_model=List[Dict])
async def api_get_all_users(
    skip: int = Query(0, description="Number of records to skip"),
    limit: int = Query(100, description="Maximum number of records to return")
):
    """
    Get all users
    """
    logger.info(f"API: Retrieving all users")
    try:
        users = await get_all_users(skip, limit)
        
        # For debugging, log the structure of what we're returning
        if users:
            logger.info(f"Returning {len(users)} users")
            logger.info(f"First user sample (partial): {str(users[0])[:200]}...")
        else:
            logger.info("No users found")
            
        return users
    except Exception as e:
        logger.error(f"Error retrieving users: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving users: {str(e)}"
        )

@user_router.get("/count")
async def api_get_user_count():
    """
    Get total number of users
    """
    logger.info(f"API: Getting user count")
    count = await get_user_count()
    return {"count": count}

@user_router.get("/{user_id}", response_model=UserOut)
async def api_get_user(
    user_id: str = Path(..., description="The ID of the user to retrieve")
):
    """
    Get a user by ID
    """
    logger.info(f"API: Retrieving user with ID: {user_id}")
    user = await get_user_by_id(user_id)
    
    if not user:
        raise HTTPException(
            status_code=404,
            detail=f"User with ID {user_id} not found"
        )
    
    return user

@user_router.patch("/{user_id}", response_model=UserOut)
async def api_update_user_profile(
    user_profile: UserProfileUpdate = Body(...),
    user_id: str = Path(..., description="The ID of the user to update")
):
    """
    Update a user's profile
    """
    logger.info(f"API: Updating profile for user ID: {user_id}")
    updated_user = await update_user_profile(user_id, user_profile)
    
    if not updated_user:
        raise HTTPException(
            status_code=404,
            detail=f"User with ID {user_id} not found"
        )
    
    return updated_user

@user_router.delete("/{user_id}")
async def api_delete_user(
    user_id: str = Path(..., description="The ID of the user to delete")
):
    """
    Delete a user
    """
    logger.info(f"API: Deleting user with ID: {user_id}")
    success = await delete_user(user_id)
    
    if not success:
        raise HTTPException(
            status_code=404,
            detail=f"User with ID {user_id} not found"
        )
    
    return JSONResponse(
        status_code=200,
        content={"status": "success", "message": "User deleted successfully"}
    )