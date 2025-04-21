@echo off
setlocal enabledelayedexpansion

echo ================================================================
echo                 E-GARAGE EMAIL TESTING UTILITY
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
echo                 E-GARAGE EMAIL TESTING UTILITY
echo ================================================================
echo.
echo Please select an option:
echo.
echo 1. Basic Email Test (Yopmail)
echo 2. Advanced Email Test (with custom subject/content)
echo 3. Show Email Configuration
echo 4. View Previous Email Tests
echo 5. Exit
echo.
set /p choice=Enter your choice (1-5): 

if "%choice%"=="1" goto basic_test
if "%choice%"=="2" goto advanced_test
if "%choice%"=="3" goto show_config
if "%choice%"=="4" goto view_tests
if "%choice%"=="5" goto end

echo Invalid choice, please try again.
timeout /t 2 >nul
goto menu

:basic_test
cls
echo ================================================================
echo                  BASIC EMAIL TEST (YOPMAIL)
echo ================================================================
echo.
set /p recipient_email=Enter recipient email address: 
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

:advanced_test
cls
echo ================================================================
echo                     ADVANCED EMAIL TEST
echo ================================================================
echo.
set /p recipient_email=Enter recipient email address: 
set /p subject=Enter email subject (leave blank for default): 
echo.
echo Do you want to enter custom HTML content? (y/n)
set /p custom_content=
echo.

set "cmd_args=%recipient_email%"

if not "%subject%"=="" (
    set "cmd_args=!cmd_args! -s "%subject%""
)

if /i "%custom_content%"=="y" (
    echo Enter custom HTML content (end with a line containing only END):
    echo.
    
    set "content="
    :content_loop
    set /p line=
    if /i "%line%"=="END" goto content_done
    set "content=!content!!line!<br>"
    goto content_loop
    
    :content_done
    echo.
    set "cmd_args=!cmd_args! -c "!content!""
)

echo Running advanced email test...
echo python send_test_email.py !cmd_args!
python send_test_email.py !cmd_args!

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
    type "emails\%view_file%"
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
echo Thank you for using the E-Garage Email Testing Utility.
echo.
endlocal 