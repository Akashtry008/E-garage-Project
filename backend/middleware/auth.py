from fastapi import Request, HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from config.database import user_collection, role_collection
from bson import ObjectId
import jwt
import logging
from typing import Dict, Any

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# JWT Configuration
SECRET_KEY = "your_secret_key_here"  # Should match the one in AuthController
ALGORITHM = "HS256"

security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Get the current authenticated user from the JWT token.
    """
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        
        # Extract user ID from token
        user_id = payload.get("id")
        email = payload.get("sub")
        
        if user_id is None or email is None:
            logger.error("Invalid token payload")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Get user from database
        user = await user_collection.find_one({"_id": ObjectId(user_id)})
        
        if user is None:
            logger.error(f"User not found: {user_id}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Convert ObjectId to string
        user["_id"] = str(user["_id"])
        
        # Get role information if role_id exists
        if "role_id" in user:
            role_id = user["role_id"]
            if isinstance(role_id, ObjectId) or isinstance(role_id, str):
                role_id_obj = role_id if isinstance(role_id, ObjectId) else ObjectId(role_id)
                role = await role_collection.find_one({"_id": role_id_obj})
                if role:
                    role["_id"] = str(role["_id"])
                    user["role"] = role
            
            # Convert role_id to string if it's an ObjectId
            if isinstance(user["role_id"], ObjectId):
                user["role_id"] = str(user["role_id"])
        
        # Remove sensitive information
        if "password" in user:
            del user["password"]
        
        return user
        
    except jwt.ExpiredSignatureError:
        logger.error("Token has expired")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidTokenError:
        logger.error("Invalid token")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        logger.error(f"Authentication error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication error",
            headers={"WWW-Authenticate": "Bearer"},
        )

# Role-based authorization decorator
def has_role(required_roles: list):
    """
    Decorator for checking if user has specific role(s)
    Usage: @has_role(["admin"]) or @has_role(["admin", "moderator"])
    """
    async def role_checker(current_user: Dict[str, Any] = Depends(get_current_user)):
        user_role = current_user.get("role", {}).get("name")
        
        if not user_role or user_role not in required_roles:
            logger.warning(f"Access denied - required roles: {required_roles}, user role: {user_role}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to perform this action",
            )
        
        return current_user
    
    return role_checker 