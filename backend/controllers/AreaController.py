# from models.AreaModel import Area,AreaOut
# from bson import ObjectId
# from config.database import area_collection,city_collection
# from fastapi import APIRouter,HTTPException
# from fastapi.responses import JSONResponse


# async def addArea(area:Area):
#     area.city_id = ObjectId(area.city_id)
#     savedArea = await area_collection.insert_one(area.dict())
#     return JSONResponse(content={"message":"Area added"},status_code=201)

# async def getArea():

#     areas = await area_collection.find().to_list()
    
#     for area in areas:
#         if "city_id" in area and isinstance(area["city_id"],ObjectId):
#             area["_id"] = str(area["_id"])
#             area["city_id"] = str(area["city_id"])
        
#         city  = await city_collection.find_one({"_id":ObjectId(area["city_id"])})    
#         if city:
#             city["_id"] = str(city["_id"])
#             area["city"] = city
    
#     return [AreaOut(**area) for area in areas]

# # async def getArea(): 
# #     areas = await area_collection.find().to_list(length=None)
    
# #     for area in areas:
# #         if "city_id" in area and isinstance(area["city_id"], ObjectId):
# #             # area["_id"] = str(area["_id"])
# #             area["city_id"] = str(area["city_id"])
        
# #         # Fetch city details
# #         city = await city_collection.find_one({"_id": ObjectId(area["city_id"])}) if "city_id" in area else None
        
# #         if city:
# #             city["_id"] = str(city["_id"])
# #             area["city"] = city  # Embedding city data into area
    
# #     return [AreaOut(**area) for area in areas]
from models.AreaModel import Area, AreaOut
from bson import ObjectId
from config.database import area_collection, city_collection
from fastapi.responses import JSONResponse

async def addArea(area: Area):
    """Add a new area and store it in the database."""
    area.city_id = ObjectId(area.city_id)  # Convert city_id to ObjectId
    savedArea = await area_collection.insert_one(area.dict())
    return JSONResponse(content={"message": "Area added"}, status_code=201)

async def getArea():
    """Retrieve all areas with embedded city details."""
    
    areas = await area_collection.find().to_list(length=None)  # Corrected usage
    
    result = []
    
    for area in areas:
        # Convert ObjectId to string for JSON serialization
        if "_id" in area and isinstance(area["_id"], ObjectId):
            area["_id"] = str(area["_id"])
        
        if "city_id" in area and isinstance(area["city_id"], ObjectId):
            area["city_id"] = str(area["city_id"])
        
        # Fetch city details and embed them
        city = await city_collection.find_one({"_id": ObjectId(area["city_id"])}) if "city_id" in area else None
        if city:
            city["_id"] = str(city["_id"])
            area["city"] = city  # Embedding city data into area
        
        result.append(AreaOut(**area))  # Convert to Pydantic model

    return result  # Return list of serialized areas
