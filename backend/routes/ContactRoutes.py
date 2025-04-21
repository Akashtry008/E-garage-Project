from fastapi import APIRouter, Depends, HTTPException, Body, Header
from models.ContactModel import ContactMessageCreate, ContactMessageOut
from controllers.ContactController import (
    create_contact_message_from_website, 
    get_all_contact_messages_admin, 
    get_contact_message_by_id_admin,
    delete_contact_message_admin
)
from controllers.AuthController import get_current_admin
from typing import List, Optional
import logging
import os
from fastapi.responses import JSONResponse
from datetime import datetime
from config.database import contact_message_collection

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create router
contact_router = APIRouter(
    prefix="/api/contact",
    tags=["Contact"],
    responses={404: {"description": "Not found"}}
)

# Development mode flag - set this to False in production
DEV_MODE = True

@contact_router.post("/", response_description="Create new contact message")
async def api_create_contact_message(contact_message: ContactMessageCreate = Body(...)):
    """
    Create a new contact message from the contact form
    """
    logger.info(f"API: Creating contact message from {contact_message.email}")
    return await create_contact_message_from_website(contact_message)

@contact_router.get("/", response_description="Get all contact messages")
async def api_get_all_contact_messages(authorization: Optional[str] = Header(None)):
    print("📥 GET /api/contact/ called!")
    if DEV_MODE and not authorization:
        return await get_all_contact_messages_admin()
    else:
        current_admin = await get_current_admin(authorization)
        return await get_all_contact_messages_admin()

@contact_router.get("/debug", response_description="Debug endpoint for contact messages")
async def api_debug_contact_messages():
    """
    Debug endpoint with explicit CORS headers for troubleshooting frontend issues
    """
    logger.info("🔧 Debug endpoint for contact messages called")
    try:
        # Get all messages
        messages = await contact_message_collection.find().sort("created_at", -1).to_list(length=1000)
        
        # Process messages for response
        processed_messages = []
        for message in messages:
            # Convert ObjectId to string
            message["_id"] = str(message["_id"])
            # Convert datetime to string
            if "created_at" in message and isinstance(message["created_at"], datetime):
                message["created_at"] = message["created_at"].isoformat()
            processed_messages.append(message)
        
        # Create a custom response with explicit CORS headers
        response = JSONResponse(
            status_code=200,
            content={
                "message": "Contact messages fetched successfully",
                "contact_messages": processed_messages,
                "count": len(processed_messages),
                "status": True
            }
        )
        
        # Add all possible CORS headers
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Accept, Authorization"
        
        logger.info("🔧 Debug endpoint: Returning response with CORS headers")
        return response
    except Exception as e:
        logger.error(f"🔧 Debug endpoint error: {str(e)}")
        response = JSONResponse(
            content={"message": f"Error: {str(e)}", "status": False},
            status_code=500
        )
        response.headers["Access-Control-Allow-Origin"] = "*"
        return response

@contact_router.get("/{message_id}", response_description="Get contact message by id")
async def api_get_contact_message_by_id(message_id: str, authorization: Optional[str] = Header(None)):
    """
    Get a specific contact message by ID - Admin only
    """
    if DEV_MODE and not authorization:
        logger.warning(f"DEV MODE: Skipping admin authentication for get_contact_message_by_id {message_id}")
        mock_admin = {"email": "dev@example.com"}
        logger.info(f"API: Admin {mock_admin.get('email')} requested contact message {message_id}")
        return await get_contact_message_by_id_admin(message_id)
    else:
        current_admin = await get_current_admin(authorization)
        logger.info(f"API: Admin {current_admin.get('email')} requested contact message {message_id}")
        return await get_contact_message_by_id_admin(message_id)

@contact_router.delete("/{message_id}", response_description="Delete contact message")
async def api_delete_contact_message(message_id: str, authorization: Optional[str] = Header(None)):
    """
    Delete a contact message - Admin only
    """
    if DEV_MODE and not authorization:
        logger.warning(f"DEV MODE: Skipping admin authentication for delete_contact_message {message_id}")
        mock_admin = {"email": "dev@example.com"}
        logger.info(f"API: Admin {mock_admin.get('email')} deleting contact message {message_id}")
        return await delete_contact_message_admin(message_id)
    else:
        current_admin = await get_current_admin(authorization)
        logger.info(f"API: Admin {current_admin.get('email')} deleting contact message {message_id}")
        return await delete_contact_message_admin(message_id)