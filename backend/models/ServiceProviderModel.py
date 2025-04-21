from pydantic import BaseModel, Field, validator, EmailStr
from typing import List, Optional, Dict, Any
from bson import ObjectId
from datetime import datetime

class ServiceProviderBase(BaseModel):
    user_id: str
    business_name: str
    description: Optional[str] = None
    category_id: str
    sub_category_ids: Optional[List[str]] = []
    area_id: Optional[str] = None
    city_id: Optional[str] = None
    state_id: Optional[str] = None
    address: Optional[str] = None
    contact_phone: Optional[str] = None
    profile_image: Optional[str] = None
    avatar: Optional[str] = None
    gallery_images: Optional[List[str]] = []
    is_verified: bool = False
    avg_rating: Optional[float] = 0.0
    total_ratings: Optional[int] = 0
    is_active: bool = True
    
    @validator("user_id", "category_id", "area_id", "city_id", "state_id", pre=True, always=True)
    def convert_object_ids(cls, v):
        if isinstance(v, ObjectId):
            return str(v)
        return v
    
    @validator("sub_category_ids", pre=True, always=True)
    def convert_list_object_ids(cls, v):
        if v is None:
            return []
        if isinstance(v, list):
            return [str(id) if isinstance(id, ObjectId) else id for id in v]
        return v

class ServiceProvider(ServiceProviderBase):
    created_at: Optional[datetime] = Field(default_factory=datetime.now)
    updated_at: Optional[datetime] = Field(default_factory=datetime.now)

class ServiceProviderCreate(ServiceProviderBase):
    pass

class ServiceProviderUpdate(BaseModel):
    business_name: Optional[str] = None
    description: Optional[str] = None
    category_id: Optional[str] = None
    sub_category_ids: Optional[List[str]] = None
    area_id: Optional[str] = None
    city_id: Optional[str] = None
    state_id: Optional[str] = None
    address: Optional[str] = None
    contact_phone: Optional[str] = None
    profile_image: Optional[str] = None
    avatar: Optional[str] = None
    gallery_images: Optional[List[str]] = None
    is_active: Optional[bool] = None

class ServiceProviderOut(ServiceProviderBase):
    id: str = Field(alias="_id")
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    user: Optional[Dict[str, Any]] = None
    category: Optional[Dict[str, Any]] = None
    sub_categories: Optional[List[Dict[str, Any]]] = []
    area: Optional[Dict[str, Any]] = None
    city: Optional[Dict[str, Any]] = None
    state: Optional[Dict[str, Any]] = None
    
    @validator("id", pre=True, always=True)
    def convert_id(cls, v):
        if isinstance(v, ObjectId):
            return str(v)
        return v
    
    @validator("user", "category", "area", "city", "state", pre=True, always=True)
    def convert_related_objects(cls, v):
        if isinstance(v, dict) and "_id" in v:
            v["_id"] = str(v["_id"])
        return v
    
    @validator("sub_categories", pre=True, always=True)
    def convert_sub_categories(cls, v):
        if v is None:
            return []
        if isinstance(v, list):
            for item in v:
                if isinstance(item, dict) and "_id" in item:
                    item["_id"] = str(item["_id"])
            return v
        return v

class ServiceProviderFilter(BaseModel):
    category_id: Optional[str] = None
    sub_category_ids: Optional[List[str]] = None
    area_id: Optional[str] = None
    city_id: Optional[str] = None
    state_id: Optional[str] = None
    rating_min: Optional[float] = None
    is_verified: Optional[bool] = None
    search_term: Optional[str] = None
