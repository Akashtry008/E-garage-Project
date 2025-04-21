@echo off
echo ================================================================
echo          REMOVE EMAIL FUNCTIONALITY FROM E-GARAGE
echo ================================================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python and try again
    pause
    exit /b 1
)

echo This script will remove email sending functionality from the application.
echo Instead of sending emails, all messages will be saved as HTML files.
echo.
echo Press any key to continue or Ctrl+C to cancel...
pause >nul

echo.
echo Running script to remove email functionality...
python remove_email_functionality.py

if %ERRORLEVEL% EQU 0 (
    echo.
    echo Email functionality has been successfully removed.
    echo All emails will now be saved as HTML files in the emails directory.
    echo.
) else (
    echo.
    echo There was an error removing the email functionality.
    echo Please check the output for details.
    echo.
)

pause 