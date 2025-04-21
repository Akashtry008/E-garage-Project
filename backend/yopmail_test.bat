@echo off
setlocal enabledelayedexpansion

echo ================================================================
echo                 E-GARAGE YOPMAIL EMAIL TESTER
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

REM Check if required Python scripts exist
if not exist test_yopmail.py (
    echo ERROR: test_yopmail.py not found in the current directory
    echo Please make sure you're running this batch file from the backend directory
    pause
    exit /b 1
)

if not exist send_test_email.py (
    echo ERROR: send_test_email.py not found in the current directory
    echo Please make sure you're running this batch file from the backend directory
    pause
    exit /b 1
)

REM Check if .env file exists
if not exist .env (
    echo WARNING: No .env file found in the current directory.
    echo Email configuration may not be properly set.
    echo.
)

REM Check if emails directory exists, create if not
if not exist emails (
    echo Creating emails directory for saving email logs...
    mkdir emails
)

:menu
cls
echo ================================================================
echo                 E-GARAGE YOPMAIL EMAIL TESTER
echo ================================================================
echo.
echo Please select a test option:
echo.
echo 1. Basic Yopmail Test (Simple test email)
echo 2. Password Reset Email Test
echo 3. Account Verification Email Test
echo 4. Booking Confirmation Email Test
echo 5. View Email Configuration
echo 6. View Previous Email Tests
echo 7. Exit
echo.
set /p choice=Enter your choice (1-7): 

if "%choice%"=="1" goto basic_test
if "%choice%"=="2" goto password_reset_test
if "%choice%"=="3" goto verification_test
if "%choice%"=="4" goto booking_test
if "%choice%"=="5" goto show_config
if "%choice%"=="6" goto view_tests
if "%choice%"=="7" goto end

echo Invalid choice, please try again.
timeout /t 2 >nul
goto menu

:basic_test
cls
echo ================================================================
echo                  BASIC YOPMAIL TEST
echo ================================================================
echo.
set /p recipient_email=Enter recipient email address (e.g. test@yopmail.com): 
echo.
echo Testing email configuration...
echo Sending test email to %recipient_email%...
echo.

REM Run the Python script with the recipient email
python test_yopmail.py %recipient_email%

echo.
echo Press any key to return to the main menu...
pause >nul
goto menu

:password_reset_test
cls
echo ================================================================
echo               PASSWORD RESET EMAIL TEST
echo ================================================================
echo.
set /p recipient_email=Enter recipient email address (e.g. test@yopmail.com): 
echo.

set "reset_token=SAMPLE_RESET_TOKEN_123456789"
set "reset_link=http://localhost:3000/reset-password?token=%reset_token%"

set "subject=Password Reset Request"
set "content=<html><body><h1>Password Reset Request</h1><p>You requested a password reset for your E-Garage account.</p><p>Click the link below to reset your password:</p><p><a href='%reset_link%'>Reset Password</a></p><p>This link will expire in 24 hours.</p><p>If you did not request a password reset, please ignore this email or contact support if you have concerns.</p><hr><p><small>This is a test email from the E-Garage system.</small></p></body></html>"

echo Sending password reset test email to %recipient_email%...
echo.

python send_test_email.py %recipient_email% -s "%subject%" -c "%content%"

echo.
echo Press any key to return to the main menu...
pause >nul
goto menu

:verification_test
cls
echo ================================================================
echo               ACCOUNT VERIFICATION EMAIL TEST
echo ================================================================
echo.
set /p recipient_email=Enter recipient email address (e.g. test@yopmail.com): 
echo.

set "verify_token=SAMPLE_VERIFICATION_TOKEN_123456789"
set "verify_link=http://localhost:3000/verify-email?token=%verify_token%"

set "subject=Email Verification - E-Garage"
set "content=<html><body><h1>Verify Your Email Address</h1><p>Thank you for registering with E-Garage!</p><p>Please verify your email address by clicking the link below:</p><p><a href='%verify_link%'>Verify Email Address</a></p><p>This link will expire in 24 hours.</p><p>If you did not create an account with us, please ignore this email.</p><hr><p><small>This is a test email from the E-Garage system.</small></p></body></html>"

