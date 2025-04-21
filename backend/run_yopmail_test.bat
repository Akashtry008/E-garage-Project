@echo off
title E-GARAGE YOPMAIL EMAIL TEST
echo.
echo ======================================
echo E-GARAGE YOPMAIL EMAIL TEST
echo ======================================
echo.

:: Check if Python is installed
python --version > nul 2>&1
if %errorlevel% neq 0 (
  echo Error: Python is not installed or not in PATH.
  echo Please install Python and try again.
  goto :end
)

:: Check if requests library is installed
python -c "import requests" > nul 2>&1
if %errorlevel% neq 0 (
  echo Installing required Python packages...
  pip install requests
)

:: Prompt for recipient email
set /p recipient_email="Enter recipient email address: "

echo.
echo Running yopmail email test...
echo.

:: Run the test script with the provided email
python yopmail_test.py %recipient_email%

if %errorlevel% equ 0 (
  echo.
  echo Test completed successfully!
) else (
  echo.
  echo Test failed. Please check the logs and the emails directory.
)

:end
echo.
echo Press any key to exit...
pause > nul 