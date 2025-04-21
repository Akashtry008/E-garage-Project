from models.ServiceModel import Service, ServiceOut, ServiceCreate, ServiceUpdate, OilChangeService
from bson import ObjectId
from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from config.database import service_collection
from datetime import datetime
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def create_service(service: ServiceCreate):
    try:
        logger.info(f"Creating new service: {service.serviceName}")
        
        # Prepare data for insertion
        service_data = service.dict()
        
        # Convert string IDs to ObjectId where needed
        if service.serviceProviderId:
            service_data["serviceProviderId"] = ObjectId(service.serviceProviderId)
        
        service_data["categoryId"] = ObjectId(service.categoryId)
        
        # Add timestamps
        service_data["created_at"] = datetime.now()
        service_data["updated_at"] = datetime.now()
        
        # Insert into database
        result = await service_collection.insert_one(service_data)
        
        if result.inserted_id:
            # Get the newly created service with its ID
            new_service = await service_collection.find_one({"_id": result.inserted_id})
            
            # Convert ObjectId fields to strings for response
            new_service["_id"] = str(new_service["_id"])
            new_service["categoryId"] = str(new_service["categoryId"])
            
            if "serviceProviderId" in new_service and new_service["serviceProviderId"]:
                new_service["serviceProviderId"] = str(new_service["serviceProviderId"])
            
            return JSONResponse(
                status_code=201,
                content={
                    "message": "Service created successfully",
                    "service": new_service,
                    "status": True
                }
            )
        else:
            logger.error("Failed to create service")
            return JSONResponse(
                status_code=500,
                content={"message": "Failed to create service", "status": False}
            )
    except Exception as e:
        logger.error(f"Error creating service: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"message": f"An error occurred: {str(e)}", "status": False}
        )

async def get_all_services():
    try:
        logger.info("Getting all services")
        services = await service_collection.find().to_list(length=1000)
        
        # Process services for response
        processed_services = []
        for service in services:
            # Convert ObjectId fields to strings
            service["_id"] = str(service["_id"])
            if "categoryId" in service:
                service["categoryId"] = str(service["categoryId"])
            
            if "serviceProviderId" in service and service["serviceProviderId"]:
                service["serviceProviderId"] = str(service["serviceProviderId"])
            
            processed_services.append(service)
        
        return JSONResponse(
            status_code=200,
            content={
                "message": "Services fetched successfully",
                "services": processed_services,
                "status": True
            }
        )
    except Exception as e:
        logger.error(f"Error getting all services: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"message": f"An error occurred: {str(e)}", "status": False}
        )

async def get_service_by_id(service_id: str):
    try:
        logger.info(f"Getting service by ID: {service_id}")
        
        # Find the service
        service = await service_collection.find_one({"_id": ObjectId(service_id)})
        
        if not service:
            logger.warning(f"Service not found: {service_id}")
            return JSONResponse(
                status_code=404,
                content={"message": "Service not found", "status": False}
            )
        
        # Convert ObjectId fields to strings
        service["_id"] = str(service["_id"])
        if "categoryId" in service:
            service["categoryId"] = str(service["categoryId"])
        
        if "serviceProviderId" in service and service["serviceProviderId"]:
            service["serviceProviderId"] = str(service["serviceProviderId"])
        
        return JSONResponse(
            status_code=200,
            content={
                "message": "Service fetched successfully",
                "service": service,
                "status": True
            }
        )
    except Exception as e:
        logger.error(f"Error getting service by ID: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"message": f"An error occurred: {str(e)}", "status": False}
        )

async def get_services_by_provider(provider_id: str):
    try:
        logger.info(f"Getting services by provider ID: {provider_id}")
        
        # Find services by provider ID
        services = await service_collection.find({"serviceProviderId": ObjectId(provider_id)}).to_list(length=1000)
        
        # Process services for response
        processed_services = []
        for service in services:
            # Convert ObjectId fields to strings
            service["_id"] = str(service["_id"])
            if "categoryId" in service:
                service["categoryId"] = str(service["categoryId"])
            service["serviceProviderId"] = str(service["serviceProviderId"])
            
            processed_services.append(service)
        
        return JSONResponse(
            status_code=200,
            content={
                "message": "Services fetched successfully",
                "services": processed_services,
                "count": len(processed_services),
                "status": True
            }
        )
    except Exception as e:
        logger.error(f"Error getting services by provider ID: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"message": f"An error occurred: {str(e)}", "status": False}
        )

async def get_services_by_category(category_id: str):
    try:
        logger.info(f"Getting services by category ID: {category_id}")
        
        # Find services by category ID
        services = await service_collection.find({"categoryId": ObjectId(category_id)}).to_list(length=1000)
        
        # Process services for response
        processed_services = []
        for service in services:
            # Convert ObjectId fields to strings
            service["_id"] = str(service["_id"])
            service["categoryId"] = str(service["categoryId"])
            
            if "serviceProviderId" in service and service["serviceProviderId"]:
                service["serviceProviderId"] = str(service["serviceProviderId"])
            
            processed_services.append(service)
        
        return JSONResponse(
            status_code=200,
            content={
                "message": "Services fetched successfully",
                "services": processed_services,
                "count": len(processed_services),
                "status": True
            }
        )
    except Exception as e:
        logger.error(f"Error getting services by category ID: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"message": f"An error occurred: {str(e)}", "status": False}
        )

