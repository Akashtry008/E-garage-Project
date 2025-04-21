from fastapi import APIRouter, Body, UploadFile, File

from models.ServiceProviderModel import ServiceProviderCreate, ServiceProviderUpdate, ServiceProviderFilter
from controllers.ServiceProviderController import (
    create_service_provider,
    get_all_service_providers,
    get_service_provider_by_id,
    get_service_provider_by_user_id,
    update_service_provider,
    delete_service_provider,
    filter_service_providers,
    verify_service_provider,
    update_provider_rating,
    upload_service_provider_avatar
)
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create router instance
router = APIRouter(
    prefix="/api/service-providers",
    tags=["Service Providers"]
)

# Create a new service provider
@router.post("/")
async def api_create_service_provider(
    service_provider: ServiceProviderCreate
):
    logger.info(f"API endpoint: Create service provider request received")
    return await create_service_provider(service_provider)

# Get all service providers
@router.get("/")
async def api_get_all_service_providers():
    logger.info("API endpoint: Get all service providers request received")
    return await get_all_service_providers()

# Get service provider by ID
@router.get("/{provider_id}")
async def api_get_service_provider_by_id(provider_id: str):
    logger.info(f"API endpoint: Get service provider by ID request received: {provider_id}")
    return await get_service_provider_by_id(provider_id)

# Get service provider by user ID
@router.get("/user/{user_id}")
async def api_get_service_provider_by_user_id(user_id: str):
    logger.info(f"API endpoint: Get service provider by user ID request received: {user_id}")
    return await get_service_provider_by_user_id(user_id)

# Update service provider
@router.put("/{provider_id}")
async def api_update_service_provider(
    provider_id: str,
    provider_data: ServiceProviderUpdate
):
    logger.info(f"API endpoint: Update service provider request received: {provider_id}")
    return await update_service_provider(provider_id, provider_data)

# Delete service provider
@router.delete("/{provider_id}")
async def api_delete_service_provider(
    provider_id: str
):
    logger.info(f"API endpoint: Delete service provider request received: {provider_id}")
    return await delete_service_provider(provider_id)

# Upload service provider avatar
@router.post("/{provider_id}/upload-avatar")
async def api_upload_service_provider_avatar(
    provider_id: str, 
    avatar: UploadFile = File(...)
):
    logger.info(f"API endpoint: Upload service provider avatar request received: {provider_id}")
    return await upload_service_provider_avatar(provider_id, avatar)

# Filter service providers
@router.post("/filter")
async def api_filter_service_providers(filter_data: ServiceProviderFilter):
    logger.info("API endpoint: Filter service providers request received")
    return await filter_service_providers(filter_data)

# Verify service provider
@router.put("/{provider_id}/verify")
async def api_verify_service_provider(
    provider_id: str,
    is_verified: bool = Body(..., embed=True)
):
    logger.info(f"API endpoint: Verify service provider request received: {provider_id}")
    return await verify_service_provider(provider_id, is_verified)

# Update service provider rating
@router.put("/{provider_id}/rating")
async def api_update_provider_rating(
    provider_id: str,
    rating: float = Body(..., embed=True)
):
    logger.info(f"API endpoint: Update service provider rating request received: {provider_id}")
    return await update_provider_rating(provider_id, rating)
