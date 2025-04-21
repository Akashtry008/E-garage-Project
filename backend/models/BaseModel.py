from pydantic import BaseModel, ConfigDict
from bson import ObjectId
from typing import Any, Dict, List, Optional

class MongoBaseModel(BaseModel):
    """
    Base model class for MongoDB documents with proper ObjectId handling
    """
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str}
    )

    @classmethod
    def from_mongo(cls, data: Dict[str, Any]) -> Optional['MongoBaseModel']:
        """
        Create model instance from MongoDB document
        with proper _id handling
        """
        if not data:
            return None
            
        # Convert MongoDB _id to string id for model
        id_field = data.pop('_id', None)
        
        # Create instance
        obj = cls(**data)
        
        # Set id field if it exists
        if id_field:
            obj.__dict__['id'] = id_field
            
        return obj
        
    def to_mongo(self) -> Dict[str, Any]:
        """
        Convert model to MongoDB document format
        """
        # Get dictionary representation
        data = self.model_dump(by_alias=True)
        
        # Handle id field
        if 'id' in data:
            data['_id'] = data.pop('id')
            
        return data
        
    @classmethod
    def from_mongo_list(cls, items: List[Dict[str, Any]]) -> List['MongoBaseModel']:
        """
        Create model instances from list of MongoDB documents
        """
        return [cls.from_mongo(item) for item in items] 