async def update_service(service_id: str, service_data: ServiceUpdate):
    try:
        logger.info(f"Updating service: {service_id}")
        
        # Check if service exists
        existing_service = await service_collection.find_one({"_id": ObjectId(service_id)})
        if not existing_service:
            logger.warning(f"Service not found for update: {service_id}")
            return JSONResponse(
                status_code=404,
                content={"message": "Service not found", "status": False}
            )
        
        # Prepare update data
        update_data = {k: v for k, v in service_data.dict().items() if v is not None}
        
        # Convert string IDs to ObjectId where needed
        if "serviceProviderId" in update_data and update_data["serviceProviderId"]:
            update_data["serviceProviderId"] = ObjectId(update_data["serviceProviderId"])
        
        if "categoryId" in update_data and update_data["categoryId"]:
            update_data["categoryId"] = ObjectId(update_data["categoryId"])
        
        # Add updated timestamp
        update_data["updated_at"] = datetime.now()
        
        # Update service
        result = await service_collection.update_one(
            {"_id": ObjectId(service_id)},
            {"$set": update_data}
        )
        
        if result.modified_count == 0 and result.matched_count > 0:
            logger.warning(f"No changes made to service: {service_id}")
            return JSONResponse(
                status_code=200,
                content={"message": "No changes were made", "status": True}
            )
        
        # Get updated service
        updated_service = await service_collection.find_one({"_id": ObjectId(service_id)})
        
        # Convert ObjectId fields to strings
        updated_service["_id"] = str(updated_service["_id"])
        if "categoryId" in updated_service:
            updated_service["categoryId"] = str(updated_service["categoryId"])
        
        if "serviceProviderId" in updated_service and updated_service["serviceProviderId"]:
            updated_service["serviceProviderId"] = str(updated_service["serviceProviderId"])
        
        return JSONResponse(
            status_code=200,
            content={
                "message": "Service updated successfully",
                "service": updated_service,
                "status": True
            }
        )
    except Exception as e:
        logger.error(f"Error updating service: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"message": f"An error occurred: {str(e)}", "status": False}
        )

async def delete_service(service_id: str):
    try:
        logger.info(f"Deleting service: {service_id}")
        
        # Check if service exists
        existing_service = await service_collection.find_one({"_id": ObjectId(service_id)})
        if not existing_service:
            logger.warning(f"Service not found for deletion: {service_id}")
            return JSONResponse(
                status_code=404,
                content={"message": "Service not found", "status": False}
            )
        
        # Delete service
        result = await service_collection.delete_one({"_id": ObjectId(service_id)})
        
        if result.deleted_count == 0:
            logger.warning(f"Failed to delete service: {service_id}")
            return JSONResponse(
                status_code=500,
                content={"message": "Failed to delete service", "status": False}
            )
        
        return JSONResponse(
            status_code=200,
            content={
                "message": "Service deleted successfully",
                "status": True
            }
        )
    except Exception as e:
        logger.error(f"Error deleting service: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"message": f"An error occurred: {str(e)}", "status": False}
        )

# Oil Change Services
async def create_oil_change_services():
    """
    Create the predefined oil change services with prices
    """
    try:
        logger.info("Creating predefined oil change services")
        
        # Define the oil change services with prices
        oil_change_services = [
            {
                "name": "High-quality oil and filter replacement",
                "description": "Complete oil change with premium oil and new filter installation",
                "price": 49.99,
                "duration": 30,
                "icon": "🔧"
            },
            {
                "name": "Oil level and pressure inspection",
                "description": "Thorough check of oil levels and system pressure",
                "price": 19.99,
                "duration": 15,
                "icon": "📊"
            },
            {
                "name": "Service reminder reset",
                "description": "Reset service reminder and maintenance alert systems",
                "price": 9.99,
                "duration": 10,
                "icon": "🔄"
            },
            {
                "name": "Fluid top-up and engine cooling check",
                "description": "Inspection and top-up of all essential fluids and cooling system",
                "price": 29.99,
                "duration": 20,
                "icon": "🧪"
            }
        ]
        
        # Insert the services into the database
        inserted_services = []
        for service_data in oil_change_services:
            # Check if service already exists
            existing = await service_collection.find_one({
                "serviceName": service_data["name"],
                "serviceType": "oil_change"
            })
            
            if not existing:
                service = {
                    "serviceName": service_data["name"],
                    "serviceDescription": service_data["description"],
                    "price": service_data["price"],
                    "duration": service_data["duration"],
                    "icon": service_data["icon"],
                    "serviceType": "oil_change",
                    "isActive": True,
                    "created_at": datetime.now(),
                    "updated_at": datetime.now()
                }
                
                result = await service_collection.insert_one(service)
                if result.inserted_id:
                    new_service = await service_collection.find_one({"_id": result.inserted_id})
                    new_service["_id"] = str(new_service["_id"])
                    inserted_services.append(new_service)
        
        return JSONResponse(
            status_code=201,
            content={
                "message": "Oil change services created successfully",
                "services": inserted_services,
                "count": len(inserted_services),
                "status": True
            }
        )
    except Exception as e:
        logger.error(f"Error creating oil change services: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"message": f"An error occurred: {str(e)}", "status": False}
        )

async def get_oil_change_services():
    """
    Get all oil change services
    """
    try:
        logger.info("Getting oil change services")
        
        # Find oil change services
        services = await service_collection.find({"serviceType": "oil_change"}).to_list(length=100)
        
        # Process services for response
        processed_services = []
        for service in services:
            service["_id"] = str(service["_id"])
            processed_services.append(service)
        
        return JSONResponse(
            status_code=200,
            content={
                "message": "Oil change services fetched successfully",
                "services": processed_services,
                "count": len(processed_services),
                "status": True
            }
        )
    except Exception as e:
        logger.error(f"Error getting oil change services: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"message": f"An error occurred: {str(e)}", "status": False}
        )
