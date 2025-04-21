import asyncio
from config.database import token_collection
import datetime
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

async def list_tokens():
    """List all tokens in the database"""
    print("Checking password reset tokens...")
    tokens = await token_collection.find().to_list(100)
    
    print(f"Found {len(tokens)} tokens")
    
    for i, token in enumerate(tokens):
        token_value = token.get("token", "NO_TOKEN")
        email = token.get("email", "NO_EMAIL")
        user_id = str(token.get("user_id", "NO_USER_ID"))
        expires = token.get("expires", "NO_EXPIRY")
        created_at = token.get("created_at", "NO_CREATION_TIME")
        
        # Check if token is expired
        try:
            current_time = datetime.datetime.utcnow().isoformat()
            is_expired = expires <= current_time if expires else True
        except:
            is_expired = "ERROR"
        
        print(f"Token {i+1}:")
        print(f"  Value: {token_value[:10]}...{token_value[-5:] if len(token_value) > 15 else ''}")
        print(f"  Email: {email}")
        print(f"  User ID: {user_id}")
        print(f"  Expires: {expires}")
        print(f"  Created: {created_at}")
        print(f"  Expired: {is_expired}")
        print("-" * 50)

async def main():
    try:
        await list_tokens()
    except Exception as e:
        print(f"Error checking tokens: {str(e)}")

if __name__ == "__main__":
    asyncio.run(main()) 