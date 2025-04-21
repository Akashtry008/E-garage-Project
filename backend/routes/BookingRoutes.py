from fastapi import APIRouter, Depends, Path, Query, Body, HTTPException
from fastapi.responses import JSONResponse
from controllers.BookingController import (
    create_booking, create_appointment_booking, create_service_booking,
    get_all_bookings, get_booking_by_id, 
    get_user_bookings, get_provider_bookings,
    update_booking, delete_booking,
    update_booking_status, update_payment_status
)
from models.BookingModel import BookingCreate, BookingUpdate, AppointmentBookingCreate, ServiceBookingCreate
from typing import Optional
import json
from datetime import datetime
import logging
from config.database import get_db  # <-- Fix the import path here
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/bookings", tags=["Bookings"])

# Custom JSON encoder to handle datetime objects
class DateTimeEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, datetime):
            return obj.isoformat()
        return super().default(obj)

@router.post("/")
async def post_booking(booking: BookingCreate):
    """Create a new generic booking"""
    try:
        return await create_booking(booking)
    except Exception as e:
        logger.error(f"Error in post_booking: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"message": f"An error occurred: {str(e)}", "status": False}
        )

@router.post("/appointment")
async def post_appointment(booking: AppointmentBookingCreate):
    """Create a new appointment booking"""
    try:
        logger.info(f"Received appointment booking: {booking}")
        
        # Convert booking to dict and ensure dates are strings
        booking_dict = booking.dict()
        if isinstance(booking_dict.get("booking_date"), datetime):
            booking_dict["booking_date"] = booking_dict["booking_date"].isoformat()
        logger.info(f"Processed booking data: {booking_dict}")
        
        return await create_appointment_booking(booking)
    except Exception as e:
        logger.error(f"Error in post_appointment: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"message": f"An error occurred: {str(e)}", "status": False}
        )

@router.post("/service")
async def post_service(booking: ServiceBookingCreate):
    return await create_service_booking(booking)

@router.get("/")
async def get_bookings():
    """Get all bookings"""
    return get_all_bookings()

@router.get("/{booking_id}")
async def get_booking(booking_id: str = Path(..., description="The ID of the booking to get")):
    """Get a booking by ID"""
    return await get_booking_by_id(booking_id)

@router.get("/user/{user_id}")
async def get_user_booking_history(user_id: str = Path(..., description="The ID of the user")):
    """Get all bookings for a specific user"""
    return await get_user_bookings(user_id)

@router.get("/provider/{provider_id}")
async def get_provider_booking_requests(provider_id: str = Path(..., description="The ID of the service provider")):
    """Get all bookings for a specific service provider"""
    return await get_provider_bookings(provider_id)

@router.put("/{booking_id}")
async def put_booking(
    booking_data: BookingUpdate,
    booking_id: str = Path(..., description="The ID of the booking to update")
):
    """Update a booking"""
    return await update_booking(booking_id, booking_data)

@router.delete("/{booking_id}")
async def remove_booking(booking_id: str = Path(..., description="The ID of the booking to delete")):
    """Delete a booking"""
    return await delete_booking(booking_id)

@router.patch("/{booking_id}/status")
async def update_status(
    booking_id: str = Path(..., description="The ID of the booking to update"),
    status: str = Body(..., embed=True, description="The new status")
):
    """Update booking status (pending, confirmed, completed, cancelled)"""
    return await update_booking_status(booking_id, status)

@router.patch("/{booking_id}/payment")
async def update_payment(
    booking_id: str = Path(..., description="The ID of the booking to update"),
    payment_status: str = Body(..., embed=True, description="The new payment status")
):
    """Update payment status (unpaid, paid, refunded)"""
    return await update_payment_status(booking_id, payment_status)

@router.get("/admin/appointments")
async def get_all_appointments():
    return await get_all_bookings()