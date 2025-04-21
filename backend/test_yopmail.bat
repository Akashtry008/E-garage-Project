@echo off
echo ================================================================
echo                 E-GARAGE YOPMAIL EMAIL TEST
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

REM Get recipient email from user
set /p recipient_email=Enter recipient email address: 

echo.
echo Testing email configuration...
echo Sending test email to %recipient_email%...
echo.

REM Run the Python script with the recipient email
python test_yopmail.py %recipient_email%

if %ERRORLEVEL% EQU 0 (
    echo.
    echo Email test completed successfully!
    echo.
) else (
    echo.
    echo Email test failed!
    echo Please check the emails directory for the saved email content.
    echo.
)

pause