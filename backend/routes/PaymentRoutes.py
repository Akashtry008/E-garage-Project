from fastapi import APIRouter, Depends, HTTPException, Body, Query, Path
from fastapi.responses import JSONResponse
from typing import List, Optional
import logging

from models.PaymentModel import PaymentCreate, PaymentUpdate, PaymentResponse, PaymentStatus
from controllers.PaymentController import (
    create_payment, 
    get_payment_by_id, 
    get_user_payments, 
    update_payment_status,
    get_all_payments,
    verify_razorpay_payment
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create router
payment_router = APIRouter(
    prefix="/api/payments",
    tags=["Payments"],
    responses={404: {"description": "Not found"}}
)

@payment_router.post("/", response_model=PaymentResponse, status_code=201)
async def api_create_payment(payment: PaymentCreate = Body(...)):
    """
    Create a new payment record
    """
    logger.info(f"API: Creating payment for service: {payment.service}")
    result = await create_payment(payment)
    return result

@payment_router.get("/{payment_id}", response_model=PaymentResponse)
async def api_get_payment(
    payment_id: str = Path(..., description="The ID of the payment to retrieve")
):
    """
    Get a payment by ID
    """
    logger.info(f"API: Retrieving payment with ID: {payment_id}")
    payment = await get_payment_by_id(payment_id)
    
    if not payment:
        raise HTTPException(
            status_code=404,
            detail=f"Payment with ID {payment_id} not found"
        )
    
    return payment

@payment_router.get("/user/{user_id}", response_model=List[PaymentResponse])
async def api_get_user_payments(
    user_id: str = Path(..., description="The ID of the user")
):
    """
    Get all payments for a specific user
    """
    logger.info(f"API: Retrieving payments for user: {user_id}")
    payments = await get_user_payments(user_id)
    return payments

@payment_router.patch("/{payment_id}", response_model=PaymentResponse)
async def api_update_payment_status(
    payment_update: PaymentUpdate = Body(...),
    payment_id: str = Path(..., description="The ID of the payment to update")
):
    """
    Update a payment's status
    """
    logger.info(f"API: Updating payment status for ID: {payment_id}")
    updated_payment = await update_payment_status(payment_id, payment_update)
    
    if not updated_payment:
        raise HTTPException(
            status_code=404,
            detail=f"Payment with ID {payment_id} not found"
        )
    
    return updated_payment

@payment_router.post("/verify")
async def api_verify_payment(
    payment_id: str = Body(..., embed=True),
    order_id: str = Body(..., embed=True),
    signature: str = Body(..., embed=True)
):
    """
    Verify a Razorpay payment signature
    """
    logger.info(f"API: Verifying payment: {payment_id}")
    is_valid = await verify_razorpay_payment(payment_id, signature, order_id)
    
    if is_valid:
        return JSONResponse(
            status_code=200,
            content={"status": "success", "message": "Payment verified successfully"}
        )
    else:
        return JSONResponse(
            status_code=400,
            content={"status": "error", "message": "Invalid payment signature"}
        )

@payment_router.get("/", response_model=List[PaymentResponse])
async def api_get_all_payments(
    skip: int = Query(0, description="Number of records to skip"),
    limit: int = Query(100, description="Maximum number of records to return")
):
    """
    Get all payments
    """
    logger.info(f"API: Retrieving all payments")
    payments = await get_all_payments(skip, limit)
    return payments 