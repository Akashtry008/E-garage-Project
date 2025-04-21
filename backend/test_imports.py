print("Starting import test...")
try:
    print("Current directory:", __file__)
    import sys
    print("Python path:", sys.path)
    print("Attempting to import main...")
    import main
    print("Successfully imported main module!")
except Exception as e:
    print(f"Error importing main: {type(e).__name__}: {str(e)}")
    import traceback
    print("Detailed traceback:")
    traceback.print_exc() 