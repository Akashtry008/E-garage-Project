from bson import ObjectId
from models.UserModel import User,UserOut,UserLogin,UserProfileUpdate,PasswordChange
from config.database import user_collection,role_collection
from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
import bcrypt
import logging
from typing import List, Dict, Any, Optional
from utils.Sendmail import send_mail
from datetime import datetime
from pymongo.errors import PyMongoError

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def addUser(user:User):
    #typeCast
    #print("user....",user.role_id)
    #convert string id to object it comp.,, to mongo db
    # user.role_id = ObjectId(user.role_id)
    # print("after type cast",user.role_id
    user.role_id = ObjectId(user.role_id)
    result = await user_collection.insert_one(user.dict())
    #return {"Message":"user created successfully"}
    
    return JSONResponse(status_code=201,content={"message":"User created successfully"})
    #raise HTTPException(status_code=500,detail="User not created")

# async def getAllUsers():
#     users = await user_collection.find().to_list()
#     return [UserOut(**user) for user in users]

async def getAllUsers():
    try:
        logger.info("Getting all users")
        users = await user_collection.find().to_list(length=1000)
        
        # Process users for response
        processed_users = []
        for user in users:
            # Convert ObjectId to string
            user["_id"] = str(user["_id"])
            if "role_id" in user and isinstance(user["role_id"], ObjectId):
                user["role_id"] = str(user["role_id"])
            
            # Remove sensitive information
            if "password" in user:
                del user["password"]
            
            processed_users.append(user)
        
        return JSONResponse(
            status_code=200,
            content={
                "message": "Users fetched successfully",
                "users": processed_users,
                "status": True
            }
        )
    except Exception as e:
        logger.error(f"Error getting all users: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"message": f"An error occurred: {str(e)}", "status": False}
        )

async def loginUser(request:UserLogin):
#async def loginUser(email:str,password:str):
    #norma; password : plain text --> encr
    
    foundUser = await user_collection.find_one({"email":request.email})
    print(":foundUser",foundUser)
    
    foundUser["_id"] = str(foundUser["_id"])
    foundUser["role_id"] = str(foundUser["role_id"])
    
    if foundUser is None:
        raise HTTPException(status_code=404,detail="User not found")
    #compare password
    if "password" in foundUser and bcrypt.checkpw(request.password.encode(),foundUser["password"].encode()):
        #database role.. roleid
        role = await role_collection.find_one({"_id":ObjectId(foundUser["role_id"])})
        foundUser["role"] = role
        return {"message":"user login success","user":UserOut(**foundUser)}
    else:
        raise HTTPException(status_code=404,detail="Invalid password")
    
# Get user by ID
async def getUserById(user_id: str):
    try:
        logger.info(f"Getting user by ID: {user_id}")
        user = await user_collection.find_one({"_id": ObjectId(user_id)})
        
        if not user:
            logger.warning(f"User not found: {user_id}")
            return JSONResponse(
                status_code=404,
                content={"message": "User not found", "status": False}
            )
        
        # Convert ObjectId to string
        user["_id"] = str(user["_id"])
        if "role_id" in user and isinstance(user["role_id"], ObjectId):
            user["role_id"] = str(user["role_id"])
        
        # Remove sensitive information
        if "password" in user:
            del user["password"]
        
        return JSONResponse(
            status_code=200,
            content={
                "message": "User found successfully",
                "user": user,
                "status": True
            }
        )
    except Exception as e:
        logger.error(f"Error getting user by ID: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"message": f"An error occurred: {str(e)}", "status": False}
        )

# Update user
async def updateUser(user_id: str, user_data: UserProfileUpdate):
    try:
        logger.info(f"Updating user: {user_id}")
        
        # Check if user exists
        existing_user = await user_collection.find_one({"_id": ObjectId(user_id)})
        if not existing_user:
            logger.warning(f"User not found for update: {user_id}")
            return JSONResponse(
                status_code=404,
                content={"message": "User not found", "status": False}
            )
        
        # Prepare update data
        update_data = {k: v for k, v in user_data.dict().items() if v is not None}
        
        # Don't allow updating sensitive fields through this endpoint
        if "password" in update_data:
            del update_data["password"]
        if "role_id" in update_data:
            del update_data["role_id"]
        
        # If email is being updated, check if new email already exists
        if "email" in update_data and update_data["email"] != existing_user.get("email"):
            existing_email = await user_collection.find_one({"email": update_data["email"]})
            if existing_email:
                logger.warning(f"Email already in use: {update_data['email']}")
                return JSONResponse(
                    status_code=400,
                    content={"message": "Email already in use by another account", "status": False}
                )
        
        # Update user
        result = await user_collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": update_data}
        )
        
        if result.modified_count == 0:
            logger.warning(f"No changes made to user: {user_id}")
            return JSONResponse(
                status_code=200,
                content={"message": "No changes were made", "status": True}
            )
        
        # Get updated user
        updated_user = await user_collection.find_one({"_id": ObjectId(user_id)})
        updated_user["_id"] = str(updated_user["_id"])
        if "role_id" in updated_user and isinstance(updated_user["role_id"], ObjectId):
            updated_user["role_id"] = str(updated_user["role_id"])
        
        # Remove sensitive information
        if "password" in updated_user:
            del updated_user["password"]
        
        return JSONResponse(
            status_code=200,
            content={
                "message": "User updated successfully",
                "user": updated_user,
                "status": True
            }
        )
    except Exception as e:
        logger.error(f"Error updating user: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"message": f"An error occurred: {str(e)}", "status": False}
        )

