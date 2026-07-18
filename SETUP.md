# Setup Guide for Velib Parking Guide

This guide will help you get the development environment running quickly.

## Quick Start

### 1. Install System Dependencies

#### Windows
```cmd
:: Make sure you have these installed:
node --version    (should be v18+)
npm --version     (should be v8+)
python --version  (should be v3.11+)
uv --version      (should be v0.11+)
```

If you don't have Node.js, download from: https://nodejs.org/
If you don't have Python, download from: https://python.org/
If you don't have uv, install with: `pip install uv`

### 2. Setup Frontend (React + Vite)

```cmd
cd frontend
npm install
```

This installs all frontend dependencies including:
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Axios
- Lucide Icons
- React Router
- React Hot Toast

**Troubleshooting:**
- If you get `vite not recognized`, make sure you're in the `frontend` directory
- If you get permission errors, try running as administrator
- If it's slow, it's normal - this installs ~500+ packages

### 3. Setup Backend (FastAPI with uv)

```cmd
cd backend
uv pip install -r requirements.txt
```

This installs Python dependencies:
- FastAPI
- Uvicorn
- HTTPX
- CacheTools
- Pydantic

**Troubleshooting:**
- If `uv` is not found, install with: `pip install uv`
- If you prefer pip: `pip install -r requirements.txt`

### 4. Set Up Environment Variables

Create `.env` files:

**Root directory (.env):**
```env
# Mistral API Configuration
MISTRAL_API_KEY=your_mistral_api_key_here
MISTRAL_VOX_API_KEY=your_mistral_vox_api_key_here

# Backend Configuration
BACKEND_HOST=localhost
BACKEND_PORT=8000
FRONTEND_URL=http://localhost:3000

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# Cache Configuration (in minutes)
STATION_CACHE_MINUTES=5
```

**Frontend directory (frontend/.env):**
```env
VITE_API_URL=http://localhost:8000
VITE_APP_NAME="Velib Parking Guide"
VITE_DEBUG=true
```

Get your Mistral API keys from: https://console.mistral.ai/

### 5. Run the Application

Open **two** terminal windows:

**Terminal 1 - Backend:**
```cmd
cd backend
uv uvicorn app.main:app --reload
```
Backend runs at: http://localhost:8000
API Docs: http://localhost:8000/docs

**Terminal 2 - Frontend:**
```cmd
cd frontend
npm run dev
```
Frontend runs at: http://localhost:3000

## Alternative Setup Methods

### Using npm scripts (from root directory)

```cmd
:: Install root dependencies (concurrently)
npm install

:: Setup everything
npm run setup:all

:: Start both frontend and backend
npm run dev:all
```

Note: `npm run dev:all` requires `concurrently` package (already installed)

### Using pip for backend (instead of uv)

```cmd
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
pip install uvicorn
uvicorn app.main:app --reload
```

### Using Docker

```cmd
docker-compose build
docker-compose up
```

App will be available at: http://localhost:8000

## Common Issues & Solutions

### Issue: 'vite' is not recognized

**Solution:**
```cmd
cd frontend
npm install
```

Make sure you're in the `frontend` directory and have run `npm install`.

### Issue: 'uv' is not recognized

**Solution:**
```cmd
pip install uv
```

### Issue: Port already in use

**Solution:**
```cmd
:: Find which process is using the port
netstat -ano | findstr :3000
netstat -ano | findstr :8000

:: Kill the process (replace PID with actual process ID)
taskkill /PID 1234 /F
```

### Issue: CORS errors

**Solution:** Make sure your `.env` file has the correct origins:
```env
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

### Issue: Node.js version too old

**Solution:** Download latest Node.js from https://nodejs.org/

## Project Structure

```
velib-parking-guide/
├── backend/                          # FastAPI Backend
│   ├── app/
│   │   └── main.py                  # API routes
│   ├── config/
│   │   └── settings.py              # Configuration
│   ├── models/
│   │   ├── location.py
│   │   ├── velib.py
│   │   └── user.py
│   ├── services/
│   │   ├── llm_service.py
│   │   ├── velib_service.py
│   │   └── voice_service.py
│   └── requirements.txt
│
├── frontend/                        # React Frontend
│   ├── src/
│   │   ├── components/
│   │   ├── lib/
│   │   │   ├── utils.ts
│   │   │   ├── stationCache.ts      # NEW: IndexedDB caching
│   │   │   └── geocoding.ts         # NEW: Address geocoding
│   │   ├── data/
│   │   │   └── velibStations.json   # NEW: Pre-bundled stations
│   │   ├── pages/
│   │   ├── App.tsx                 # UPDATED: Main app logic
│   │   └── main.tsx
│   └── package.json
│
├── .env                            # Environment variables
├── .env.example
├── package.json                    # NEW: Root package.json
├── SETUP.md                       # This file
└── README.md
```

## Verification

Once everything is running:

1. ✅ Backend: http://localhost:8000 should show API info
2. ✅ API Docs: http://localhost:8000/docs should show Swagger UI
3. ✅ Frontend: http://localhost:3000 should show the app
4. ✅ App loads 20 Paris stations from pre-bundled data
5. ✅ Compass works with device orientation
6. ✅ Geolocation asks for permission
7. ✅ Voice input available (microphone permission needed)

## Support

If you're still having issues, please provide:
- Your operating system (Windows/macOS/Linux)
- Node.js version (`node --version`)
- npm version (`npm --version`)
- Python version (`python --version`)
- uv version (`uv --version`)
- The exact error message you're seeing

This will help diagnose and solve your specific issue.