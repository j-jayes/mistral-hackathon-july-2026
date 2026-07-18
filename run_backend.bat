@echo off
REM Run Backend Development Server
cd backend
echo Starting backend development server...
echo API will be available at http://localhost:8000
echo API Docs: http://localhost:8000/docs
echo.
uv uvicorn app.main:app --reload
pause