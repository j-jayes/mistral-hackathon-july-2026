@echo off
REM Setup Frontend Dependencies
REM This script helps install all frontend dependencies

cd frontend
echo Installing frontend dependencies...
npm install

if %ERRORLEVEL% NEQ 0 (
    echo Error: Failed to install frontend dependencies
    pause
    exit /b 1
)

echo Frontend dependencies installed successfully!
echo You can now run: npm run dev
pause