from bson import ObjectId
from models.PaymentModel import PaymentCreate, PaymentUpdate, PaymentResponse, PaymentStatus, PaymentMethod
from config.database import payment_collection, booking_collection
from fastapi import HTTPException
from datetime import datetime
import logging
from typing import List, Optional
from pymongo.errors import PyMongoError

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def create_payment(payment: PaymentCreate) -> dict:
    """
    Create a new payment record
    
    Args:
        payment: The payment details
        
    Returns:
        dict: The created payment record
    """
    try:
        # Prepare data for insertion
        payment_dict = payment.dict()
        
        # Generate invoice number
        invoice_number = f"INV-{datetime.now().strftime('%Y%m%d')}-{datetime.now().timestamp():.0f}"[-12:]
        payment_dict["invoice_number"] = invoice_number
        
        # Set timestamps
        current_time = datetime.now()
        payment_dict["created_at"] = current_time
        payment_dict["updated_at"] = current_time
        
        # Insert into database
        result = await payment_collection.insert_one(payment_dict)
        
        if result.inserted_id:
            # Get the newly created payment
            new_payment = await payment_collection.find_one({"_id": result.inserted_id})
            if new_payment:
                # Convert ObjectId to string
                new_payment["id"] = str(new_payment.pop("_id"))
                
                # Convert datetime to ISO format
                if "created_at" in new_payment and isinstance(new_payment["created_at"], datetime):
                    new_payment["created_at"] = new_payment["created_at"].isoformat()
                if "updated_at" in new_payment and isinstance(new_payment["updated_at"], datetime):
                    new_payment["updated_at"] = new_payment["updated_at"].isoformat()
                
                logger.info(f"Payment created with ID: {new_payment['id']}")
                return new_payment
        
        logger.error("Failed to create payment record")
        raise HTTPException(
            status_code=500, 
            detail="Failed to create payment record"
        )
    
    except PyMongoError as e:
        logger.error(f"Database error creating payment: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Database error: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Unexpected error creating payment: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"An unexpected error occurred: {str(e)}"
        )

async def get_payment_by_id(payment_id: str) -> Optional[dict]:
    """
    Get a payment by its ID
    
    Args:
        payment_id: The ID of the payment to retrieve
        
    Returns:
        dict: The payment if found, None otherwise
    """
    try:
        # Convert string ID to ObjectId
        oid = ObjectId(payment_id)
        payment = await payment_collection.find_one({"_id": oid})
        
        if payment:
            # Convert ObjectId to string
            payment["id"] = str(payment.pop("_id"))
            
            # Convert datetime to ISO format
            if "created_at" in payment and isinstance(payment["created_at"], datetime):
                payment["created_at"] = payment["created_at"].isoformat()
            if "updated_at" in payment and isinstance(payment["updated_at"], datetime):
                payment["updated_at"] = payment["updated_at"].isoformat()
                
            logger.info(f"Retrieved payment with ID: {payment_id}")
            return payment
        
        logger.warning(f"Payment with ID {payment_id} not found")
        return None
    
    except PyMongoError as e:
        logger.error(f"Database error retrieving payment: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Database error: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Unexpected error retrieving payment: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"An unexpected error occurred: {str(e)}"
        )

async def get_user_payments(user_id: str) -> List[dict]:
    """
    Get all payments for a specific user
    
    Args:
        user_id: The ID of the user
        
    Returns:
        List[dict]: List of payments for the user
    """
    try:
        payments = []
        cursor = payment_collection.find({"user_id": user_id}).sort("created_at", -1)
        
        async for document in cursor:
            # Convert ObjectId to string
            document["id"] = str(document.pop("_id"))
            
            # Convert datetime to ISO format
            if "created_at" in document and isinstance(document["created_at"], datetime):
                document["created_at"] = document["created_at"].isoformat()
            if "updated_at" in document and isinstance(document["updated_at"], datetime):
                document["updated_at"] = document["updated_at"].isoformat()
                
            payments.append(document)
        
        logger.info(f"Retrieved {len(payments)} payments for user: {user_id}")
        return payments
    
    except PyMongoError as e:
        logger.error(f"Database error retrieving user payments: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Database error: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Unexpected error retrieving user payments: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"An unexpected error occurred: {str(e)}"
        )

