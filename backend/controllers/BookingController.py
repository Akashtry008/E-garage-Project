from models.BookingModel import BookingCreate, BookingUpdate, BookingOut, AppointmentBookingCreate, ServiceBookingCreate
from bson import ObjectId
from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from config.database import booking_collection, user_collection, service_collection, service_provider_collection
from datetime import datetime
import logging
from config.database import get_db  # or your actual db connection
from models.BookingModel import BookingCreate, BookingUpdate  # adjust as needed

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def create_booking(booking: BookingCreate):
    try:
        logger.info(f"Creating new booking for user: {booking.user_id}")
        
        # Prepare data for insertion
        booking_data = booking.dict()
        
        # Convert string IDs to ObjectId where needed
        try:
            booking_data["user_id"] = ObjectId(booking.user_id)
            booking_data["service_id"] = ObjectId(booking.service_id)
            booking_data["service_provider_id"] = ObjectId(booking.service_provider_id)
        except Exception as e:
            logger.error(f"Error converting IDs to ObjectId: {str(e)}")
            return JSONResponse(
                status_code=400,
                content={"message": f"Invalid ID format: {str(e)}", "status": False}
            )
        
        # Ensure booking_date is always a string to prevent serialization issues
        logger.info(f"Original booking_date type: {type(booking_data['booking_date'])}, value: {booking_data['booking_date']}")
        if isinstance(booking_data["booking_date"], datetime):
            booking_data["booking_date"] = booking_data["booking_date"].isoformat()
        
        # Verify booking_date format
        if not isinstance(booking_data["booking_date"], str):
            logger.error(f"Invalid booking_date format. Expected string, got {type(booking_data['booking_date'])}")
            return JSONResponse(
                status_code=400,
                content={"message": "Invalid date format. Please provide date as YYYY-MM-DD", "status": False}
            )
        
        logger.info(f"Processed booking_date: {booking_data['booking_date']}")
        
        # Determine booking type and process appropriately
        if hasattr(booking, 'booking_type'):
            booking_type = booking.booking_type
            logger.info(f"Processing {booking_type} booking")
            
            if booking_type == "service" and hasattr(booking, 'vehicle_model'):
                booking_data["vehicle_model"] = booking.vehicle_model
                
            if booking_type == "service" and hasattr(booking, 'payment_method'):
                booking_data["payment_method"] = booking.payment_method
                
            if booking_type == "appointment" and hasattr(booking, 'email'):
                booking_data["email"] = booking.email
        else:
            # For backward compatibility
            logger.info(f"No booking type specified, checking for component-specific fields")
            if hasattr(booking, 'vehicle_model'):
                booking_data["vehicle_model"] = booking.vehicle_model
                booking_data["booking_type"] = "service"
            
            if hasattr(booking, 'payment_method'):
                booking_data["payment_method"] = booking.payment_method
                booking_data["booking_type"] = "service"
                
            if hasattr(booking, 'email') and not hasattr(booking, 'vehicle_model'):
                booking_data["booking_type"] = "appointment"
        
        # Add timestamps as strings to avoid serialization issues
        now_str = datetime.now().isoformat()
        booking_data["created_at"] = now_str
        booking_data["updated_at"] = now_str
        
        # Insert into database
        try:
            result = await booking_collection.insert_one(booking_data)
            
            if result.inserted_id:
                # Get the newly created booking with its ID
                new_booking = await booking_collection.find_one({"_id": result.inserted_id})
                
                # Convert ObjectId fields to strings for response
                new_booking["_id"] = str(new_booking["_id"])
                new_booking["user_id"] = str(new_booking["user_id"])
                new_booking["service_id"] = str(new_booking["service_id"])
                new_booking["service_provider_id"] = str(new_booking["service_provider_id"])
                
                return JSONResponse(
                    status_code=201,
                    content={
                        "message": "Booking created successfully",
                        "booking": new_booking,
                        "status": True
                    }
                )
            else:
                logger.error("Failed to create booking")
                return JSONResponse(
                    status_code=500,
                    content={"message": "Failed to create booking", "status": False}
                )
        except Exception as db_error:
            logger.error(f"Database error creating booking: {str(db_error)}")
            return JSONResponse(
                status_code=500,
                content={"message": f"Database error: {str(db_error)}", "status": False}
            )
    except Exception as e:
        logger.error(f"Error creating booking: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"message": f"An error occurred: {str(e)}", "status": False}
        )

async def create_appointment_booking(booking: AppointmentBookingCreate):
    """Create a specific appointment booking"""
    try:
        logger.info(f"Creating appointment booking for user: {booking.user_id}")
        booking.booking_type = "appointment"
        return await create_booking(booking)
    except Exception as e:
        logger.error(f"Error creating appointment booking: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"message": f"An error occurred: {str(e)}", "status": False}
        )

