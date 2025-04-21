"""
Test script to debug the FastAPI app
"""

import os
import sys
import traceback
import logging

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

print(f"Python version: {sys.version}")
print(f"Current directory: {os.getcwd()}")
print(f"Python path: {sys.path}")

try:
    print("\nTrying to import FastAPI app...")
    import main
    print("✅ Successfully imported main module!")
    
    print("\nTrying to access FastAPI app...")
    app = main.app
    print(f"✅ Successfully accessed app: {app}")
    
    print("\nApp routes:")
    for route in app.routes:
        print(f"- {route.path}: {route.name}")
        
    print("\nMiddleware:")
    for middleware in app.middleware:
        print(f"- {middleware}")
    
    print("\nDependencies:")
    print(f"- {app.dependency_overrides}")
    
except Exception as e:
    print(f"❌ Error: {type(e).__name__}: {str(e)}")
    print("\nDetailed traceback:")
    traceback.print_exc()

print("\nTest complete.") 