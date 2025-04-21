import os
import sys

def main():
    print("Current working directory:", os.getcwd())
    print("Python executable:", sys.executable)
    print("Python path:", sys.path)
    
    try:
        import uvicorn
        print("Successfully imported uvicorn")
    except ImportError as e:
        print(f"Failed to import uvicorn: {e}")
        return
        
    try:
        import main
        print("Successfully imported main module")
    except Exception as e:
        print(f"Error importing main module: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        return
    
    print("Starting server...")
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)

if __name__ == "__main__":
    main() 