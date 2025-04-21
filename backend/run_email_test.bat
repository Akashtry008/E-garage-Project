@echo off
echo ===================================================
echo              E-GARAGE EMAIL TEST TOOL              
echo ===================================================
echo.
echo This tool will test your email configuration by sending a test email.
echo Make sure you have correctly set up your .env file with proper SMTP settings.
echo.

REM Check if Python is available
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python is not installed or not in PATH.
    echo Please install Python and try again.
    exit /b 1
)

echo Please enter the recipient email address (where to send the test email):
set /p recipient_email="> "

echo.
echo Sending test email to %recipient_email%...
echo (Check the console output for errors if the email is not received)
echo.

REM Run the test email script
python test_email.py %recipient_email%

echo.
echo If the test was successful, check your inbox and spam folder.
echo If you're having issues, please check your .env file and ensure your email/password are correct.
echo.
pause 