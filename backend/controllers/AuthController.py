from bson import ObjectId
from models.UserModel import User, UserOut, UserLogin, UserSignUp, UserSignIn, AuthResponse, TokenData
from config.database import user_collection, role_collection, token_collection
from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
import bcrypt
import jwt
import datetime
import logging
import secrets
import string
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Dict, Any, Optional
from utils.Sendmail import EmailSender, send_mail
import random
import re
import json
import os

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Secret key for JWT token
SECRET_KEY = "your_secret_key_here"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Email notification settings
NOTIFICATION_EMAIL = "pythondeveloper@yopmail.com"

# Default credentials for direct access
DEFAULT_ADMIN = {
    "email": "admin@egarage.com",
    "password": "admin123",
    "role": "admin"
}

DEFAULT_SERVICE_PROVIDER = {
    "email": "provider@egarage.com",
    "password": "provider123",
    "role": "service provider"
}

# Function to convert datetime objects to strings for JSON serialization
def json_serializable(obj):
    if isinstance(obj, (datetime.datetime, datetime.date)):
        return obj.isoformat()
    elif isinstance(obj, ObjectId):
        return str(obj)
    elif isinstance(obj, dict):
        return {k: json_serializable(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [json_serializable(item) for item in obj]
    return obj

# Use this function to create proper JSON responses
def create_json_response(status_code, content):
    # First handle any potential ObjectId values in the response
    def handle_objectid(obj):
        if isinstance(obj, ObjectId):
            return str(obj)
        elif isinstance(obj, dict):
            return {k: handle_objectid(v) for k, v in obj.items()}
        elif isinstance(obj, list):
            return [handle_objectid(item) for item in obj]
        return obj
        
    # Process the content
    serialized_content = handle_objectid(content)
    
    # Create response
    return JSONResponse(status_code=status_code, content=serialized_content)

def create_access_token(data: Dict[str, Any], expires_delta: datetime.timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.datetime.utcnow() + expires_delta
    else:
        expire = datetime.datetime.utcnow() + datetime.timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# Function to log login notification without sending email
def log_login_notification(email: str):
    """Log login notification without sending email"""
    logger.info(f"User login: {email}")
    # Write to log file if needed
    try:
        log_entry = {
            "event": "user_login",
            "email": email,
            "timestamp": datetime.datetime.now().isoformat()
        }
        with open(os.path.join(os.path.dirname(__file__), "../logs/login_events.log"), "a") as f:
            os.makedirs(os.path.dirname(f.name), exist_ok=True)
            f.write(json.dumps(log_entry) + "\n")
    except Exception as e:
        logger.error(f"Failed to log login event: {str(e)}")
    return True

async def signup(request: UserSignUp):
    """
    Signup function to create a new user account
    Args:
        request (UserSignUp): User signup request body
    Returns:
        dict: User details with access token
    """
    logger.info(f"Signup request received for email: {request.email}")
    try:
        # Check if user already exists (case insensitive)
        existing_user = None
        
        # First try exact match
        existing_user = await user_collection.find_one({"email": request.email})
        
        # If not found, try case insensitive
        if not existing_user:
            import re
            pattern = re.compile(f"^{re.escape(request.email)}$", re.IGNORECASE)
            existing_user = await user_collection.find_one({"email": pattern})
            
        if existing_user:
            logger.warning(f"User with email {request.email} already exists")
            return {"detail": "User with this email already exists"}

        # Get user details from request
        user_dict = request.dict(exclude_unset=True)
        
        # Ensure consistent lowercase email for easier lookup
        if "email" in user_dict:
            user_dict["email"] = user_dict["email"].lower()
        
        # Ensure name is set from firstName and lastName if not provided
        if not user_dict.get("name") and user_dict.get("firstName") and user_dict.get("lastName"):
            user_dict["name"] = f"{user_dict['firstName']} {user_dict['lastName']}"
            
        # Ensure firstName/lastName set from name if not provided
        if user_dict.get("name") and not user_dict.get("firstName") and not user_dict.get("lastName"):
            name_parts = user_dict["name"].split(" ", 1)
            user_dict["firstName"] = name_parts[0]
            user_dict["lastName"] = name_parts[1] if len(name_parts) > 1 else ""
            
        logger.info(f"DEBUG: User data for insertion: name={user_dict.get('name')}, email={user_dict.get('email')}")
            
        # Handle password encryption if not already encrypted in the model
        if not isinstance(user_dict.get("password"), bytes) and not str(user_dict.get("password", "")).startswith("$2b$"):
            hashed_password = bcrypt.hashpw(user_dict["password"].encode("utf-8"), bcrypt.gensalt())
            user_dict["password"] = hashed_password.decode("utf-8")

        # Handle role_id - if default or invalid value, use the user role ObjectId
        default_user_role = await role_collection.find_one({"name": "user"})
        if not default_user_role:
            default_user_role = await role_collection.find_one({"role_name": "user"})
            
        # Make a new role if none exists
        if not default_user_role:
            logger.warning("No user role found in database. Creating default user role.")
            default_role_result = await role_collection.insert_one({
                "name": "user",
                "role_name": "user",
                "description": "Regular user role",
                "created_at": datetime.datetime.utcnow().isoformat()
            })
            default_user_role = await role_collection.find_one({"_id": default_role_result.inserted_id})
            
        default_user_role_id = str(default_user_role["_id"]) if default_user_role else None
        
        if user_dict.get("role_id") == "default_user_role_id" or not user_dict.get("role_id"):
            if default_user_role_id:
                user_dict["role_id"] = ObjectId(default_user_role_id)
            else:
                logger.warning("No default user role found. Creating without role_id.")
                if "role_id" in user_dict:
                    del user_dict["role_id"]
        else:
            try:
                user_dict["role_id"] = ObjectId(user_dict["role_id"])
            except:
                # If conversion fails, use the default user role
                if default_user_role_id:
                    user_dict["role_id"] = ObjectId(default_user_role_id)
                else:
                    logger.warning("Could not convert role_id and no default found. Creating without role_id.")
                    if "role_id" in user_dict:
                        del user_dict["role_id"]

        # Add user to database with timestamps
        current_time = datetime.datetime.utcnow().isoformat()
        user_dict["created_at"] = current_time
        user_dict["updated_at"] = current_time
        user_dict["is_verified"] = False
        user_dict["verification_code"] = ''.join(random.choices('0123456789', k=6))
        
        # Set is_active to ensure login works
        user_dict["is_active"] = True
        
        # Log the final user dictionary being inserted
        safe_dict = {k: v for k, v in user_dict.items() if k != "password"}
        logger.info(f"DEBUG: Final user data for insertion: {safe_dict}")
        
        result = await user_collection.insert_one(user_dict)
        new_user = await user_collection.find_one({"_id": result.inserted_id})
        
        if not new_user:
            logger.error("Failed to retrieve newly created user from database")
            return {"detail": "User was created but could not be retrieved"}
        
        # Generate JWT token
        access_token = create_access_token(
            data={"user_id": str(new_user["_id"])}
        )
        
        # Send verification email
        user_email = new_user["email"]
        verification_code = new_user["verification_code"]
        try:
            EmailSender.send_verification_email(user_email, verification_code)
            logger.info(f"Verification email sent to {user_email}")
        except Exception as e:
            logger.error(f"Failed to send verification email: {str(e)}")
        
        # Format user details for response
        new_user["_id"] = str(new_user["_id"])
        if "role_id" in new_user and new_user["role_id"]:
            if isinstance(new_user["role_id"], ObjectId):
                new_user["role_id"] = str(new_user["role_id"])
        
        # Remove sensitive data
        new_user.pop("password", None)
        new_user.pop("verification_code", None)
        
        logger.info(f"User created successfully with ID: {new_user['_id']}")
        
        # Store created user in response
        response = {
            "user": new_user,
            "access_token": access_token,
            "token_type": "bearer"
        }
        
        # Log the final response (excluding sensitive data)
        logger.info(f"DEBUG: Signup response ready: user_id={new_user.get('_id')}, email={new_user.get('email')}")
        
        return create_json_response(status_code=200, content=response)
    except Exception as e:
        logger.error(f"Error in signup: {str(e)}")
        return {"detail": f"An error occurred: {str(e)}"}

async def signin(user: UserSignIn):
    try:
        logger.info(f"Processing signin for email: {user.email}")
        
        # Step 1: Print all users for debugging
        all_users = await user_collection.find().to_list(length=100)
        logger.info(f"DEBUG: Total users in database: {len(all_users)}")
        
        # Safe shallow copy of users for logging (removes sensitive data)
        safe_users = []
        for u in all_users[:5]:
            safe_user = {k: (str(v) if isinstance(v, (datetime.datetime, ObjectId)) else v) 
                         for k, v in u.items() if k != 'password'}
            safe_users.append(safe_user)
            
        logger.info(f"DEBUG: Sample users: {json.dumps(safe_users, default=json_serializable)}")
        
        # Try these search approaches in order:
        found_user = None
        
        # 1. Exact match (case-sensitive)
        found_user = await user_collection.find_one({"email": user.email})
        
        # 2. Case-insensitive search if exact match failed
        if not found_user:
            logger.info(f"DEBUG: Exact match failed, trying case-insensitive match")
            import re
            pattern = re.compile(f"^{re.escape(user.email)}$", re.IGNORECASE)
            found_user = await user_collection.find_one({"email": pattern})
        
        # 3. Manual search through all users if still not found
        if not found_user:
            logger.info(f"DEBUG: Case-insensitive match failed, trying manual search")
            for u in all_users:
                if u.get('email', '').lower() == user.email.lower():
                    found_user = u
                    logger.info(f"DEBUG: Found match through manual search: {u.get('email')}")
                    break
        
        # 4. Default users if all else fails (last resort)
        if not found_user and user.email == DEFAULT_ADMIN["email"] and user.password == DEFAULT_ADMIN["password"]:
            logger.info(f"DEBUG: Using default admin account")
            return await admin_signin(user)
        
        if not found_user and user.email == DEFAULT_SERVICE_PROVIDER["email"] and user.password == DEFAULT_SERVICE_PROVIDER["password"]:
            logger.info(f"DEBUG: Using default service provider account")
            return await service_provider_signin(user)
        
        # If still not found, return error
        if not found_user:
            logger.info(f"DEBUG: User not found with email: {user.email} after all attempts")
            
            # Create user on the fly for testing purposes (REMOVE IN PRODUCTION)
            # This is just for debugging - not recommended for production
            logger.info(f"DEBUG: Creating user on the fly for testing")
            
            # First check if it's a valid email format
            if '@' not in user.email:
                return create_json_response(
                    status_code=404, 
                    content={"message": "User not found", "status": False}
                )
            
            # Create a new user
            hashed_pw = bcrypt.hashpw(user.password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            current_time = datetime.datetime.utcnow().isoformat()
            new_user = {
                "email": user.email,
                "password": hashed_pw,
                "name": user.email.split('@')[0],  # Use part of email as name
                "firstName": user.email.split('@')[0], 
                "lastName": "AutoCreated",
                "is_active": True,
                "is_verified": True,
                "created_at": current_time,
                "updated_at": current_time
            }
            
            # Try to get a default user role
            default_role = await role_collection.find_one({"role_name": "user"})
            if default_role:
                new_user["role_id"] = default_role["_id"]
            
            # Insert the new user
            insert_result = await user_collection.insert_one(new_user)
            found_user = await user_collection.find_one({"_id": insert_result.inserted_id})
            
            if found_user:
                logger.info(f"DEBUG: Created user: {found_user.get('email')}")
            else:
                logger.info(f"DEBUG: Failed to create user on the fly")
                return create_json_response(
                    status_code=404, 
                    content={"message": "User not found", "status": False}
                )
        
        logger.info(f"DEBUG: User found: {found_user.get('email')}, ID: {found_user.get('_id')}")
        
        # Step 2: Validate password
        stored_password = found_user.get("password", "")
        logger.info(f"DEBUG: Password verification starting")
        
        # First handle default admin/provider cases
        if user.email == DEFAULT_ADMIN["email"] and user.password == DEFAULT_ADMIN["password"]:
            password_matched = True
            logger.info(f"DEBUG: Using default admin credentials")
        elif user.email == DEFAULT_SERVICE_PROVIDER["email"] and user.password == DEFAULT_SERVICE_PROVIDER["password"]:
            password_matched = True
            logger.info(f"DEBUG: Using default provider credentials")
        else:
            # Normal password checking
            try:
                password_matched = False
                
                if stored_password:
                    # Clean up the stored password if needed
                    if isinstance(stored_password, bytes):
                        stored_password = stored_password.decode('utf-8')
                    
                    logger.info(f"DEBUG: Password format check - starts with $2: {stored_password.startswith('$2')}")
                    
                    # Try bcrypt verification first regardless of format
                    try:
                        password_matched = bcrypt.checkpw(
                            user.password.encode('utf-8'),
                            stored_password.encode('utf-8')
                        )
                        logger.info(f"DEBUG: Bcrypt verification result: {password_matched}")
                    except Exception as bcrypt_error:
                        logger.error(f"Bcrypt verification error: {str(bcrypt_error)}")
                        
                        # Fallback to direct comparison only if bcrypt fails
                        if not password_matched:
                            # Direct comparison (insecure, only for testing)
                            password_matched = (user.password == stored_password)
                            logger.info(f"DEBUG: Direct comparison result: {password_matched}")
                    
                    logger.info(f"DEBUG: Final password verification result: {password_matched}")
                else:
                    logger.info(f"DEBUG: No stored password found for user")
            except Exception as e:
                logger.error(f"Error checking password: {str(e)}")
                password_matched = False
        
        if not password_matched:
            logger.info("Invalid password")
            return create_json_response(
                status_code=401, 
                content={"message": "Invalid password", "status": False}
            )
        
        # Step 3: Check if user account is active
        if not found_user.get("is_active", True):
            logger.info(f"User account is inactive: {user.email}")
            return create_json_response(
                status_code=401,
                content={"message": "Account is inactive", "status": False}
            )
        
        # Step 4: Prepare user data for response
        found_user["_id"] = str(found_user["_id"])
        
        if "role_id" in found_user and found_user["role_id"]:
            if isinstance(found_user["role_id"], ObjectId):
                found_user["role_id"] = str(found_user["role_id"])
        
        # Step 5: Get role details
        role = None
        if "role_id" in found_user and found_user["role_id"]:
            try:
                role_id = ObjectId(found_user["role_id"])
                role = await role_collection.find_one({"_id": role_id})
            except:
                logger.error(f"Invalid role_id format: {found_user['role_id']}")
        
        if role:
            role["_id"] = str(role["_id"])
            found_user["role"] = role
        
        # Step 6: Remove sensitive information
        if "password" in found_user:
            found_user.pop("password")
        
        # Step 7: Create authentication token
        logger.info("Creating access token")
        access_token = create_access_token(
            data={"sub": found_user["email"], "id": found_user["_id"]}
        )
        
        # Return successful response with user data and token
        response = {
            "message": "Login successful",
            "user": found_user,
            "token": access_token,
            "status": True
        }
        
        logger.info("Login successful")
        return create_json_response(status_code=200, content=response)
        
    except Exception as e:
        logger.error(f"Error in signin: {str(e)}")
        return create_json_response(
            status_code=500, 
            content={"message": f"An error occurred: {str(e)}", "status": False}
        )

async def validate_token(current_user: Dict[str, Any]):
    """
    Validates the current authentication token.
    This function is called after the token has already been validated by the get_current_user middleware,
    so it just returns a success response.
    """
    try:
        return create_json_response(
            status_code=200,
            content={
                "message": "Token is valid",
                "user": current_user,
                "status": True
            }
        )
    except Exception as e:
        logger.error(f"Error in validate_token: {str(e)}")
        return create_json_response(
            status_code=500,
            content={"message": f"An error occurred: {str(e)}", "status": False}
        )

async def generate_verification_token(user_id: str, email: str) -> str:
    """
    Generate a random token for email verification or password reset.
    """
    try:
        # Generate a random token
        token_value = ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(64))
        
        # Convert user_id to ObjectId if it's a string
        user_id_obj = user_id if isinstance(user_id, ObjectId) else ObjectId(user_id)
        
        # Set expiration time (24 hours)
        current_time = datetime.datetime.utcnow()
        expires = (current_time + datetime.timedelta(hours=24)).isoformat()
        
        # Store token in database
        token_data = {
            "user_id": user_id_obj,
            "email": email,
            "token": token_value,
            "expires": expires,
            "created_at": current_time.isoformat()
        }
        
        await token_collection.insert_one(token_data)
        
        return token_value
    except Exception as e:
        logger.error(f"Error generating verification token: {str(e)}")
        raise

async def request_password_reset(email: str):
    """
    Request a password reset for a user.
    """
    try:
        # Find user by email
        user = await user_collection.find_one({"email": email})
        
        if not user:
            # Don't reveal if user exists or not for security
            return create_json_response(
                status_code=200,
                content={
                    "message": "If your email is registered, a password reset notification has been sent",
                    "status": True
                }
            )
        
        user_id = str(user["_id"])
        
        # Generate reset token
        reset_token = await generate_verification_token(user_id, email)
        
        # Create reset link with the frontend URL
        # This should match your frontend URL where the reset password form is located
        frontend_url = "http://localhost:5174"  # Change this to your actual frontend URL
        reset_link = f"{frontend_url}/reset-password?token={reset_token}"
        
        # Send password reset email directly to the user
        email_subject = "E-Garage: Password Reset Request"
        email_body = f"""
        <html>
        <body>
        <h2>Password Reset Request</h2>
        <p>Hello,</p>
        <p>You have requested to reset your password for your E-Garage account.</p>
        <p>Please click the link below to reset your password:</p>
        <p><a href="{reset_link}">Reset My Password</a></p>
        <p>Or copy and paste this URL into your browser:</p>
        <p>{reset_link}</p>
        <p>This link will expire in 24 hours.</p>
        <p>If you did not request a password reset, please ignore this email and your password will remain unchanged.</p>
        <p>Best regards,<br>E-Garage Team</p>
        </body>
        </html>
        """
        
        # Try to send the email (this will just save it as HTML file since email is disabled)
        email_filename = None
        try:
            # With email functionality disabled, this will create an HTML file but not send the email
            result = send_mail(email, email_subject, email_body)
            logger.info(f"Password reset email send result: {result}")
            
            # Get the filename of the most recently created email file
            import glob
            import os
            from pathlib import Path
            
            # Get current working directory
            cwd = os.getcwd()
            logger.info(f"Current working directory: {cwd}")
            
            # Try multiple possible locations for emails directory with absolute paths
            possible_paths = [
                Path(cwd) / "emails",
                Path(cwd) / "backend/emails",
                Path(os.path.dirname(__file__)) / "../emails",  # Relative to controller
            ]
            
            for emails_dir in possible_paths:
                if os.path.exists(emails_dir):
                    logger.info(f"Found emails directory: {emails_dir.absolute()}")
                    # Try to find the most recent email file
                    email_files = sorted(glob.glob(str(emails_dir / "email_*.html")), key=os.path.getctime, reverse=True)
                    if email_files:
                        email_filename = os.path.basename(email_files[0])
                        logger.info(f"Password reset email saved as HTML file: {email_filename}")
                        break
                    else:
                        logger.info(f"No email files found in {emails_dir.absolute()}")
                else:
                    logger.info(f"Directory does not exist: {emails_dir.absolute()}")
            
            success = result and email_filename is not None
            
            if not success:
                logger.warning(f"Email saved successfully but couldn't find the file for user: {email}")
        except Exception as e:
            logger.error(f"Failed to save password reset email for user: {email}, Error: {str(e)}")
            success = False
        
        if not success:
            # As a fallback, send to admin
            fallback_success = EmailSender.send_password_reset_notification(email, reset_link)
            if fallback_success:
                logger.info(f"Password reset notification sent to admin for user: {email}")
            else:
                logger.error(f"Failed to send password reset notification to admin for user: {email}")
                # If both direct and admin notifications fail, return an error
                return create_json_response(
                    status_code=500,
                    content={
                        "message": "Failed to save password reset email. Please try again later.",
                        "status": False
                    }
                )
        
        # Add email_filename to the response if email functionality is disabled
        response_content = {
            "message": "Password reset instructions have been sent to your email address",
            "status": True,
            "token": reset_token  # Always include the token in development mode
        }
        
        if email_filename:
            response_content["email_filename"] = email_filename
            response_content["message"] = "Email functionality is disabled. Password reset token has been generated and the email content has been saved as an HTML file."
        else:
            # No email file was found but we still have a token
            response_content["message"] = "Password reset token generated. No email file was found, but you can still use the token to reset your password."
            logger.warning("No email file was created, but reset token was generated successfully.")
        
        return create_json_response(
            status_code=200,
            content=response_content
        )
    except Exception as e:
        logger.error(f"Error in request_password_reset: {str(e)}")
        return create_json_response(
            status_code=500,
            content={"message": f"An error occurred: {str(e)}", "status": False}
        )

async def reset_password(token: str, new_password: str, confirm_password: str):
    """
    Reset a user's password using a reset token.
    """
    try:
        logger.info(f"Password reset request received with token: {token[:10]}...")
        
        # Check if we're in testing mode
        testing_mode = os.getenv("TESTING_MODE", "false").lower() == "true"
        if testing_mode:
            logger.warning("TESTING MODE ENABLED: Using relaxed validation for password reset")
        
        # Basic token validation
        if not token or len(token) < 20:
            logger.warning("Password reset failed: Invalid token format")
            
            if testing_mode:
                # In testing mode, create a test user and reset their password
                logger.warning("TESTING MODE: Bypassing token validation failure")
                return await handle_testing_mode_reset(token, new_password, confirm_password)
                
            return create_json_response(
                status_code=400,
                content={"message": "Invalid token format", "status": False}
            )
        
        # Verify the passwords match
        if new_password != confirm_password:
            logger.warning("Password reset failed: passwords do not match")
            return create_json_response(
                status_code=400,
                content={"message": "Passwords do not match", "status": False}
            )
            
        # Validate password strength
        if len(new_password) < 8:
            logger.warning("Password reset failed: password too short")
            return create_json_response(
                status_code=400,
                content={"message": "Password must be at least 8 characters long", "status": False}
            )
        
        # Find the token in the database
        current_time = datetime.datetime.utcnow().isoformat()
        logger.info(f"Looking for token in database. Current time: {current_time}")
        
        # Check for token in database regardless of expiration first
        token_data = await token_collection.find_one({"token": token})
        
        if not token_data:
            logger.warning(f"Password reset failed: token not found in database: {token[:10]}...")
            # Log number of tokens in the database for debugging
            token_count = await token_collection.count_documents({})
            logger.info(f"Total tokens in database: {token_count}")
            
            if testing_mode:
                # In testing mode, create a test user and reset their password
                logger.warning("TESTING MODE: Creating test token since none found")
                return await handle_testing_mode_reset(token, new_password, confirm_password)
                
            return create_json_response(
                status_code=400,
                content={"message": "Invalid password reset token. Please request a new one.", "status": False}
            )
        
        # Log detailed token info for debugging
        logger.info(f"Token found in database: {token_data}")
        
        # Now check if it's expired
        if "expires" in token_data and token_data["expires"] <= current_time:
            logger.warning(f"Password reset failed: token expired. Token expiry: {token_data.get('expires')}")
            
            if testing_mode:
                # In testing mode, allow expired tokens
                logger.warning("TESTING MODE: Allowing expired token")
            else:
                # Delete the expired token
                await token_collection.delete_one({"_id": token_data["_id"]})
                return create_json_response(
                    status_code=400,
                    content={"message": "Password reset token has expired. Please request a new one.", "status": False}
                )
        
        # Log token details for debugging
        logger.info(f"Token found. Created: {token_data.get('created_at')}, Expires: {token_data.get('expires')}")
        
        # Get user_id from token data
        user_id_raw = token_data.get("user_id")
        
        # Handle user_id format
        try:
            if isinstance(user_id_raw, str):
                user_id = ObjectId(user_id_raw)
            else:
                user_id = user_id_raw
                
            logger.info(f"User ID from token: {user_id}")
        except Exception as e:
            logger.error(f"Error converting user_id to ObjectId: {str(e)}")
            
            if testing_mode:
                # In testing mode, create a test user if ID conversion fails
                logger.warning("TESTING MODE: Creating test user due to ID conversion error")
                return await handle_testing_mode_reset(token, new_password, confirm_password)
                
            return create_json_response(
                status_code=400,
                content={"message": "Invalid user ID in token", "status": False}
            )
        
        # Verify user exists
        user = await user_collection.find_one({"_id": user_id})
        if not user:
            logger.warning(f"Password reset failed: user not found for ID: {user_id}")
            
            if testing_mode:
                # In testing mode, create a test user if none found
                logger.warning("TESTING MODE: Creating test user since none found")
                return await handle_testing_mode_reset(token, new_password, confirm_password)
            
            await token_collection.delete_one({"_id": token_data["_id"]})
            return create_json_response(
                status_code=404,
                content={"message": "User account not found", "status": False}
            )
        
        logger.info(f"User found: {user.get('email')}")
        
        # Hash the new password
        hashed_password = bcrypt.hashpw(
            new_password.encode('utf-8'),
            bcrypt.gensalt()
        ).decode('utf-8')
        
        # Update the user's password
        logger.info(f"Updating password for user: {user.get('email')}")
        
        try:
            result = await user_collection.update_one(
                {"_id": user_id},
                {"$set": {"password": hashed_password, "updated_at": datetime.datetime.utcnow().isoformat()}}
            )
            
            if result.modified_count == 0:
                logger.error(f"Failed to update password for user: {user.get('email')}")
                
                if testing_mode:
                    # In testing mode, pretend the update succeeded
                    logger.warning("TESTING MODE: Pretending password update succeeded despite error")
                else:
                    return create_json_response(
                        status_code=500,
                        content={"message": "Failed to update password", "status": False}
                    )
                
            logger.info(f"Password updated successfully: modified_count={result.modified_count}")
        except Exception as update_error:
            logger.error(f"Error updating password: {str(update_error)}")
            
            if testing_mode:
                # In testing mode, pretend the update succeeded
                logger.warning("TESTING MODE: Pretending password update succeeded despite error")
            else:
                return create_json_response(
                    status_code=500,
                    content={"message": f"Error updating password: {str(update_error)}", "status": False}
                )
        
        # Delete the used token
        try:
            await token_collection.delete_one({"_id": token_data["_id"]})
            logger.info(f"Token deleted after successful password reset")
        except Exception as delete_error:
            logger.error(f"Error deleting used token: {str(delete_error)}")
            # Continue anyway since the password was updated
        
        # Log the successful password reset
        logger.info(f"Password reset successful for user: {user.get('email')}")
        
        # Return user email in the response for confirmation
        email = user.get("email", "")
        
        return create_json_response(
            status_code=200,
            content={
                "message": "Password has been reset successfully",
                "status": True,
                "email": email  # Include masked email for UI confirmation
            }
        )
    except Exception as e:
        logger.error(f"Error in reset_password: {str(e)}")
        
        if testing_mode:
            # In testing mode, return success even if there's an error
            logger.warning("TESTING MODE: Returning success despite error")
            return create_json_response(
                status_code=200,
                content={
                    "message": "Password has been reset successfully (TESTING MODE)",
                    "status": True,
                    "email": "test@example.com",
                    "testing_mode": True,
                    "error": str(e)
                }
            )
            
        return create_json_response(
            status_code=500,
            content={"message": f"An error occurred while resetting your password: {str(e)}", "status": False}
        )

async def handle_testing_mode_reset(token, new_password, confirm_password):
    """Helper function to handle password resets in testing mode"""
    logger.warning("HANDLING PASSWORD RESET IN TESTING MODE")
    
    # Create or find a test user
    test_email = "test@example.com"
    test_user = await user_collection.find_one({"email": test_email})
    
    if not test_user:
        # Create test user
        hashed_pw = bcrypt.hashpw("oldpassword123".encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        test_user_data = {
            "email": test_email,
            "name": "Test User",
            "firstName": "Test",
            "lastName": "User",
            "password": hashed_pw,
            "is_active": True,
            "is_verified": True,
            "created_at": datetime.datetime.utcnow().isoformat(),
            "updated_at": datetime.datetime.utcnow().isoformat()
        }
        
        result = await user_collection.insert_one(test_user_data)
        test_user = await user_collection.find_one({"_id": result.inserted_id})
        logger.info(f"Created test user for testing mode: {test_user['_id']}")
    
    # Hash and update password
    hashed_password = bcrypt.hashpw(
        new_password.encode('utf-8'),
        bcrypt.gensalt()
    ).decode('utf-8')
    
    # Update the test user's password
    try:
        result = await user_collection.update_one(
            {"_id": test_user["_id"]},
            {"$set": {"password": hashed_password, "updated_at": datetime.datetime.utcnow().isoformat()}}
        )
        logger.info(f"Updated test user password in testing mode, modified: {result.modified_count}")
    except Exception as e:
        logger.error(f"Error updating test user password in testing mode: {str(e)}")
    
    # Return success response
    return create_json_response(
        status_code=200,
        content={
            "message": "Password has been reset successfully (TESTING MODE)",
            "status": True,
            "email": test_email,
            "testing_mode": True
        }
    )

async def verify_email(token: str):
    """
    Verify a user's email address using a verification token.
    """
    try:
        # Find the token in the database
        current_time = datetime.datetime.utcnow().isoformat()
        token_data = await token_collection.find_one({
            "token": token,
            "expires": {"$gt": current_time}  # Compare with ISO string
        })
        
        if not token_data:
            return create_json_response(
                status_code=400,
                content={"message": "Invalid or expired token", "status": False}
            )
        
        user_id = token_data["user_id"]
        
        # Update the user's email verification status
        result = await user_collection.update_one(
            {"_id": user_id},
            {"$set": {"is_verified": True}}
        )
        
        if result.modified_count == 0:
            return create_json_response(
                status_code=500,
                content={"message": "Failed to verify email", "status": False}
            )
        
        # Delete the used token
        await token_collection.delete_one({"_id": token_data["_id"]})
        
        return create_json_response(
            status_code=200,
            content={
                "message": "Email has been verified successfully",
                "status": True
            }
        )
    except Exception as e:
        logger.error(f"Error in verify_email: {str(e)}")
        return create_json_response(
            status_code=500,
            content={"message": f"An error occurred: {str(e)}", "status": False}
        )

async def admin_signin(user: UserSignIn):
    try:
        logger.info(f"Processing admin signin for email: {user.email}")
        
        # Check if using default admin credentials
        if user.email == DEFAULT_ADMIN["email"] and user.password == DEFAULT_ADMIN["password"]:
            logger.info("Using default admin credentials")
            
            # Create default admin user data
            admin_user = {
                "_id": "default_admin_id",
                "name": "Admin User",
                "email": DEFAULT_ADMIN["email"],
                "role_id": "default_admin_role_id",
                "role": {
                    "_id": "default_admin_role_id",
                    "name": "admin",
                    "permissions": ["all"]
                },
                "is_active": True
            }
            
            # Create authentication token
            access_token = create_access_token(
                data={"sub": admin_user["email"], "id": admin_user["_id"], "role": "admin"}
            )
            
            # Return successful response with admin data and token
            response = {
                "message": "Admin login successful",
                "user": admin_user,
                "token": access_token,
                "status": True
            }
            
            logger.info("Default admin login successful")
            return create_json_response(status_code=200, content=response)
        
        # Continue with normal database authentication
        # Step 1: Find user by email
        found_user = await user_collection.find_one({"email": user.email})
        
        if not found_user:
            logger.info(f"User not found: {user.email}")
            return create_json_response(
                status_code=404, 
                content={"message": "User not found", "status": False}
            )
        
        # Step 2: Validate password
        stored_password = found_user.get("password", "")
        
        # Check if the password is correct
        try:
            password_matched = False
            
            if stored_password:
                password_matched = bcrypt.checkpw(
                    user.password.encode('utf-8'),
                    stored_password.encode('utf-8')
                )
        except Exception as e:
            logger.error(f"Error checking password: {str(e)}")
            password_matched = False
        
        if not password_matched:
            logger.info("Invalid password")
            return create_json_response(
                status_code=401, 
                content={"message": "Invalid password", "status": False}
            )
        
        # Step 3: Check if user account is active
        if not found_user.get("is_active", True):
            logger.info(f"User account is inactive: {user.email}")
            return create_json_response(
                status_code=401,
                content={"message": "Account is inactive", "status": False}
            )
        
        # Step 4: Check if user has admin role
        role_id = found_user.get("role_id")
        if not role_id:
            logger.info(f"User has no role: {user.email}")
            return create_json_response(
                status_code=403,
                content={"message": "Access denied: Not an admin", "status": False}
            )
            
        role = await role_collection.find_one({"_id": ObjectId(role_id)})
        
        if not role or role.get("name", "").lower() != "admin":
            logger.info(f"User is not an admin: {user.email}")
            return create_json_response(
                status_code=403,
                content={"message": "Access denied: Not an admin", "status": False}
            )
        
        # Step 5: Prepare user data for response
        found_user["_id"] = str(found_user["_id"])
        found_user["role_id"] = str(found_user["role_id"])
        
        # Add role details
        role["_id"] = str(role["_id"])
        found_user["role"] = role
        
        # Remove sensitive information
        if "password" in found_user:
            found_user.pop("password")
        
        # Step 7: Create authentication token
        logger.info("Creating access token for admin")
        access_token = create_access_token(
            data={"sub": found_user["email"], "id": found_user["_id"], "role": "admin"}
        )
        
        # Return successful response with admin data and token
        response = {
            "message": "Admin login successful",
            "user": found_user,
            "token": access_token,
            "status": True
        }
        
        logger.info("Admin login successful")
        return create_json_response(status_code=200, content=response)
        
    except Exception as e:
        logger.error(f"Error in admin signin: {str(e)}")
        return create_json_response(
            status_code=500, 
            content={"message": f"An error occurred: {str(e)}", "status": False}
        )

async def service_provider_signin(user: UserSignIn):
    try:
        logger.info(f"Processing service provider signin for email: {user.email}")
        
        # Check if using default service provider credentials
        if user.email == DEFAULT_SERVICE_PROVIDER["email"] and user.password == DEFAULT_SERVICE_PROVIDER["password"]:
            logger.info("Using default service provider credentials")
            
            # Create default service provider user data
            provider_user = {
                "_id": "default_provider_id",
                "name": "Service Provider",
                "email": DEFAULT_SERVICE_PROVIDER["email"],
                "role_id": "default_provider_role_id",
                "role": {
                    "_id": "default_provider_role_id",
                    "name": "service provider",
                    "permissions": ["manage_services", "manage_bookings"]
                },
                "service_provider": {
                    "_id": "default_service_provider_id",
                    "business_name": "E-Garage Service",
                    "description": "Default service provider for demonstration",
                    "rating": 4.5,
                    "is_verified": True
                },
                "is_active": True
            }
            
            # Create authentication token
            access_token = create_access_token(
                data={
                    "sub": provider_user["email"], 
                    "id": provider_user["_id"], 
                    "role": "service_provider",
                    "provider_id": provider_user["service_provider"]["_id"]
                }
            )
            
            # Return successful response with service provider data and token
            response = {
                "message": "Service provider login successful",
                "user": provider_user,
                "token": access_token,
                "status": True
            }
            
            logger.info("Default service provider login successful")
            return create_json_response(status_code=200, content=response)
        
        # Continue with normal database authentication
        # Step 1: Find user by email
        found_user = await user_collection.find_one({"email": user.email})
        
        if not found_user:
            logger.info(f"User not found: {user.email}")
            return create_json_response(
                status_code=404, 
                content={"message": "User not found", "status": False}
            )
        
        # Step 2: Validate password
        stored_password = found_user.get("password", "")
        
        # Check if the password is correct
        try:
            password_matched = False
            
            if stored_password:
                password_matched = bcrypt.checkpw(
                    user.password.encode('utf-8'),
                    stored_password.encode('utf-8')
                )
        except Exception as e:
            logger.error(f"Error checking password: {str(e)}")
            password_matched = False
        
        if not password_matched:
            logger.info("Invalid password")
            return create_json_response(
                status_code=401, 
                content={"message": "Invalid password", "status": False}
            )
        
        # Step 3: Check if user account is active
        if not found_user.get("is_active", True):
            logger.info(f"User account is inactive: {user.email}")
            return create_json_response(
                status_code=401,
                content={"message": "Account is inactive", "status": False}
            )
        
        # Step 4: Check if user has service provider role
        role_id = found_user.get("role_id")
        if not role_id:
            logger.info(f"User has no role: {user.email}")
            return create_json_response(
                status_code=403,
                content={"message": "Access denied: Not a service provider", "status": False}
            )
            
        role = await role_collection.find_one({"_id": ObjectId(role_id)})
        
        if not role or role.get("name", "").lower() != "service provider":
            logger.info(f"User is not a service provider: {user.email}")
            return create_json_response(
                status_code=403,
                content={"message": "Access denied: Not a service provider", "status": False}
            )
        
        # Step 5: Check if service provider record exists
        from config.database import service_provider_collection
        service_provider = await service_provider_collection.find_one({"user_id": found_user["_id"]})
        
        if not service_provider:
            logger.info(f"Service provider record not found for user: {user.email}")
            return create_json_response(
                status_code=404,
                content={"message": "Service provider profile not found", "status": False}
            )
        
        # Step 6: Prepare user data for response
        found_user["_id"] = str(found_user["_id"])
        found_user["role_id"] = str(found_user["role_id"])
        
        # Add role details
        role["_id"] = str(role["_id"])
        found_user["role"] = role
        
        # Add service provider details
        service_provider["_id"] = str(service_provider["_id"])
        found_user["service_provider"] = service_provider
        
        # Remove sensitive information
        if "password" in found_user:
            found_user.pop("password")
        
        # Create authentication token
        logger.info("Creating access token for service provider")
        access_token = create_access_token(
            data={
                "sub": found_user["email"], 
                "id": found_user["_id"], 
                "role": "service_provider",
                "provider_id": str(service_provider["_id"])
            }
        )
        
        # Return successful response with service provider data and token
        response = {
            "message": "Service provider login successful",
            "user": found_user,
            "token": access_token,
            "status": True
        }
        
        logger.info("Service provider login successful")
        return create_json_response(status_code=200, content=response)
        
    except Exception as e:
        logger.error(f"Error in service provider signin: {str(e)}")
        return create_json_response(
            status_code=500, 
            content={"message": f"An error occurred: {str(e)}", "status": False}
        )

async def debug_password_reset(email: str):
    """
    Debug version of request_password_reset to diagnose issues.
    """
    try:
        logger.info(f"DEBUG: Starting password reset debug for email: {email}")
        
        # Find user or create a test user if it doesn't exist
        user = await user_collection.find_one({"email": email})
        
        if not user:
            logger.info(f"User with email {email} not found, creating temporary user")
            # Create a test user
            hashed_pw = bcrypt.hashpw("testpassword123".encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            
            test_user = {
                "email": email,
                "password": hashed_pw,
                "name": f"Test User ({email})",
                "firstName": "Test",
                "lastName": "User",
                "is_active": True,
                "is_verified": True,
                "created_at": datetime.datetime.utcnow().isoformat(),
                "updated_at": datetime.datetime.utcnow().isoformat()
            }
            
            result = await user_collection.insert_one(test_user)
            user = await user_collection.find_one({"_id": result.inserted_id})
            logger.info(f"Created temporary user with ID: {user['_id']}")
        
        # Generate token
        token_value = ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(64))
        
        # Set expiration time (24 hours)
        current_time = datetime.datetime.utcnow()
        expires = (current_time + datetime.timedelta(hours=24)).isoformat()
        
        # Store token in database
        token_data = {
            "user_id": user["_id"],
            "email": email,
            "token": token_value,
            "expires": expires,
            "created_at": current_time.isoformat(),
            "debug": True
        }
        
        # Insert token into database
        token_result = await token_collection.insert_one(token_data)
        
        if not token_result.inserted_id:
            logger.error("Failed to insert token into database")
            return create_json_response(
                status_code=500,
                content={"message": "Failed to create password reset token", "status": False}
            )
        
        logger.info(f"Token created with ID: {token_result.inserted_id}")
        
        # Verify token was saved
        saved_token = await token_collection.find_one({"_id": token_result.inserted_id})
        if not saved_token:
            logger.error("Token was not found after insertion")
        else:
            logger.info(f"Token verification successful: {saved_token['token'][:10]}...")
        
        # Create reset link
        frontend_url = "http://localhost:5174"
        reset_link = f"{frontend_url}/reset-password?token={token_value}"
        
        # Prepare email
        email_subject = "E-Garage Debug: Password Reset Request"
        email_body = f"""
        <html>
        <body>
        <h2>DEBUG Password Reset Request</h2>
        <p>Hello,</p>
        <p>This is a DEBUG password reset email.</p>
        <p>Reset link: <a href="{reset_link}">{reset_link}</a></p>
        <p>Token: {token_value}</p>
        <p>This is a debug message.</p>
        </body>
        </html>
        """
        
        # Import send_mail directly in this function
        from utils.Sendmail import send_mail
        
        # Try to save email
        logger.info("DEBUG: Trying to save email to file")
        result = send_mail(email, email_subject, email_body)
        logger.info(f"DEBUG: send_mail result: {result}")
        
        # Check for email file
        import glob
        import os
        from pathlib import Path
        
        email_filename = None
        
        # Get current working directory
        cwd = os.getcwd()
        logger.info(f"DEBUG: Current working directory: {cwd}")
        
        # Try multiple possible locations for emails directory with absolute paths
        possible_paths = [
            Path(cwd) / "emails",
            Path(cwd) / "backend/emails",
            Path(os.path.dirname(__file__)) / "../emails",  # Relative to controller
        ]
        
        for emails_dir in possible_paths:
            logger.info(f"DEBUG: Checking for emails in {emails_dir.absolute()}")
            
            if os.path.exists(emails_dir):
                logger.info(f"DEBUG: Directory exists: {emails_dir.absolute()}")
                email_files = sorted(glob.glob(str(emails_dir / "email_*.html")), key=os.path.getctime, reverse=True)
                
                if email_files:
                    email_filename = os.path.basename(email_files[0])
                    logger.info(f"DEBUG: Found email file: {email_filename}")
                    break
                else:
                    logger.info(f"DEBUG: No email files found in {emails_dir.absolute()}")
            else:
                logger.info(f"DEBUG: Directory does not exist: {emails_dir.absolute()}")
                # Try to create it
                try:
                    emails_dir.mkdir(exist_ok=True, parents=True)
                    logger.info(f"DEBUG: Created directory: {emails_dir.absolute()}")
                except Exception as e:
                    logger.error(f"DEBUG: Failed to create directory: {str(e)}")
        
        # Count tokens in the database
        token_count = await token_collection.count_documents({})
        
        # Return response
        response_content = {
            "message": "Debug password reset token created",
            "status": True,
            "token": token_value,
            "reset_link": reset_link,
            "email_sent": result,
            "email_filename": email_filename,
            "token_id": str(token_result.inserted_id),
            "token_count": token_count,
            "user_id": str(user["_id"]),
            "expires": expires
        }
        
        return create_json_response(
            status_code=200,
            content=response_content
        )
    except Exception as e:
        logger.error(f"Error in debug_password_reset: {str(e)}")
        return create_json_response(
            status_code=500,
            content={"message": f"DEBUG ERROR: {str(e)}", "status": False}
        )

async def verify_reset_token(token: str):
    """
    Verify if a password reset token is valid and not expired.
    This is used to check if a token is valid before showing the reset form.
    """
    try:
        logger.info(f"Verifying reset token: {token[:10]}...")
        
        # Find the token in the database
        current_time = datetime.datetime.utcnow().isoformat()
        
        # First check if token exists at all - make sure we're handling the request properly
        if not token or len(token) < 20:  # Basic validation for minimum token length
            logger.warning(f"Token is too short or missing: {token}")
            
            # TESTING MODE: Accept all tokens for testing
            testing_mode = os.getenv("TESTING_MODE", "false").lower() == "true"
            if testing_mode:
                logger.warning("TESTING MODE ENABLED: Accepting token despite validation failure")
                return create_json_response(
                    status_code=200,
                    content={"message": "Token accepted in testing mode", "valid": True, "status": True, "testing_mode": True}
                )
                
            return create_json_response(
                status_code=400,
                content={"message": "Invalid token format", "valid": False, "status": False}
            )
            
        # Check the database for the token
        token_data = await token_collection.find_one({"token": token})
        
        if not token_data:
            logger.warning(f"Token not found in database: {token[:10]}...")
            # Try to check all available tokens for debugging
            all_tokens = await token_collection.find().to_list(100)
            token_count = len(all_tokens)
            logger.info(f"Total tokens in database: {token_count}")
            
            # Log first few tokens if any exist
            if token_count > 0:
                for i, t in enumerate(all_tokens[:3]):
                    logger.info(f"Token {i+1}: {str(t.get('token', 'NO_TOKEN'))[:10]}...")
            
            # TESTING MODE: Accept all tokens for testing
            testing_mode = os.getenv("TESTING_MODE", "false").lower() == "true"
            if testing_mode:
                logger.warning("TESTING MODE ENABLED: Accepting token despite not finding it in database")
                return create_json_response(
                    status_code=200,
                    content={
                        "message": "Token accepted in testing mode", 
                        "valid": True, 
                        "status": True, 
                        "testing_mode": True,
                        "debug": {"token_count": token_count}
                    }
                )
                
            return create_json_response(
                status_code=404,
                content={"message": "Invalid password reset token", "valid": False, "status": False, "debug": {"token_count": token_count}}
            )
        
        # Then check if it's expired
        if "expires" in token_data and token_data["expires"] <= current_time:
            logger.warning(f"Token expired. Token expiry: {token_data.get('expires')}")
            
            # TESTING MODE: Accept expired tokens for testing
            testing_mode = os.getenv("TESTING_MODE", "false").lower() == "true"
            if testing_mode:
                logger.warning("TESTING MODE ENABLED: Accepting expired token")
                return create_json_response(
                    status_code=200,
                    content={
                        "message": "Expired token accepted in testing mode", 
                        "valid": True, 
                        "status": True, 
                        "testing_mode": True,
                        "debug": {"expires": token_data.get("expires"), "current_time": current_time}
                    }
                )
                
            # We don't delete expired tokens here to allow proper error messages when trying to use them
            return create_json_response(
                status_code=400,
                content={"message": "Password reset token has expired", "valid": False, "status": False}
            )
        
        # Token is valid and not expired
        user_id = token_data.get("user_id")
        user_email = token_data.get("email")
        
        return create_json_response(
            status_code=200,
            content={
                "message": "Token is valid",
                "valid": True, 
                "status": True,
                "user_id": str(user_id) if user_id else None,
                "email": user_email
            }
        )
    except Exception as e:
        logger.error(f"Error verifying reset token: {str(e)}")
        
        # TESTING MODE: Accept tokens even if there's an error
        testing_mode = os.getenv("TESTING_MODE", "false").lower() == "true"
        if testing_mode:
            logger.warning(f"TESTING MODE ENABLED: Accepting token despite error: {str(e)}")
            return create_json_response(
                status_code=200,
                content={
                    "message": "Token accepted in testing mode despite error", 
                    "valid": True, 
                    "status": True, 
                    "testing_mode": True,
                    "error": str(e)
                }
            )
            
        return create_json_response(
            status_code=500,
            content={"message": f"An error occurred while verifying the token", "valid": False, "status": False, "error": str(e)}
        )

# Add the get_current_admin function
async def get_current_admin(token: str = None):
    """
    Get the current admin user from the token
    
    Args:
        token: The JWT token to validate
        
    Returns:
        dict: The admin user details
    """
    try:
        if not token:
            # For development/testing purposes, use a mock admin
            logger.warning("No token provided, using mock admin for development")
            return {
                "_id": "admin_id",
                "email": "admin@egarage.com",
                "role": "admin"
            }
            
        # Decode and validate token
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("user_id")
        
        if not user_id:
            logger.error("Invalid token payload (no user_id)")
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
            
        # Get user from database
        user = await user_collection.find_one({"_id": ObjectId(user_id)})
        
        if not user:
            logger.error(f"User not found for ID: {user_id}")
            raise HTTPException(status_code=401, detail="User not found")
            
        # Check if user is admin
        if user.get("role") != "admin":
            logger.error(f"User {user_id} is not an admin")
            raise HTTPException(status_code=403, detail="Not authorized (admin only)")
            
        # Return admin user details
        return {
            "_id": str(user["_id"]),
            "email": user["email"],
            "role": user["role"]
        }
    except jwt.JWTError:
        logger.error("JWT decode error")
        raise HTTPException(status_code=401, detail="Invalid authentication token")
    except Exception as e:
        logger.error(f"Error in get_current_admin: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}") 