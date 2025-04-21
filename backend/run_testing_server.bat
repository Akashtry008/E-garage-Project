@echo off
echo ================================================================
echo      STARTING E-GARAGE SERVER IN TESTING MODE
echo ================================================================
echo.

set "ENV_FILE=.env.testing"

REM Copy the testing env file to .env
echo Copying %ENV_FILE% to .env...
copy /Y %ENV_FILE% .env

REM Run the server
echo Starting server in testing mode...
uvicorn main:app --reload --port 8000

REM Restore the original .env file
REM echo Restoring original .env file...
REM copy /Y .env.backup .env

echo.
echo Server stopped
pause 