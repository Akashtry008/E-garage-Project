from pydantic import BaseModel,Field,validator, EmailStr, ConfigDict
from bson import ObjectId
from typing import List, Optional, Dict, Any, Union
import bcrypt   #pip install bcrypt
from .PyObjectId import PydanticObjectId

# Configure model behavior for serialization
class MongoBaseModel(BaseModel):
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str}
    )

class UserBase(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    address: Optional[str] = None
    role_id: str = "default_user_role_id"
    avatar: Optional[str] = None
    is_active: bool = True
    is_verified: bool = False

class User(UserBase):
    password: str

class UserOut(UserBase):
    id: PydanticObjectId = Field(alias="_id")
    role: Optional[Dict[str, Any]] = None

    model_config = ConfigDict(
        from_attributes=True,
        populate_by_name=True,
        json_encoders={ObjectId: str}
    )

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    avatar: Optional[str] = None

class PasswordChange(BaseModel):
    current_password: str
    new_password: str
    confirm_password: str

    class Config:
        schema_extra = {
            "example": {
                "current_password": "oldpassword123",
                "new_password": "newpassword123",
                "confirm_password": "newpassword123"
            }
        }

class UserSignUp(BaseModel):
    firstName: str
    lastName: str
    email: str
    password: str
    confirm_password: Optional[str] = None
    terms_accepted: bool = True
    # Include name as an Optional field, which will be computed in the validator
    name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    role_id: str = "default_user_role_id"  
    avatar: Optional[str] = None
    is_active: bool = True
    is_verified: bool = False
    
    @validator("name", pre=True, always=True)
    def set_name_from_first_last(cls, v, values):
        # If name isn't provided but firstName and lastName are, combine them
        if not v and "firstName" in values and "lastName" in values:
            return f"{values['firstName']} {values['lastName']}"
        return v
    
    @validator("password", pre=True, always=True)
    def encrypt_password(cls, v):
        if v is None:
            return None
        return bcrypt.hashpw(v.encode("utf-8"), bcrypt.gensalt())
    
    @validator("role_id",pre=True,always=True)
    def convert_objectId(cls,v):
        if isinstance(v,ObjectId):
            return str(v)
        return v

    class Config:
        schema_extra = {
            "example": {
                "firstName": "John",
                "lastName": "Doe",
                "email": "john@example.com",
                "password": "password123",
                "confirm_password": "password123",
                "phone": "1234567890", 
                "role_id": "default_user_role_id",
                "terms_accepted": True
            }
        }

class UserSignIn(BaseModel):
    email: EmailStr
    password: str

    class Config:
        schema_extra = {
            "example": {
                "email": "john@example.com",
                "password": "password123"
            }
        }

class TokenData(BaseModel):
    email: Optional[str] = None
    id: Optional[str] = None
    exp: Optional[int] = None

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class AuthResponse(BaseModel):
    message: str
    token: Optional[str] = None
    user: Optional[UserOut] = None
    status: bool

class PasswordResetRequest(BaseModel):
    email: EmailStr

class PasswordReset(BaseModel):
    token: str
    new_password: str
    confirm_password: str

class EmailVerification(BaseModel):
    token: str

class TokenVerification(BaseModel):
    token: str
    
    class Config:
        schema_extra = {
            "example": {
                "token": "abcdef123456789"
            }
        }

class User(BaseModel):
    firstName:Optional[str]
    lastName:Optional[str]
    age:Optional[int]
    status:Optional[bool]
    role_id:Optional[str]
    email:Optional[str]
    password:Optional[str]
    
    #10,11,12,13,14,15,16,20,,,25,31
    @validator("password",pre=True,always=True)
    def encrypt_password(cls,v):
        if v is None:
            return None
        return bcrypt.hashpw(v.encode("utf-8"),bcrypt.gensalt())
        
    
    @validator("role_id",pre=True,always=True)
    def convert_objectId(cls,v):
        if isinstance(v,ObjectId):
            return str(v)
        return v


class UserOut(User):
    id: PydanticObjectId = Field(alias="_id")    
    role: Optional[Dict[str, Any]] = None
    
    model_config = ConfigDict(
        from_attributes=True,
        populate_by_name=True,
        json_encoders={ObjectId: str}
    )
    
class UserLogin(BaseModel):
    email:str
    password:str    

# New models for authentication
class UserSignIn(BaseModel):
    email: str
    password: str

class AuthResponse(BaseModel):
    message: str
    user: Optional[Dict[str, Any]] = None
    token: Optional[str] = None
    status: bool = True    