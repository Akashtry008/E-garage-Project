from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any
from bson import ObjectId
from datetime import datetime

class ServiceBase(BaseModel):
    serviceName: str
    serviceDescription: str
    price: float
    duration: int
    categoryId: str
    serviceProviderId: Optional[str] = None
    isActive: bool = True
    imgUrl: Optional[str] = None

class Service(ServiceBase):
    pass

class ServiceCreate(ServiceBase):
    pass

class ServiceUpdate(BaseModel):
    serviceName: Optional[str] = None
    serviceDescription: Optional[str] = None
    price: Optional[float] = None
    duration: Optional[int] = None
    categoryId: Optional[str] = None
    serviceProviderId: Optional[str] = None
    isActive: Optional[bool] = None
    imgUrl: Optional[str] = None

class ServiceOut(ServiceBase):
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

class OilChangeService(BaseModel):
    name: str
    description: str
    price: float
    duration: int
    icon: Optional[str] = None
    