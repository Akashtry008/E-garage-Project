from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any
from bson import ObjectId
from datetime import datetime

class ReviewBase(BaseModel):
    user_id: str
    service_id: Optional[str] = None
    service_provider_id: str
    rating: float
    comment: Optional[str] = None
    is_verified: bool = False

class ReviewCreate(ReviewBase):
    pass

class ReviewUpdate(BaseModel):
    rating: Optional[float] = None
    comment: Optional[str] = None
    is_verified: Optional[bool] = None

class ReviewOut(ReviewBase):
    id: str = Field(alias="_id")
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    user: Optional[Dict[str, Any]] = None
    service: Optional[Dict[str, Any]] = None
    service_provider: Optional[Dict[str, Any]] = None
    
    @validator("id", pre=True)
    def convert_objectid_to_str(cls, v):
        if isinstance(v, ObjectId):
            return str(v)
        return v
    
    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True 