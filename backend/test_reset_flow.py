#!/usr/bin/env python
import asyncio
import sys
import requests
import json
import os
from dotenv import load_dotenv
from config.database import token_collection, user_collection
from bson import ObjectId
import datetime
import secrets
import string
import bcrypt

# Load environment variables
load_dotenv()

# Use this value to control which part of the flow to test
# 1 = test API request for password reset
# 2 = directly create a token in the database
# 3 = verify a token
# 4 = reset password with a token
TEST_MODE = 2

# Settings
API_URL = "http://localhost:8000"  # Update as needed
TEST_EMAIL = "test_reset@yopmail.com"  # Update as needed
FRONTEND_URL = "http://localhost:5174"

async def test_api_request():
    """Test requesting a password reset through the API"""
    print(f"Testing password reset request via API for {TEST_EMAIL}")
    
    url = f"{API_URL}/api/auth/debug-password-reset"
    response = requests.post(url, json={"email": TEST_EMAIL})
    
    print(f"Status code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    if response.status_code == 200:
        data = response.json()
        if "token" in data:
            token = data["token"]
            print(f"\nReset token: {token[:10]}...{token[-5:]}")
            print(f"Reset link: {FRONTEND_URL}/reset-password?token={token}")
            return token
    return None

async def create_direct_token():
    """Create a token directly in the database"""
    print(f"Creating password reset token directly in database for {TEST_EMAIL}")
    
    # Find user or create one
    user = await user_collection.find_one({"email": TEST_EMAIL})
    
    if not user:
        print(f"User not found, creating test user for {TEST_EMAIL}")
        # Create a test user
        hashed_pw = bcrypt.hashpw("password123".encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        user_data = {
            "email": TEST_EMAIL,
            "password": hashed_pw,
            "name": "Test Reset User",
            "firstName": "Test",
            "lastName": "Reset",
            "is_active": True,
            "is_verified": True,
            "created_at": datetime.datetime.utcnow().isoformat(),
            "updated_at": datetime.datetime.utcnow().isoformat()
        }
        
        result = await user_collection.insert_one(user_data)
        user = await user_collection.find_one({"_id": result.inserted_id})
        print(f"Created test user with ID: {user['_id']}")
    else:
        print(f"Found existing user with ID: {user['_id']}")
    
    # Generate token
    token = ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(64))
    
    # Set expiration
    current_time = datetime.datetime.utcnow()
    expires = (current_time + datetime.timedelta(hours=24)).isoformat()
    
    # Create token document
    token_data = {
        "user_id": user["_id"],
        "email": TEST_EMAIL,
        "token": token,
        "expires": expires,
        "created_at": current_time.isoformat(),
        "test": True
    }
    
    # Save to database
    result = await token_collection.insert_one(token_data)
    
    if result.inserted_id:
        print(f"Token inserted with ID: {result.inserted_id}")
        print(f"\nReset token: {token[:10]}...{token[-5:]}")
        print(f"Reset link: {FRONTEND_URL}/reset-password?token={token}")
        
        # Verify it was saved correctly
        saved_token = await token_collection.find_one({"_id": result.inserted_id})
        if saved_token:
            print("Token verified in database!")
            print(f"Token data: {saved_token}")
        else:
            print("ERROR: Token not found after insertion!")
        
        return token
    
    print("Failed to insert token")
    return None

async def verify_token(token):
    """Test verifying a token through the API"""
    print(f"\nVerifying token: {token[:10]}...")
    
    url = f"{API_URL}/api/auth/verify-reset-token"
    response = requests.post(url, json={"token": token})
    
    print(f"Status code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    return response.status_code == 200

async def reset_password(token):
    """Test resetting a password with a token"""
    print(f"\nResetting password with token: {token[:10]}...")
    
    url = f"{API_URL}/api/auth/reset-password"
    data = {
        "token": token,
        "new_password": "NewPassword123",
        "confirm_password": "NewPassword123"
    }
    
    response = requests.post(url, json=data)
    
    print(f"Status code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    return response.status_code == 200

async def check_tokens():
    """Check all tokens in the database"""
    print("\nChecking all tokens in database:")
    
    tokens = await token_collection.find().to_list(100)
    print(f"Found {len(tokens)} tokens")
    
    for token in tokens:
        print(f"Token: {str(token.get('token', ''))[:10]}...")
        print(f"  User ID: {token.get('user_id')}")
        print(f"  Email: {token.get('email')}")
        print(f"  Expires: {token.get('expires')}")
        print(f"  Created: {token.get('created_at')}")
        print("-" * 50)
    
    return tokens

async def main():
    """Main test function"""
    token = None
    
    print("=" * 60)
    print("PASSWORD RESET FLOW TEST")
    print("=" * 60)
    
    # Always check existing tokens first
    tokens = await check_tokens()
    
    if TEST_MODE == 1:
        # Test requesting through API
        token = await test_api_request()
    elif TEST_MODE == 2:
        # Create token directly in database
        token = await create_direct_token()
    elif TEST_MODE == 3 and len(sys.argv) > 1:
        # Verify provided token
        token = sys.argv[1]
        await verify_token(token)
    elif TEST_MODE == 4 and len(sys.argv) > 1:
        # Reset password with provided token
        token = sys.argv[1]
        await reset_password(token)
    else:
        print("\nUsage: python test_reset_flow.py [token]")
        print("Adjust TEST_MODE in the script to control behavior:")
        print("  1 = Test API request for password reset")
        print("  2 = Create token directly in database")
        print("  3 = Verify a token (requires token argument)")
        print("  4 = Reset password with a token (requires token argument)")
    
    print("\nTest completed")

if __name__ == "__main__":
    asyncio.run(main()) 