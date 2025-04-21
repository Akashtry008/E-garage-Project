from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any
from bson import ObjectId
from datetime import datetime

class NotificationBase(BaseModel):
    user_id: str
    title: str
    message: str
    notification_type: str  # booking, review, system, etc.
    related_id: Optional[str] = None  # ID of related entity (booking, review, etc.)
    is_read: bool = False

class NotificationCreate(NotificationBase):
    pass

class NotificationUpdate(BaseModel):
    title: Optional[str] = None
    message: Optional[str] = None
    is_read: Optional[bool] = None

class NotificationOut(NotificationBase):
    id: str = Field(alias="_id")
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    
    @validator("id", pre=True)
    def convert_objectid_to_str(cls, v):
        if isinstance(v, ObjectId):
            return str(v)
        return v
    
    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True

class NotificationPreferences(BaseModel):
    service_provider_id: str
    email_notifications: bool = True
    push_notifications: bool = True
    notify_on_booking: bool = True
    notify_on_review: bool = True
    notify_on_payment: bool = True
    
    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True 