async def update_payment_status(payment_id: str, payment_update: PaymentUpdate) -> Optional[dict]:
    """
    Update a payment's status
    
    Args:
        payment_id: The ID of the payment to update
        payment_update: The payment update data
        
    Returns:
        dict: The updated payment if successful, None otherwise
    """
    try:
        # Convert string ID to ObjectId
        oid = ObjectId(payment_id)
        
        # Check if payment exists
        existing_payment = await payment_collection.find_one({"_id": oid})
        if not existing_payment:
            logger.warning(f"Payment with ID {payment_id} not found for update")
            return None
        
        # Prepare update data
        update_data = payment_update.dict(exclude_unset=True)
        update_data["updated_at"] = datetime.now()
        
        # Update the payment
        result = await payment_collection.update_one(
            {"_id": oid},
            {"$set": update_data}
        )
        
        if result.modified_count:
            # Get the updated payment
            updated_payment = await payment_collection.find_one({"_id": oid})
            
            # Convert ObjectId to string
            updated_payment["id"] = str(updated_payment.pop("_id"))
            
            # Convert datetime to ISO format
            if "created_at" in updated_payment and isinstance(updated_payment["created_at"], datetime):
                updated_payment["created_at"] = updated_payment["created_at"].isoformat()
            if "updated_at" in updated_payment and isinstance(updated_payment["updated_at"], datetime):
                updated_payment["updated_at"] = updated_payment["updated_at"].isoformat()
            
            logger.info(f"Updated payment status for ID: {payment_id} to {update_data.get('payment_status')}")
            
            # If payment is successful, update associated booking if there's a matching one
            if update_data.get('payment_status') == PaymentStatus.SUCCESSFUL and updated_payment.get('payment_id'):
                try:
                    # Find associated booking
                    await booking_collection.update_many(
                        {"payment_id": updated_payment.get('payment_id')},
                        {"$set": {"payment_status": "paid", "updated_at": datetime.now()}}
                    )
                    logger.info(f"Updated associated booking for payment ID: {updated_payment.get('payment_id')}")
                except Exception as e:
                    logger.error(f"Error updating booking for payment: {str(e)}")
            
            return updated_payment
        
        logger.warning(f"No changes made to payment with ID: {payment_id}")
        return await get_payment_by_id(payment_id)
    
    except PyMongoError as e:
        logger.error(f"Database error updating payment: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Database error: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Unexpected error updating payment: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"An unexpected error occurred: {str(e)}"
        )

async def verify_razorpay_payment(razorpay_payment_id: str, razorpay_signature: str, razorpay_order_id: str) -> bool:
    """
    Verify Razorpay payment signature
    
    Args:
        razorpay_payment_id: Payment ID from Razorpay
        razorpay_signature: Signature from Razorpay
        razorpay_order_id: Order ID from Razorpay
        
    Returns:
        bool: True if signature is valid, False otherwise
    """
    # In a real implementation, you would use the Razorpay SDK to verify the signature
    # This is a placeholder function
    logger.info(f"Verifying Razorpay payment: {razorpay_payment_id}")
    return True

async def get_all_payments(skip: int = 0, limit: int = 100) -> List[dict]:
    """
    Get all payments with pagination
    
    Args:
        skip: Number of records to skip
        limit: Maximum number of records to return
        
    Returns:
        List[dict]: List of payments
    """
    try:
        payments = []
        cursor = payment_collection.find().skip(skip).limit(limit).sort("created_at", -1)
        
        async for document in cursor:
            # Convert ObjectId to string
            document["id"] = str(document.pop("_id"))
            
            # Convert datetime to ISO format
            if "created_at" in document and isinstance(document["created_at"], datetime):
                document["created_at"] = document["created_at"].isoformat()
            if "updated_at" in document and isinstance(document["updated_at"], datetime):
                document["updated_at"] = document["updated_at"].isoformat()
                
            payments.append(document)
        
        logger.info(f"Retrieved {len(payments)} payments")
        return payments
    
    except PyMongoError as e:
        logger.error(f"Database error retrieving all payments: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Database error: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Unexpected error retrieving all payments: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"An unexpected error occurred: {str(e)}"
        ) 