# Delete user
async def deleteUser(user_id: str):
    try:
        logger.info(f"Deleting user: {user_id}")
        
        # Check if user exists
        existing_user = await user_collection.find_one({"_id": ObjectId(user_id)})
        if not existing_user:
            logger.warning(f"User not found for deletion: {user_id}")
            return JSONResponse(
                status_code=404,
                content={"message": "User not found", "status": False}
            )
        
        # Delete user
        result = await user_collection.delete_one({"_id": ObjectId(user_id)})
        
        if result.deleted_count == 0:
            logger.warning(f"Failed to delete user: {user_id}")
            return JSONResponse(
                status_code=500,
                content={"message": "Failed to delete user", "status": False}
            )
        
        return JSONResponse(
            status_code=200,
            content={
                "message": "User deleted successfully",
                "status": True
            }
        )
    except Exception as e:
        logger.error(f"Error deleting user: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"message": f"An error occurred: {str(e)}", "status": False}
        )

# Change user password
async def changeUserPassword(user_id: str, password_data: PasswordChange):
    try:
        logger.info(f"Changing password for user: {user_id}")
        
        # Check if user exists
        existing_user = await user_collection.find_one({"_id": ObjectId(user_id)})
        if not existing_user:
            logger.warning(f"User not found for password change: {user_id}")
            return JSONResponse(
                status_code=404,
                content={"message": "User not found", "status": False}
            )
        
        # Verify current password
        stored_password = existing_user.get("password", "")
        if not stored_password:
            logger.warning(f"User has no password set: {user_id}")
            return JSONResponse(
                status_code=400,
                content={"message": "User has no password set", "status": False}
            )
        
        # Verify the current password
        password_matched = False
        try:
            # Try direct string comparison if not hashed
            if password_data.current_password == stored_password:
                password_matched = True
            else:
                # Try bcrypt verification
                try:
                    password_matched = bcrypt.checkpw(
                        password_data.current_password.encode(), 
                        stored_password.encode('utf-8')
                    )
                except Exception as pw_err:
                    logger.error(f"Password check error: {str(pw_err)}")
        except Exception as e:
            logger.error(f"Password verification error: {str(e)}")
        
        if not password_matched:
            logger.warning(f"Current password is incorrect for user: {user_id}")
            return JSONResponse(
                status_code=400,
                content={"message": "Current password is incorrect", "status": False}
            )
        
        # Hash the new password
        hashed_password = bcrypt.hashpw(
            password_data.new_password.encode('utf-8'), 
            bcrypt.gensalt()
        ).decode('utf-8')
        
        # Update the password
        result = await user_collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"password": hashed_password}}
        )
        
        if result.modified_count == 0:
            logger.warning(f"Failed to update password for user: {user_id}")
            return JSONResponse(
                status_code=500,
                content={"message": "Failed to update password", "status": False}
            )
        
        return JSONResponse(
            status_code=200,
            content={
                "message": "Password updated successfully",
                "status": True
            }
        )
    except Exception as e:
        logger.error(f"Error changing password: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"message": f"An error occurred: {str(e)}", "status": False}
        )
    
async def get_all_users(skip: int = 0, limit: int = 100) -> List[Dict]:
    """
    Get all users with pagination
    
    Args:
        skip: Number of records to skip
        limit: Maximum number of records to return
        
    Returns:
        List[Dict]: List of users
    """
    try:
        users = []
        cursor = user_collection.find().skip(skip).limit(limit).sort("created_at", -1)
        
        async for document in cursor:
            # Convert ObjectId to string
            if "_id" in document:
                document["id"] = str(document.pop("_id"))
            
            # Convert role_id ObjectId to string if present
            if "role_id" in document and isinstance(document["role_id"], ObjectId):
                document["role_id"] = str(document["role_id"])
            
            # Convert datetime to ISO format if present
            if "created_at" in document and isinstance(document["created_at"], datetime):
                document["created_at"] = document["created_at"].isoformat()
            if "updated_at" in document and isinstance(document["updated_at"], datetime):
                document["updated_at"] = document["updated_at"].isoformat()
                
            # Remove password field for security
            if "password" in document:
                document.pop("password")
                
            # Add missing fields needed by frontend
            if "is_active" not in document:
                document["is_active"] = True
                
            users.append(document)
        
        logger.info(f"Retrieved {len(users)} users")
        
        # Return data in consistent format
        return users
    
    except PyMongoError as e:
        logger.error(f"Database error retrieving users: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Database error: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Unexpected error retrieving users: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"An unexpected error occurred: {str(e)}"
        )

