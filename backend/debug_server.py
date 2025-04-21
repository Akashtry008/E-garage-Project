"""
Debug script to identify server startup issues
"""

import os
import sys
import traceback

print("=== DEBUG INFO ===")
print(f"Current working directory: {os.getcwd()}")
print(f"Python executable: {sys.executable}")
print(f"Python version: {sys.version}")
print(f"Python path: {sys.path}")
print()

print("=== Checking imports ===")

# Try importing each module from main.py
modules_to_check = [
    "fastapi",
    "routes.UserRoutes",
    "routes.AuthRoutes",
    "routes.ServiceProviderRoutes",
    "routes.RoleRoutes",
    "routes.StateRoutes",
    "routes.CityRoutes",
    "routes.AreaRoutes",
    "routes.CategoryRoutes",
    "routes.SubCategoryRoutes",
    "routes.ProductRoutes",
    "routes.ServiceRoutes",
    "routes.BookingRoutes",
    "routes.ReviewRoutes",
    "routes.NotificationRoutes",
    "routes.DashboardRoutes",
    "routes.ContactRoutes",
    "fastapi.middleware.cors",
    "config.database",
]

for module in modules_to_check:
    try:
        print(f"Importing {module}...")
        __import__(module)
        print(f"✓ Successfully imported {module}")
    except ImportError as e:
        print(f"✗ Error importing {module}: {str(e)}")
        print("Traceback:")
        traceback.print_exc()
        print()

print("\n=== Trying to import main module ===")
try:
    import main
    print("✓ Successfully imported main module")
except Exception as e:
    print(f"✗ Error importing main: {type(e).__name__}: {str(e)}")
    print("Detailed traceback:")
    traceback.print_exc()

print("\n=== Creating test FastAPI app ===")
try:
    from fastapi import FastAPI
    app = FastAPI()
    print("✓ Successfully created FastAPI app")
except Exception as e:
    print(f"✗ Error creating FastAPI app: {type(e).__name__}: {str(e)}")
    print("Detailed traceback:")
    traceback.print_exc()

print("\n=== DEBUG COMPLETE ===") 