async def create_service_booking(booking: ServiceBookingCreate):
    """Create a specific service booking"""
    try:
        logger.info(f"Creating service booking for user: {booking.user_id}")
        booking.booking_type = "service"
        return await create_booking(booking)
    except Exception as e:
        logger.error(f"Error creating service booking: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"message": f"An error occurred: {str(e)}", "status": False}
        )

async def get_all_bookings():
    try:
        logger.info("Getting all bookings")
        bookings = await booking_collection.find().to_list(length=1000)
        
        # Process bookings for response
        processed_bookings = []
        for booking in bookings:
            # Convert ObjectId fields to strings
            booking["_id"] = str(booking["_id"])
            booking["user_id"] = str(booking["user_id"])
            booking["service_id"] = str(booking["service_id"])
            booking["service_provider_id"] = str(booking["service_provider_id"])
            
            # Add user information if available
            try:
                user = await user_collection.find_one({"_id": ObjectId(booking["user_id"])})
                if user:
                    user["_id"] = str(user["_id"])
                    # Remove sensitive information
                    if "password" in user:
                        del user["password"]
                    booking["user"] = user
                    
                    # Add additional direct fields for easier frontend access
                    if not booking.get("customer_name") and user.get("name"):
                        booking["customer_name"] = user["name"]
                    if not booking.get("customer_email") and user.get("email"):
                        booking["customer_email"] = user["email"]
                    if not booking.get("customer_phone") and user.get("phone"):
                        booking["customer_phone"] = user["phone"]
            except Exception as e:
                logger.error(f"Error fetching user data for booking: {str(e)}")
                
            # Add service information if available
            try:
                service = await service_collection.find_one({"_id": ObjectId(booking["service_id"])})
                if service:
                    service["_id"] = str(service["_id"])
                    booking["service"] = service
                    
                    # Add additional direct fields for easier frontend access
                    if not booking.get("service_name") and service.get("name"):
                        booking["service_name"] = service["name"]
            except Exception as e:
                logger.error(f"Error fetching service data for booking: {str(e)}")
            
            processed_bookings.append(booking)
        
        return JSONResponse(
            status_code=200,
            content={
                "message": "Bookings fetched successfully",
                "bookings": processed_bookings,
                "status": True
            }
        )
    except Exception as e:
        logger.error(f"Error getting all bookings: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"message": f"An error occurred: {str(e)}", "status": False}
        )

async def get_booking_by_id(booking_id: str):
    try:
        logger.info(f"Getting booking by ID: {booking_id}")
        
        # Find the booking
        booking = await booking_collection.find_one({"_id": ObjectId(booking_id)})
        
        if not booking:
            logger.warning(f"Booking not found: {booking_id}")
            return JSONResponse(
                status_code=404,
                content={"message": "Booking not found", "status": False}
            )
        
        # Convert ObjectId fields to strings
        booking["_id"] = str(booking["_id"])
        booking["user_id"] = str(booking["user_id"])
        booking["service_id"] = str(booking["service_id"])
        booking["service_provider_id"] = str(booking["service_provider_id"])
        
        # Get related data
        user = await user_collection.find_one({"_id": ObjectId(booking["user_id"])})
        if user:
            user["_id"] = str(user["_id"])
            if "password" in user:
                del user["password"]
            booking["user"] = user
        
        service = await service_collection.find_one({"_id": ObjectId(booking["service_id"])})
        if service:
            service["_id"] = str(service["_id"])
            booking["service"] = service
        
        service_provider = await service_provider_collection.find_one({"_id": ObjectId(booking["service_provider_id"])})
        if service_provider:
            service_provider["_id"] = str(service_provider["_id"])
            booking["service_provider"] = service_provider
        
        return JSONResponse(
            status_code=200,
            content={
                "message": "Booking fetched successfully",
                "booking": booking,
                "status": True
            }
        )
    except Exception as e:
        logger.error(f"Error getting booking by ID: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"message": f"An error occurred: {str(e)}", "status": False}
        )

