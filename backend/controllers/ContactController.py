from bson import ObjectId
from models.ContactModel import ContactMessageCreate, ContactMessageOut
from config.database import contact_message_collection
from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from datetime import datetime
import logging
from utils.Sendmail import EmailSender, send_mail
from typing import List
from pymongo.errors import PyMongoError

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def create_contact_message(message: ContactMessageCreate) -> dict:
    """
    Create a new contact message in the database
    
    Args:
        message: The contact message details
        
    Returns:
        dict: The created contact message
    """
    try:
        message_dict = message.dict()
        message_dict["created_at"] = datetime.now()
        
        # Insert message into database
        result = await contact_message_collection.insert_one(message_dict)
        
        if result.inserted_id:
            logger.info(f"Contact message created with ID: {result.inserted_id}")
            return {"id": str(result.inserted_id), **message_dict}
        else:
            logger.error("Failed to create contact message")
            return None
    except PyMongoError as e:
        logger.error(f"Database error while creating contact message: {str(e)}")
        raise
    except Exception as e:
        logger.error(f"Unexpected error while creating contact message: {str(e)}")
        raise

async def get_contact_messages() -> List[ContactMessageOut]:
    """
    Get all contact messages from the database
    
    Returns:
        List[ContactMessageOut]: List of all contact messages
    """
    try:
        messages = []
        cursor = contact_message_collection.find().sort("created_at", -1)
        
        async for document in cursor:
            document["id"] = str(document.pop("_id"))
            messages.append(document)
        
        logger.info(f"Retrieved {len(messages)} contact messages")
        return messages
    except PyMongoError as e:
        logger.error(f"Database error while retrieving contact messages: {str(e)}")
        raise
    except Exception as e:
        logger.error(f"Unexpected error while retrieving contact messages: {str(e)}")
        raise

async def get_message_by_id(message_id: str) -> ContactMessageOut:
    """
    Get a contact message by its ID
    
    Args:
        message_id: The ID of the message to retrieve
        
    Returns:
        ContactMessageOut: The contact message if found, None otherwise
    """
    try:
        message = await contact_message_collection.find_one({"_id": ObjectId(message_id)})
        
        if message:
            message["id"] = str(message.pop("_id"))
            logger.info(f"Retrieved contact message with ID: {message_id}")
            return message
        else:
            logger.warning(f"Contact message with ID {message_id} not found")
            return None
    except PyMongoError as e:
        logger.error(f"Database error while retrieving contact message: {str(e)}")
        raise
    except Exception as e:
        logger.error(f"Unexpected error while retrieving contact message: {str(e)}")
        raise

async def delete_message(message_id: str) -> bool:
    """
    Delete a contact message by its ID
    
    Args:
        message_id: The ID of the message to delete
        
    Returns:
        bool: True if the message was deleted, False otherwise
    """
    try:
        result = await contact_message_collection.delete_one({"_id": ObjectId(message_id)})
        
        if result.deleted_count:
            logger.info(f"Deleted contact message with ID: {message_id}")
            return True
        else:
            logger.warning(f"Contact message with ID {message_id} not found for deletion")
            return False
    except PyMongoError as e:
        logger.error(f"Database error while deleting contact message: {str(e)}")
        raise
    except Exception as e:
        logger.error(f"Unexpected error while deleting contact message: {str(e)}")
        raise

