from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum

class PaymentStatus(str, Enum):
    INITIATED = "initiated"
    PENDING = "pending"
    SUCCESSFUL = "successful"
    FAILED = "failed"
    REFUNDED = "refunded"

class PaymentMethod(str, Enum):
    ONLINE = "online"
    COD = "cod"

class PaymentBase(BaseModel):
    user_id: Optional[str] = None
    customer_name: str
    customer_email: str
    customer_phone: str
    service: str
    amount: float
    gst_amount: float = 0.0
    total_amount: float
    payment_method: PaymentMethod
    payment_status: PaymentStatus = PaymentStatus.INITIATED
    invoice_number: Optional[str] = None
    payment_id: Optional[str] = None
    notes: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class PaymentCreate(PaymentBase):
    pass

class PaymentUpdate(BaseModel):
    payment_status: Optional[PaymentStatus] = None
    payment_id: Optional[str] = None
    updated_at: Optional[datetime] = None

class PaymentResponse(PaymentBase):
    id: str
    
    class Config:
        from_attributes = True 