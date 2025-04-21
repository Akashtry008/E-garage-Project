#!/usr/bin/env python3
import os
import sys
import requests
import time
from pathlib import Path
import argparse
import logging
from dotenv import load_dotenv

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

def test_debug_password_reset(recipient_email, api_url=None):
    """
    Test the debug password reset endpoint to verify email functionality
    without actually resetting any passwords.
    """
    # Get API URL from environment or use default
    if not api_url:
        api_url = os.getenv("VITE_API_URL", "http://localhost:8000")
    
    # Ensure API URL doesn't end with a slash
    if api_url.endswith('/'):
        api_url = api_url[:-1]
    
    # Construct the full URL
    debug_url = f"{api_url}/api/auth/debug-password-reset"
    
    logger.info(f"Testing debug password reset endpoint at: {debug_url}")
    logger.info(f"Sending test email to: {recipient_email}")
    
    try:
        # Make the request to the debug endpoint
        response = requests.post(
            debug_url,
            json={"email": recipient_email},
            timeout=10  # 10 second timeout
        )
        
        # Check if request was successful
        if response.status_code == 200:
            data = response.json()
            logger.info(f"Response: {data}")
            
            # Extract useful information from the response
            email_sent = data.get('email_sent', False)
            reset_token = data.get('reset_token', 'No token found')
            email_filename = data.get('email_filename', None)
            
            if email_sent:
                print(f"\n✅ Test email sent successfully to {recipient_email}")
                if email_filename:
                    print(f"Email saved to file: {email_filename}")
                
                # Display the reset token (truncated for security)
                if reset_token != 'No token found':
                    token_start = reset_token[:10]
                    token_end = reset_token[-5:]
                    print(f"Reset token: {token_start}...{token_end}")
                    
                    # Generate the reset URL
                    reset_url = f"{api_url}/reset-password?token={reset_token}"
                    print(f"Reset URL: {reset_url}")
                
                return True, "Email sent successfully"
            else:
                error_msg = f"Email sending reported as failed in response: {data}"
                logger.error(error_msg)
                return False, error_msg
        else:
            # Request was not successful
            error_msg = f"Request failed with status code {response.status_code}: {response.text}"
            logger.error(error_msg)
            return False, error_msg
            
    except Exception as e:
        error_msg = f"Error testing debug password reset: {str(e)}"
        logger.error(error_msg)
        return False, error_msg

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Test yopmail email functionality using debug password reset")
    parser.add_argument("email", help="Email address to send the test to")
    parser.add_argument("--api", help="API URL (default: from .env or http://localhost:8000)", default=None)
    
    args = parser.parse_args()
    
    success, message = test_debug_password_reset(args.email, args.api)
    
    if success:
        print("\nTest completed successfully!")
        sys.exit(0)
    else:
        print(f"\nTest failed: {message}")
        print("Check the backend/emails directory for any saved email content.")
        sys.exit(1) 