async def get_user_count() -> int:
    """
    Get total count of users
    
    Returns:
        int: Total number of users
    """
    try:
        count = await user_collection.count_documents({})
        logger.info(f"User count: {count}")
        return count
    
    except PyMongoError as e:
        logger.error(f"Database error getting user count: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Database error: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Unexpected error getting user count: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"An unexpected error occurred: {str(e)}"
        )

async def get_user_by_id(user_id: str) -> Optional[Dict]:
    """
    Get a user by their ID
    
    Args:
        user_id: The ID of the user to retrieve
        
    Returns:
        Dict: The user if found, None otherwise
    """
    try:
        # Convert string ID to ObjectId
        oid = ObjectId(user_id)
        user = await user_collection.find_one({"_id": oid})
        
        if user:
            # Convert ObjectId to string
            user["id"] = str(user.pop("_id"))
            
            # Convert datetime to ISO format if present
            if "created_at" in user and isinstance(user["created_at"], datetime):
                user["created_at"] = user["created_at"].isoformat()
            if "updated_at" in user and isinstance(user["updated_at"], datetime):
                user["updated_at"] = user["updated_at"].isoformat()
                
            # Remove password field for security
            if "password" in user:
                user.pop("password")
                
            logger.info(f"Retrieved user with ID: {user_id}")
            return user
        
        logger.warning(f"User with ID {user_id} not found")
        return None
    
    except PyMongoError as e:
        logger.error(f"Database error retrieving user: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Database error: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Unexpected error retrieving user: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"An unexpected error occurred: {str(e)}"
        )

async def update_user_profile(user_id: str, user_update: UserProfileUpdate) -> Optional[Dict]:
    """
    Update a user's profile
    
    Args:
        user_id: The ID of the user to update
        user_update: The user update data
        
    Returns:
        Dict: The updated user if successful, None otherwise
    """
    try:
        # Convert string ID to ObjectId
        oid = ObjectId(user_id)
        
        # Check if user exists
        existing_user = await user_collection.find_one({"_id": oid})
        if not existing_user:
            logger.warning(f"User with ID {user_id} not found for update")
            return None
        
        # Prepare update data
        update_data = user_update.dict(exclude_unset=True)
        update_data["updated_at"] = datetime.now()
        
        # Update the user
        result = await user_collection.update_one(
            {"_id": oid},
            {"$set": update_data}
        )
        
        if result.modified_count:
            # Get the updated user
            updated_user = await user_collection.find_one({"_id": oid})
            
            # Convert ObjectId to string
            updated_user["id"] = str(updated_user.pop("_id"))
            
            # Convert datetime to ISO format
            if "created_at" in updated_user and isinstance(updated_user["created_at"], datetime):
                updated_user["created_at"] = updated_user["created_at"].isoformat()
            if "updated_at" in updated_user and isinstance(updated_user["updated_at"], datetime):
                updated_user["updated_at"] = updated_user["updated_at"].isoformat()
            
            # Remove password field for security
            if "password" in updated_user:
                updated_user.pop("password")
            
            logger.info(f"Updated profile for user ID: {user_id}")
            return updated_user
        
        logger.warning(f"No changes made to user with ID: {user_id}")
        return await get_user_by_id(user_id)
    
    except PyMongoError as e:
        logger.error(f"Database error updating user: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Database error: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Unexpected error updating user: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"An unexpected error occurred: {str(e)}"
        )

async def delete_user(user_id: str) -> bool:
    """
    Delete a user
    
    Args:
        user_id: The ID of the user to delete
        
    Returns:
        bool: True if successful, False otherwise
    """
    try:
        # Convert string ID to ObjectId
        oid = ObjectId(user_id)
        
        # Check if user exists
        existing_user = await user_collection.find_one({"_id": oid})
        if not existing_user:
            logger.warning(f"User with ID {user_id} not found for deletion")
            return False
        
        # Delete the user
        result = await user_collection.delete_one({"_id": oid})
        
        if result.deleted_count:
            logger.info(f"Deleted user with ID: {user_id}")
            return True
        
        logger.warning(f"Failed to delete user with ID: {user_id}")
        return False
    
    except PyMongoError as e:
        logger.error(f"Database error deleting user: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Database error: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Unexpected error deleting user: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"An unexpected error occurred: {str(e)}"
        )
    
    
