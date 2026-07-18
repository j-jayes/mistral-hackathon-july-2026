@echo off
REM Setup Backend Dependencies with uv
REM This script helps install all backend dependencies

cd backend
echo Installing backend dependencies with uv...
uv pip install -r requirements.txt

if %ERRORLEVEL% NEQ 0 (
    echo Error: Failed to install backend dependencies with uv
    echo Trying with pip instead...
    python -m venv .venv
    call .venv\Scripts\activate
    pip install -r requirements.txt
    echo Backend dependencies installed successfully with pip!
) else (
    echo Backend dependencies installed successfully with uv!
)

echo You can now run: uv uvicorn app.main:app --reload
pause