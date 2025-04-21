import asyncio
from config.database import token_collection, user_collection
import datetime
import secrets
import string
import os
import sys
from bson import ObjectId
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

async def create_test_token(email=None, test_only=False):
    """Create a test password reset token"""
    if not email:
        email = "test@example.com"  # Default test email
    
    print(f"Creating test token for email: {email}")
    
    # Find the user by email
    user = await user_collection.find_one({"email": email})
    
    if not user and not test_only:
        print(f"User with email {email} not found. Creating test user instead.")
        # Create a test user
        from passlib.hash import bcrypt
        
        user_data = {
            "firstName": "Test",
            "lastName": "User",
            "name": "Test User",
            "email": email,
            "password": bcrypt.hash("password123"),
            "is_active": True,
            "is_verified": True,
            "created_at": datetime.datetime.utcnow().isoformat(),
            "updated_at": datetime.datetime.utcnow().isoformat()
        }
        
        result = await user_collection.insert_one(user_data)
        user = await user_collection.find_one({"_id": result.inserted_id})
        print(f"Created test user with ID: {user['_id']}")
    
    # Generate token
    token_value = ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(64))
    
    # Set expiration time (24 hours from now)
    current_time = datetime.datetime.utcnow()
    expires = (current_time + datetime.timedelta(hours=24)).isoformat()
    
    # Create token data
    token_data = {
        "user_id": user["_id"] if user else "test_user_id",
        "email": email,
        "token": token_value,
        "expires": expires,
        "created_at": current_time.isoformat()
    }
    
    # Insert token
    result = await token_collection.insert_one(token_data)
    
    if result.inserted_id:
        print("Token created successfully!")
        print(f"Token value: {token_value}")
        print(f"Reset link: http://localhost:5174/reset-password?token={token_value}")
        print(f"Expires: {expires}")
        return token_value
    else:
        print("Failed to create token")
        return None

async def main():
    try:
        if len(sys.argv) > 1:
            # Use email provided as command line argument
            email = sys.argv[1]
            await create_test_token(email)
        else:
            # Use default test email
            await create_test_token()
    except Exception as e:
        print(f"Error creating test token: {str(e)}")

if __name__ == "__main__":
    asyncio.run(main()) 