async def create_contact_message_from_website(contact_message: ContactMessageCreate):
    """
    Create a new contact message from the website contact form
    
    Args:
        contact_message: The contact message to create
        
    Returns:
        dict: The created contact message
    """
    try:
        logger.info(f"Creating contact message from: {contact_message.email}")
        
        # Prepare data for insertion
        message_data = contact_message.dict()
        message_data["created_at"] = datetime.now()
        
        # Insert into database
        result = await contact_message_collection.insert_one(message_data)
        
        if result.inserted_id:
            # Get the newly created message
            new_message = await contact_message_collection.find_one({"_id": result.inserted_id})
            
            # Convert ObjectId to string
            new_message["_id"] = str(new_message["_id"])
            
            # Convert datetime to ISO format string to make it JSON serializable
            if "created_at" in new_message:
                new_message["created_at"] = new_message["created_at"].isoformat()
            
            # Try to send notification email to admin
            try:
                # Create HTML email content
                admin_email = "admin@egarage.com"  # Change to your admin email
                subject = f"New Contact Message: {contact_message.subject}"
                
                html_content = f"""
                <html>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
                        <h2 style="color: #e74c3c;">New Contact Message Received</h2>
                        <p>You have received a new message from the website contact form.</p>
                        
                        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                            <p><strong>From:</strong> {contact_message.name} &lt;{contact_message.email}&gt;</p>
                            <p><strong>Subject:</strong> {contact_message.subject}</p>
                            <p><strong>Message:</strong></p>
                            <div style="background-color: #fff; padding: 10px; border-left: 3px solid #e74c3c;">
                                {contact_message.message.replace("\\n", "<br>")}
                            </div>
                        </div>
                        
                        <p>Please respond to this inquiry as soon as possible.</p>
                        <p style="font-size: 12px; color: #777; margin-top: 30px; border-top: 1px solid #eee; padding-top: 10px;">
                            This is an automated message from the E-Garage system.
                        </p>
                    </div>
                </body>
                </html>
                """
                
                # Send the notification email
                send_mail(admin_email, subject, html_content, sender="noreply@egarage.com")
                logger.info(f"Admin notification email sent for contact message from: {contact_message.email}")
            except Exception as e:
                logger.error(f"Failed to send admin notification email: {str(e)}")
                # Continue processing even if email notification fails
            
            # Create response with CORS headers
            response = JSONResponse(
                status_code=201,
                content={
                    "message": "Your message has been sent successfully. We will get back to you soon.",
                    "contact_message": new_message,
                    "status": True
                }
            )
            # Allow all origins in development
            response.headers["Access-Control-Allow-Origin"] = "*"
            response.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS"
            response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
            return response
        else:
            logger.error("Failed to create contact message")
            response = JSONResponse(
                status_code=500,
                content={"message": "Failed to send your message. Please try again later.", "status": False}
            )
            response.headers["Access-Control-Allow-Origin"] = "*"
            return response
    except Exception as e:
        logger.error(f"Error creating contact message: {str(e)}")
        response = JSONResponse(
            status_code=500,
            content={"message": f"An error occurred: {str(e)}", "status": False}
        )
        response.headers["Access-Control-Allow-Origin"] = "*"
        return response

async def get_all_contact_messages_admin():
    """
    Get all contact messages (admin function)
    
    Returns:
        list: A list of all contact messages
    """
    try:
        logger.info("Getting all contact messages")
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
        
        return JSONResponse(
            status_code=200,
            content={
                "message": "Contact messages fetched successfully",
                "contact_messages": processed_messages,
                "count": len(processed_messages),
                "status": True
            }
        )
    except Exception as e:
        logger.error(f"Error getting all contact messages: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"message": f"An error occurred: {str(e)}", "status": False}
        )

async def get_contact_message_by_id_admin(message_id: str):
    """
    Get a specific contact message by ID
    
    Args:
        message_id: The ID of the contact message to get
        
    Returns:
        dict: The contact message if found, None otherwise
    """
    try:
        logger.info(f"Getting contact message by ID: {message_id}")
        
        # Find the message
        message = await contact_message_collection.find_one({"_id": ObjectId(message_id)})
        
        if not message:
            logger.warning(f"Contact message not found: {message_id}")
            return JSONResponse(
                status_code=404,
                content={"message": "Contact message not found", "status": False}
            )
        
        # Convert ObjectId to string
        message["_id"] = str(message["_id"])
        
        # Convert datetime to string
        if "created_at" in message and isinstance(message["created_at"], datetime):
            message["created_at"] = message["created_at"].isoformat()
        
        return JSONResponse(
            status_code=200,
            content={
                "message": "Contact message fetched successfully",
                "contact_message": message,
                "status": True
            }
        )
    except Exception as e:
        logger.error(f"Error getting contact message by ID: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"message": f"An error occurred: {str(e)}", "status": False}
        )

async def delete_contact_message_admin(message_id: str):
    """
    Delete a contact message
    
    Args:
        message_id: The ID of the contact message to delete
        
    Returns:
        dict: A status message indicating success or failure
    """
    try:
        logger.info(f"Deleting contact message: {message_id}")
        
        # Check if message exists
        existing_message = await contact_message_collection.find_one({"_id": ObjectId(message_id)})
        if not existing_message:
            logger.warning(f"Contact message not found for deletion: {message_id}")
            return JSONResponse(
                status_code=404,
                content={"message": "Contact message not found", "status": False}
            )
        
        # Delete message
        result = await contact_message_collection.delete_one({"_id": ObjectId(message_id)})
        
        if result.deleted_count == 0:
            logger.warning(f"Failed to delete contact message: {message_id}")
            return JSONResponse(
                status_code=500,
                content={"message": "Failed to delete contact message", "status": False}
            )
        
        return JSONResponse(
            status_code=200,
            content={
                "message": "Contact message deleted successfully",
                "status": True
            }
        )
    except Exception as e:
        logger.error(f"Error deleting contact message: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"message": f"An error occurred: {str(e)}", "status": False}
        ) 