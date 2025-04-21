from fastapi import APIRouter, Response, status
from controllers.AuthController import (
    signup, 
    signin, 
    admin_signin,
    service_provider_signin,
    validate_token, 
    request_password_reset, 
    reset_password, 
    verify_email,
    debug_password_reset,
    verify_reset_token
)
from models.UserModel import UserSignUp, UserSignIn, PasswordResetRequest, PasswordReset, EmailVerification, TokenVerification
import logging
from bson import ObjectId
from fastapi.responses import JSONResponse

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(tags=["Authentication"], prefix="/auth")

@router.post("/signup")
async def create_user(user: UserSignUp):
    """
    Create a new user account. 
    Returns user details and authentication token.
    """
    logger.info(f"Received signup request for email: {user.email}")
    response = await signup(user)
    return response

@router.post("/signin")
async def login_user(user: UserSignIn):
    """
    Authenticate a user and return a token.
    """
    logger.info(f"Received signin request for email: {user.email}")
    response = await signin(user)
    return response

@router.post("/admin/signin")
async def login_admin(user: UserSignIn):
    """
    Authenticate an admin user and return a token.
    Only works for users with admin role.
    """
    logger.info(f"Received admin signin request for email: {user.email}")
    response = await admin_signin(user)
    return response

@router.post("/provider/signin")
async def login_service_provider(user: UserSignIn):
    """
    Authenticate a service provider and return a token.
    Only works for users with service provider role who have a provider profile.
    """
    logger.info(f"Received service provider signin request for email: {user.email}")
    response = await service_provider_signin(user)
    return response

@router.get("/validate-token/{user_id}")
async def validate_auth_token(user_id: str):
    """
    Mock token validation endpoint - just returns success
    """
    logger.info(f"Token validation request for user: {user_id}")
    return {"message": "Token is valid", "user_id": user_id, "status": True}

@router.post("/request-password-reset")
async def request_password_reset_route(request: PasswordResetRequest):
    """
    Request a password reset for a given email.
    Sends a password reset link to the user's email if it exists in the system.
    """
    logger.info(f"Password reset request for email: {request.email}")
    return await request_password_reset(request.email)

@router.post("/reset-password")
async def reset_user_password(reset_data: PasswordReset):
    """
    Reset a user's password using a valid reset token.
    """
    logger.info("Password reset with token")
    try:
        result = await reset_password(reset_data.token, reset_data.new_password, reset_data.confirm_password)
        
        # Additional protection for ObjectId serialization issues
        if isinstance(result, dict) and "user_id" in result and isinstance(result["user_id"], ObjectId):
            result["user_id"] = str(result["user_id"])
            
        return result
    except Exception as e:
        # Handle ObjectId serialization errors
        if "PydanticSerializationError" in str(e) and "bson.objectid.ObjectId" in str(e):
            logger.error(f"ObjectId serialization error in reset_password: {str(e)}")
            return JSONResponse(
                status_code=200,
                content={
                    "message": "Password has been reset successfully",
                    "status": True
                }
            )
        raise e

@router.post("/verify-email")
async def verify_user_email(verification_data: EmailVerification):
    """
    Verify a user's email address using a verification token.
    """
    logger.info("Email verification with token")
    return await verify_email(verification_data.token)

@router.post("/verify-reset-token")
async def verify_password_reset_token(token_data: TokenVerification):
    """
    Verify if a password reset token is valid before allowing the user to submit the reset form.
    """
    logger.info(f"Verifying password reset token validity")
    return await verify_reset_token(token_data.token)

# Add a simple test endpoint
@router.get("/test")
async def test_auth_api():
    """
    Simple test endpoint to verify the auth API is working
    """
    logger.info("Auth API test endpoint accessed")
    return {"message": "Auth API is working", "status": True}

@router.post("/debug-password-reset")
async def debug_reset(request: PasswordResetRequest):
    """
    Debug endpoint for password reset issues.
    This is a simpler version to help diagnose problems.
    """
    logger.info(f"DEBUG Password reset request for email: {request.email}")
    return await debug_password_reset(request.email)

@router.get("/test-objectid")
async def test_objectid_serialization():
    """
    Test endpoint to verify ObjectId serialization is working
    """
    from bson import ObjectId
    from fastapi.responses import JSONResponse
    
    # Create a test response with ObjectId
    test_data = {
        "message": "Test object with ObjectId",
        "user_id": ObjectId(),
        "nested": {
            "another_id": ObjectId()
        },
        "list_of_ids": [ObjectId(), ObjectId()],
        "status": True
    }
    
    logger.info("Testing ObjectId serialization")
    return JSONResponse(content=test_data) 