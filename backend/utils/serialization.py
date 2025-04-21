from bson import ObjectId
from typing import Any, Dict, List, Union

def serialize_objectid(data: Any) -> Any:
    """
    Recursively serialize objects, converting ObjectId to string
    
    Args:
        data: Any data structure that might contain ObjectId
        
    Returns:
        Serialized data with ObjectId converted to strings
    """
    if data is None:
        return None
        
    if isinstance(data, ObjectId):
        return str(data)
        
    if isinstance(data, dict):
        return {k: serialize_objectid(v) for k, v in data.items()}
        
    if isinstance(data, list):
        return [serialize_objectid(item) for item in data]
        
    if isinstance(data, tuple):
        return tuple(serialize_objectid(item) for item in data)
        
    return data
    
def prepare_mongodb_document(doc: Dict[str, Any]) -> Dict[str, Any]:
    """
    Prepare a MongoDB document for FastAPI response
    
    Args:
        doc: MongoDB document with _id field
        
    Returns:
        Document with ObjectId fields serialized
    """
    if not doc:
        return {}
        
    # Convert MongoDB _id to string
    if "_id" in doc and isinstance(doc["_id"], ObjectId):
        doc["id"] = str(doc["_id"])
        
    # Recursive serialization of all ObjectId values
    return serialize_objectid(doc)
    
def prepare_mongodb_documents(docs: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Prepare a list of MongoDB documents for FastAPI response
    
    Args:
        docs: List of MongoDB documents
        
    Returns:
        List of documents with ObjectId fields serialized
    """
    return [prepare_mongodb_document(doc) for doc in docs] 