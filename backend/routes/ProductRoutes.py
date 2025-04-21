from fastapi import APIRouter, HTTPException
from models.ProductModel import Product
from controllers import productController # type: ignore

router = APIRouter()

@router.post("/create_product")
async def create_product(product: Product):
    print(product)
    return await productController.create_product(product)

@router.post("/create_product_file")
async def create_product(product: Product):
    print(product)
    return await productController.create_Product_withFile(product)