from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any, Union
from bson import ObjectId
from datetime import datetime

class BookingBase(BaseModel):
    user_id: str
    service_id: str
    service_provider_id: str
    booking_date: Union[str, datetime]  # Can accept either string or datetime
    booking_time: str
    status: str = "pending"  # pending, confirmed, completed, cancelled
    price: float
    payment_status: str = "unpaid"  # unpaid, paid
    notes: Optional[str] = None
    # Type field to distinguish between appointment and service
    booking_type: str = "appointment"  # appointment, service

    @validator("booking_date", pre=True)
    def validate_booking_date(cls, v):
        """Convert booking_date to ISO string format if it's a datetime object"""
        if isinstance(v, datetime):
            return v.isoformat()
        return v

class AppointmentBooking(BookingBase):
    """Model for appointment bookings (BookAppointment component)"""
    booking_type: str = "appointment"
    email: Optional[str] = None

class ServiceBooking(BookingBase):
    """Model for service bookings (BookService component)"""
    booking_type: str = "service"
    vehicle_model: Optional[str] = None
    payment_method: Optional[str] = None

class BookingCreate(BookingBase):
    pass

class AppointmentBookingCreate(AppointmentBooking):
    pass

class ServiceBookingCreate(ServiceBooking):
    pass

class BookingUpdate(BaseModel):
    booking_date: Optional[Union[str, datetime]] = None
    booking_time: Optional[str] = None
    status: Optional[str] = None
    price: Optional[float] = None
    payment_status: Optional[str] = None
    notes: Optional[str] = None
    vehicle_model: Optional[str] = None
    payment_method: Optional[str] = None
    email: Optional[str] = None
    
    @validator("booking_date", pre=True)
    def validate_booking_date(cls, v):
        """Convert booking_date to ISO string format if it's a datetime object"""
        if v is not None and isinstance(v, datetime):
            return v.isoformat()
        return v

class BookingOut(BookingBase):
    id: str = Field(alias="_id")
    created_at: Optional[Union[str, datetime]] = None
    updated_at: Optional[Union[str, datetime]] = None
    service: Optional[Dict[str, Any]] = None
    user: Optional[Dict[str, Any]] = None
    service_provider: Optional[Dict[str, Any]] = None
    
    @validator("id", pre=True)
    def convert_objectid_to_str(cls, v):
        if isinstance(v, ObjectId):
            return str(v)
        return v
    
    @validator("created_at", "updated_at", pre=True)
    def validate_timestamps(cls, v):
        """Ensure timestamps are in string format"""
        if v is not None and isinstance(v, datetime):
            return v.isoformat()
        return v
    
    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True 