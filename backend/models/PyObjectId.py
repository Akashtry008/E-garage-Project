from bson import ObjectId
from pydantic_core import core_schema
from typing import Any, ClassVar, Optional, Self, Type, Annotated

class PyObjectId:
    @classmethod
    def __get_pydantic_core_schema__(
        cls, 
        _source_type: Any, 
        _handler: Any
    ) -> core_schema.CoreSchema:
        """
        Define the Pydantic core schema for ObjectId validation and serialization
        """
        return core_schema.union_schema([
            # Accept string and convert to ObjectId
            core_schema.is_instance_schema(ObjectId),
            # Accept string format and convert
            core_schema.chain_schema([
                core_schema.str_schema(),
                core_schema.no_info_plain_validator_function(cls.validate),
            ]),
        ])
    
    @classmethod
    def validate(cls, value: Any) -> ObjectId:
        """
        Validate and convert the value to an ObjectId
        """
        if isinstance(value, ObjectId):
            return value
            
        if isinstance(value, str):
            try:
                return ObjectId(value)
            except Exception as e:
                raise ValueError(f"Invalid ObjectId format: {value}") from e
                
        raise ValueError(f"Value must be a string or ObjectId, got: {type(value)}")
    
    @classmethod
    def __get_validators__(cls):
        # For backward compatibility with older Pydantic versions
        yield cls.validate

# Create a type annotation for use in models
PydanticObjectId = Annotated[ObjectId, PyObjectId] 