echo Sending verification test email to %recipient_email%...
echo.

python send_test_email.py %recipient_email% -s "%subject%" -c "%content%"

echo.
echo Press any key to return to the main menu...
pause >nul
goto menu

:booking_test
cls
echo ================================================================
echo               BOOKING CONFIRMATION EMAIL TEST
echo ================================================================
echo.
set /p recipient_email=Enter recipient email address (e.g. test@yopmail.com): 
echo.

set "booking_id=BOK123456"
set "service=Engine Tune-up"
set "booking_date=May 15, 2024"
set "booking_time=10:00 AM"
set "provider=AutoCare Service Center"
set "booking_link=http://localhost:3000/my-bookings/%booking_id%"

set "subject=Booking Confirmation - E-Garage"
set "content=<html><body><h1>Booking Confirmation</h1><p>Your appointment has been confirmed!</p><table border='0' cellpadding='5'><tr><td><strong>Booking ID:</strong></td><td>%booking_id%</td></tr><tr><td><strong>Service:</strong></td><td>%service%</td></tr><tr><td><strong>Date:</strong></td><td>%booking_date%</td></tr><tr><td><strong>Time:</strong></td><td>%booking_time%</td></tr><tr><td><strong>Service Provider:</strong></td><td>%provider%</td></tr></table><p>You can view or manage your booking by <a href='%booking_link%'>clicking here</a>.</p><p>Thank you for using E-Garage!</p><hr><p><small>This is a test email from the E-Garage system.</small></p></body></html>"

echo Sending booking confirmation test email to %recipient_email%...
echo.

python send_test_email.py %recipient_email% -s "%subject%" -c "%content%"

echo.
echo Press any key to return to the main menu...
pause >nul
goto menu

:show_config
cls
echo ================================================================
echo                     EMAIL CONFIGURATION
echo ================================================================
echo.

for /f "tokens=1,* delims==" %%a in (.env) do (
    if "%%a"=="EMAIL_HOST" echo Email Host: %%b
    if "%%a"=="EMAIL_PORT" echo Email Port: %%b
    if "%%a"=="EMAIL_HOST_USER" echo Email User: %%b
    if "%%a"=="EMAIL_USE_TLS" echo TLS Enabled: %%b
    if "%%a"=="LOG_EMAILS" echo Log Emails: %%b
    if "%%a"=="SEND_REAL_EMAILS" echo Send Real Emails: %%b
)

echo.
echo Current Yopmail settings:
python -c "import os; from dotenv import load_dotenv; load_dotenv(); print(f'Email Host: {os.getenv(\"EMAIL_HOST\", \"Not set\")}'); print(f'Email Port: {os.getenv(\"EMAIL_PORT\", \"Not set\")}'); print(f'Email User: {os.getenv(\"EMAIL_HOST_USER\", \"Not set\")}'); print(f'Send Real Emails: {os.getenv(\"SEND_REAL_EMAILS\", \"False\")}')"

echo.
echo Note: Emails are saved to the 'emails' directory regardless of sending success
echo.
echo Press any key to return to the main menu...
pause >nul
goto menu

:view_tests
cls
echo ================================================================
echo                     PREVIOUS EMAIL TESTS
echo ================================================================
echo.

if not exist emails\*.html (
    echo No email tests found.
    echo.
    echo Press any key to return to the main menu...
    pause >nul
    goto menu
)

echo Listing previous email tests:
echo.
dir /b /o-d emails\*.html

echo.
set /p view_file=Enter filename to view (or press Enter to go back): 

if "%view_file%"=="" goto menu

if exist "emails\%view_file%" (
    echo.
    echo --------------------------------
    type "emails\%view_file%" | more
    echo --------------------------------
    echo.
) else (
    echo File not found: %view_file%
)

echo.
echo Press any key to return to the main menu...
pause >nul
goto menu

:end
echo.
echo Thank you for using the E-Garage Yopmail Email Tester.
echo.
endlocal 