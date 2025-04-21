from turtle import update
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class ContactBase(BaseModel):
    id: Optional[str] = None
    name: str
    email: str
    phone: str
    message: str
    created_at: Optional[datetime] = None

class ContactCreate(ContactBase):
    pass

class ContactMessageCreate(BaseModel):
    name: Optional[str]
    email: Optional[EmailStr]
    phone: Optional[int]
    subject: Optional[str]
    message: Optional[str]
    updated_at: Optional[datetime] = None

class ContactMessageOut(ContactMessageCreate):
    id: str
    created_at: datetime
    read: bool = False

class ContactResponse(ContactBase):
    id: str
    read: bool = False
    
    class Config:
        from_attributes = True 