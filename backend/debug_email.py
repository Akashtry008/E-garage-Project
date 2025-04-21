#!/usr/bin/env python3
"""
Debug script to test email functionality.
This checks if the emails directory exists and if email files can be created.
"""

import os
import sys
import time
import logging
from pathlib import Path

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def test_email_directories():
    """Test if the emails directories can be created and written to."""
    logger.info("Testing email directories...")
    
    # Check current working directory
    cwd = os.getcwd()
    logger.info(f"Current working directory: {cwd}")
    
    # Check if emails directory exists in current directory
    local_emails_dir = Path("emails")
    if local_emails_dir.exists():
        logger.info(f"Local emails directory exists: {local_emails_dir.absolute()}")
    else:
        logger.info(f"Local emails directory doesn't exist. Trying to create it.")
        try:
            local_emails_dir.mkdir(exist_ok=True, parents=True)
            logger.info(f"Successfully created {local_emails_dir.absolute()}")
        except Exception as e:
            logger.error(f"Failed to create local emails directory: {str(e)}")
    
    # Check if emails directory exists in backend directory
    backend_emails_dir = Path("backend/emails")
    if backend_emails_dir.exists():
        logger.info(f"Backend emails directory exists: {backend_emails_dir.absolute()}")
    else:
        logger.info(f"Backend emails directory doesn't exist. Trying to create it.")
        try:
            backend_emails_dir.mkdir(exist_ok=True, parents=True)
            logger.info(f"Successfully created {backend_emails_dir.absolute()}")
        except Exception as e:
            logger.error(f"Failed to create backend emails directory: {str(e)}")
    
    # Try writing to both directories
    test_write_to_directory(local_emails_dir)
    test_write_to_directory(backend_emails_dir)

def test_write_to_directory(directory):
    """Test if we can write to the specified directory."""
    if not directory.exists():
        logger.error(f"Directory {directory} doesn't exist, can't write test file.")
        return
    
    test_file = directory / f"test_email_{time.strftime('%Y%m%d_%H%M%S')}.html"
    try:
        with open(test_file, 'w', encoding='utf-8') as f:
            f.write("Test content\n")
            f.write(f"Created at: {time.strftime('%Y-%m-%d %H:%M:%S')}")
        
        logger.info(f"Successfully wrote test file to {test_file}")
        
        # Verify file exists
        if test_file.exists():
            logger.info(f"Test file exists: {test_file}")
        else:
            logger.error(f"Test file doesn't exist after writing: {test_file}")
    except Exception as e:
        logger.error(f"Failed to write test file to {directory}: {str(e)}")

def main():
    """Main function."""
    logger.info("Starting email debug script...")
    test_email_directories()
    logger.info("Email debug script completed.")

if __name__ == "__main__":
    main() 