async def get_user_bookings(user_id: str):
    try:
        logger.info(f"Getting bookings for user: {user_id}")
        
        # Find bookings by user ID
        bookings = await booking_collection.find({"user_id": ObjectId(user_id)}).to_list(length=1000)
        
        # Process bookings for response
        processed_bookings = []
        appointment_bookings = []
        service_bookings = []
        
        for booking in bookings:
            # Convert ObjectId fields to strings
            booking["_id"] = str(booking["_id"])
            booking["user_id"] = str(booking["user_id"])
            booking["service_id"] = str(booking["service_id"])
            booking["service_provider_id"] = str(booking["service_provider_id"])
            
            # Get service info
            service = await service_collection.find_one({"_id": ObjectId(booking["service_id"])})
            if service:
                service["_id"] = str(service["_id"])
                booking["service"] = service
            
            # Get service provider info
            service_provider = await service_provider_collection.find_one({"_id": ObjectId(booking["service_provider_id"])})
            if service_provider:
                service_provider["_id"] = str(service_provider["_id"])
                booking["service_provider"] = service_provider
            
            # Categorize booking by type
            booking_type = booking.get("booking_type", "appointment")  # Default to appointment for backward compatibility
            
            if booking_type == "service":
                service_bookings.append(booking)
            else:
                appointment_bookings.append(booking)
                
            processed_bookings.append(booking)
        
        return JSONResponse(
            status_code=200,
            content={
                "message": "User bookings fetched successfully",
                "bookings": processed_bookings,
                "appointment_bookings": appointment_bookings,
                "service_bookings": service_bookings,
                "count": len(processed_bookings),
                "appointment_count": len(appointment_bookings),
                "service_count": len(service_bookings),
                "status": True
            }
        )
    except Exception as e:
        logger.error(f"Error getting user bookings: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"message": f"An error occurred: {str(e)}", "status": False}
        )

async def get_provider_bookings(provider_id: str):
    try:
        logger.info(f"Getting bookings for service provider: {provider_id}")
        
        # Find bookings by service provider ID
        bookings = await booking_collection.find({"service_provider_id": ObjectId(provider_id)}).to_list(length=1000)
        
        # Process bookings for response
        processed_bookings = []
        for booking in bookings:
            # Convert ObjectId fields to strings
            booking["_id"] = str(booking["_id"])
            booking["user_id"] = str(booking["user_id"])
            booking["service_id"] = str(booking["service_id"])
            booking["service_provider_id"] = str(booking["service_provider_id"])
            
            # Get user info
            user = await user_collection.find_one({"_id": ObjectId(booking["user_id"])})
            if user:
                user["_id"] = str(user["_id"])
                if "password" in user:
                    del user["password"]
                booking["user"] = user
            
            # Get service info
            service = await service_collection.find_one({"_id": ObjectId(booking["service_id"])})
            if service:
                service["_id"] = str(service["_id"])
                booking["service"] = service
            
            processed_bookings.append(booking)
        
        return JSONResponse(
            status_code=200,
            content={
                "message": "Provider bookings fetched successfully",
                "bookings": processed_bookings,
                "count": len(processed_bookings),
                "status": True
            }
        )
    except Exception as e:
        logger.error(f"Error getting provider bookings: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"message": f"An error occurred: {str(e)}", "status": False}
        )

async def update_booking(booking_id: str, booking_data: BookingUpdate):
    try:
        logger.info(f"Updating booking: {booking_id}")
        
        # Check if booking exists
        existing_booking = await booking_collection.find_one({"_id": ObjectId(booking_id)})
        if not existing_booking:
            logger.warning(f"Booking not found for update: {booking_id}")
            return JSONResponse(
                status_code=404,
                content={"message": "Booking not found", "status": False}
            )
        
        # Prepare update data
        update_data = {k: v for k, v in booking_data.dict().items() if v is not None}
        
        # Add updated timestamp
        update_data["updated_at"] = datetime.now().isoformat()
        
        # Update booking
        result = await booking_collection.update_one(
            {"_id": ObjectId(booking_id)},
            {"$set": update_data}
        )
        
        if result.modified_count == 0 and result.matched_count > 0:
            logger.warning(f"No changes made to booking: {booking_id}")
            return JSONResponse(
                status_code=200,
                content={"message": "No changes were made", "status": True}
            )
        
        # Get updated booking
        updated_booking = await booking_collection.find_one({"_id": ObjectId(booking_id)})
        
        # Convert ObjectId fields to strings
        updated_booking["_id"] = str(updated_booking["_id"])
        updated_booking["user_id"] = str(updated_booking["user_id"])
        updated_booking["service_id"] = str(updated_booking["service_id"])
        updated_booking["service_provider_id"] = str(updated_booking["service_provider_id"])
        
        return JSONResponse(
            status_code=200,
            content={
                "message": "Booking updated successfully",
                "booking": updated_booking,
                "status": True
            }
        )
    except Exception as e:
        logger.error(f"Error updating booking: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"message": f"An error occurred: {str(e)}", "status": False}
        )

async def delete_booking(booking_id: str):
    try:
        logger.info(f"Deleting booking: {booking_id}")
        
        # Check if booking exists
        existing_booking = await booking_collection.find_one({"_id": ObjectId(booking_id)})
        if not existing_booking:
            logger.warning(f"Booking not found for deletion: {booking_id}")
            return JSONResponse(
                status_code=404,
                content={"message": "Booking not found", "status": False}
            )
        
        # Delete booking
        result = await booking_collection.delete_one({"_id": ObjectId(booking_id)})
        
        if result.deleted_count == 0:
            logger.warning(f"Failed to delete booking: {booking_id}")
            return JSONResponse(
                status_code=500,
                content={"message": "Failed to delete booking", "status": False}
            )
        
        return JSONResponse(
            status_code=200,
            content={
                "message": "Booking deleted successfully",
                "status": True
            }
        )
    except Exception as e:
        logger.error(f"Error deleting booking: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"message": f"An error occurred: {str(e)}", "status": False}
        )

