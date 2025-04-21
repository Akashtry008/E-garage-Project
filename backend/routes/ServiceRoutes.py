from fastapi import APIRouter, Depends, Path, Query
from controllers.ServiceController import (
    create_service, get_all_services, get_service_by_id, 
    get_services_by_provider, get_services_by_category,
    update_service, delete_service,
    create_oil_change_services, get_oil_change_services
)
from models.ServiceModel import Service, ServiceCreate, ServiceUpdate, OilChangeService
from typing import Optional, List

router = APIRouter(prefix="/api/services", tags=["Services"])


@router.post("/services")
async def post_service(service: ServiceCreate):
    """Create a new service"""
    return await create_service(service)

@router.get("/services")
async def get_services():
    return await get_all_services()

@router.get("/provider/{provider_id}")
async def get_provider_services(provider_id: str = Path(..., description="The ID of the service provider")):
    return await get_services_by_provider(provider_id)

@router.get("/category/{category_id}")
async def get_category_services(category_id: str = Path(..., description="The ID of the category")):
    return await get_services_by_category(category_id)

@router.get("/{service_id}")
async def get_service(service_id: str = Path(..., description="The ID of the service to get")):
    return await get_service_by_id(service_id)

@router.put("/{service_id}")
async def put_service(
    service_data: ServiceUpdate,
    service_id: str = Path(..., description="The ID of the service to update")
):
    return await update_service(service_id, service_data)

@router.delete("/{service_id}")
async def remove_service(service_id: str = Path(..., description="The ID of the service to delete")):
    return await delete_service(service_id)

# Oil change services endpoints
@router.post("/oil-change/init")
async def init_oil_change_services():
    """Initialize oil change services with predefined values"""
    return await create_oil_change_services()

@router.get("/oil-change")
async def get_oil_services():
    """Get all oil change services"""
    return await get_oil_change_services()

# Remove these lines from ServiceRoutes.py
# from controllers.BookingController import create_service_booking
# from models.BookingModel import ServiceBookingCreate

# @router.post("/book")
# async def book_service(booking: ServiceBookingCreate):
#     return await create_service_booking(booking)