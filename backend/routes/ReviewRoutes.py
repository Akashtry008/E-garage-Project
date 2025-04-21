from fastapi import APIRouter, Depends, Path, Query, Body
from controllers.ReviewController import (
    create_review, get_all_reviews, get_review_by_id, 
    get_provider_reviews, get_user_reviews, 
    update_review, delete_review, verify_review
)
from models.ReviewModel import ReviewCreate, ReviewUpdate
from typing import Optional

router = APIRouter(prefix="/api/reviews", tags=["Reviews"])

@router.post("/")
async def post_review(review: ReviewCreate):
    """Create a new review"""
    return await create_review(review)

@router.get("/")
async def get_reviews():
    """Get all reviews"""
    return await get_all_reviews()

@router.get("/{review_id}")
async def get_review(review_id: str = Path(..., description="The ID of the review to get")):
    """Get a review by ID"""
    return await get_review_by_id(review_id)

@router.get("/provider/{provider_id}")
async def get_reviews_by_provider(provider_id: str = Path(..., description="The ID of the service provider")):
    """Get all reviews for a specific service provider"""
    return await get_provider_reviews(provider_id)

@router.get("/user/{user_id}")
async def get_reviews_by_user(user_id: str = Path(..., description="The ID of the user")):
    """Get all reviews created by a specific user"""
    return await get_user_reviews(user_id)

@router.put("/{review_id}")
async def put_review(
    review_data: ReviewUpdate,
    review_id: str = Path(..., description="The ID of the review to update")
):
    """Update a review"""
    return await update_review(review_id, review_data)

@router.delete("/{review_id}")
async def remove_review(review_id: str = Path(..., description="The ID of the review to delete")):
    """Delete a review"""
    return await delete_review(review_id)

@router.patch("/{review_id}/verify")
async def verify_review_status(
    review_id: str = Path(..., description="The ID of the review to verify/unverify"),
    is_verified: bool = Body(..., embed=True, description="The verification status")
):
    """Verify or unverify a review"""
    return await verify_review(review_id, is_verified) 