async def update_booking_status(booking_id: str, status: str):
    try:
        logger.info(f"Updating booking status to {status} for booking: {booking_id}")
        
        # Check if booking exists
        existing_booking = await booking_collection.find_one({"_id": ObjectId(booking_id)})
        if not existing_booking:
            logger.warning(f"Booking not found for status update: {booking_id}")
            return JSONResponse(
                status_code=404,
                content={"message": "Booking not found", "status": False}
            )
        
        # Validate status
        valid_statuses = ["pending", "confirmed", "completed", "cancelled"]
        if status not in valid_statuses:
            logger.warning(f"Invalid status: {status}")
            return JSONResponse(
                status_code=400,
                content={"message": f"Invalid status. Must be one of: {', '.join(valid_statuses)}", "status": False}
            )
        
        # Update booking status
        result = await booking_collection.update_one(
            {"_id": ObjectId(booking_id)},
            {
                "$set": {
                    "status": status,
                    "updated_at": datetime.now().isoformat()
                }
            }
        )
        
        if result.modified_count == 0:
            if existing_booking.get("status") == status:
                return JSONResponse(
                    status_code=200,
                    content={"message": f"Booking already has status: {status}", "status": True}
                )
            else:
                logger.warning(f"Failed to update booking status: {booking_id}")
                return JSONResponse(
                    status_code=500,
                    content={"message": "Failed to update booking status", "status": False}
                )
        
        return JSONResponse(
            status_code=200,
            content={
                "message": f"Booking status updated to {status} successfully",
                "status": True
            }
        )
    except Exception as e:
        logger.error(f"Error updating booking status: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"message": f"An error occurred: {str(e)}", "status": False}
        )

async def update_payment_status(booking_id: str, payment_status: str):
    try:
        logger.info(f"Updating payment status to {payment_status} for booking: {booking_id}")
        
        # Check if booking exists
        existing_booking = await booking_collection.find_one({"_id": ObjectId(booking_id)})
        if not existing_booking:
            logger.warning(f"Booking not found for payment status update: {booking_id}")
            return JSONResponse(
                status_code=404,
                content={"message": "Booking not found", "status": False}
            )
        
        # Validate payment status
        valid_payment_statuses = ["unpaid", "paid", "refunded"]
        if payment_status not in valid_payment_statuses:
            logger.warning(f"Invalid payment status: {payment_status}")
            return JSONResponse(
                status_code=400,
                content={"message": f"Invalid payment status. Must be one of: {', '.join(valid_payment_statuses)}", "status": False}
            )
        
        # Update booking payment status
        result = await booking_collection.update_one(
            {"_id": ObjectId(booking_id)},
            {
                "$set": {
                    "payment_status": payment_status,
                    "updated_at": datetime.now().isoformat()
                }
            }
        )
        
        if result.modified_count == 0:
            if existing_booking.get("payment_status") == payment_status:
                return JSONResponse(
                    status_code=200,
                    content={"message": f"Booking already has payment status: {payment_status}", "status": True}
                )
            else:
                logger.warning(f"Failed to update booking payment status: {booking_id}")
                return JSONResponse(
                    status_code=500,
                    content={"message": "Failed to update booking payment status", "status": False}
                )
        
        return JSONResponse(
            status_code=200,
            content={
                "message": f"Booking payment status updated to {payment_status} successfully",
                "status": True
            }
        )
    except Exception as e:
        logger.error(f"Error updating booking payment status: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"message": f"An error occurred: {str(e)}", "status": False}
        )


## 3. Razorpay Integration

# - Implement the `openRazorpayCheckout` function to open the Razorpay payment modal using the order details from the backend.
# - On payment success, call your backend to update the booking's `payment_status` to `"paid"`.

# ---

## Summary of Backend Edit

async def create_service_booking(booking_data):
    payment_method = booking_data.payment_method
    if payment_method == "cod":
        booking_data.payment_status = "unpaid"
        booking_data.status = "confirmed"
        # Save booking and return success
    elif payment_method == "online":
        booking_data.payment_status = "pending"
        booking_data.status = "pending"
        # Save booking, create Razorpay order, and return order info
    else:
        
        return JSONResponse(
            status_code=400,
            content={
                "message": "Invalid payment method. Must be either 'cod' or 'online'",
                "status": False
            }
        )
