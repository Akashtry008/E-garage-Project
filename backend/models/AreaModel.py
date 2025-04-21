# from pydantic import BaseModel,Field,validator
# from typing import List, Optional,Dict,Any
# from bson import ObjectId

# class Area(BaseModel):
#     name: str
#     city_id:str
    


# class AreaOut(Area):
#     id:str = Field(alias="_id")
#     city:Optional[Dict[str,Any]] = None
#     # state:Optional[Dict[str,Any]] = None    
    
#     @validator("id",pre=True,always=True)
#     def convert_objectId(cls,v):
#         if isinstance(v,ObjectId):
#             return str(v)
#         return v
    
#     @validator("city", pre=True, always=True)
#     def convert_city(cls, v):
#         if isinstance(v, dict) and "_id" in v:
#             v["_id"] = str(v["_id"])  # Convert role _id to string
#         return v
from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any
from bson import ObjectId


class Area(BaseModel):
    name: str
    city_id: str  # This will be converted before storing in DB


class AreaOut(Area):
    id: str = Field(alias="_id")  # Map MongoDB "_id" to "id"
    city: Optional[Dict[str, Any]] = None  # Nested city data

    @validator("id", pre=True, always=True)
    def convert_objectid(cls, v):
        """Convert MongoDB ObjectId to string for serialization."""
        if isinstance(v, ObjectId):
            return str(v)
        return v

    @validator("city_id", pre=True, always=True)
    def convert_city_id(cls, v):
        """Ensure city_id is always a string."""
        if isinstance(v, ObjectId):
            return str(v)
        return v

    @validator("city", pre=True, always=True)
    def convert_city(cls, v):
        """Convert nested city ObjectId fields to strings."""
        if isinstance(v, dict):
            if "_id" in v and isinstance(v["_id"], ObjectId):
                v["_id"] = str(v["_id"])
            return v
        return v
