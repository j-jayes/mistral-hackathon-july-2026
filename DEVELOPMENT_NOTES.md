# Development Notes - Velib Parking Guide

## Project Overview

I've completely restructured your Velib Parking Guide project based on your new requirements. The project now uses:

- **React 18** with **TypeScript** for the frontend
- **Tailwind CSS** for beautiful, modern styling
- **FastAPI** for a high-performance backend
- **Mistral Vox** for voice-to-text
- **Mistral LLM** for natural language processing

## What Was Created

### Backend (FastAPI)

#### Structure
```
backend/
├── app/
│   └── main.py              # Main FastAPI application with all routes
├── config/
│   ├── __init__.py
│   └── settings.py          # Environment configuration (Pydantic Settings)
├── models/
│   ├── __init__.py
│   ├── location.py         # Location model with distance/bearing calculations
│   ├── user.py             # User input, voice input, destination models
│   └── velib.py            # Velib station models
├── services/
│   ├── __init__.py
│   ├── llm_service.py      # Mistral LLM integration for destination extraction
│   ├── velib_service.py    # Velib station data management with caching
│   └── voice_service.py    # Mistral Vox integration for voice input
├── tests/
└── requirements.txt
```

#### Key Features
- **RESTful API** with proper error handling
- **CORS support** for frontend-backend communication
- **Caching** for station data to reduce API calls
- **Async/await** for non-blocking operations
- **Mistral API integration** with fallback to pattern matching
- **Health check endpoint** for monitoring

#### API Endpoints
- `GET /api/health` - Health check
- `GET /api/stations` - Get nearby stations with available docks
- `GET /api/stations/closest` - Get closest station
- `GET /api/stations/{id}` - Get specific station
- `POST /api/stations/refresh` - Refresh cache
- `POST /api/nlp/extract-destination` - Extract destination from text
- `POST /api/voice/transcribe` - Transcribe audio
- `POST /api/voice/process` - Process voice input (transcribe + extract)
- `GET /api/voice/languages` - Get supported languages
- `GET /api/location/geocode` - Geocode address (mock implementation)

### Frontend (React + TypeScript + Tailwind)

#### Structure
```
frontend/
├── public/
├── src/
│   ├── api/
│   │   └── client.ts              # API client with axios
│   ├── components/
│   │   ├── Compass.tsx           # Animated compass component
│   │   ├── DistanceDisplay.tsx   # Shows distance to target
│   │   ├── Header.tsx            # App header
│   │   ├── LoadingSpinner.tsx   # Loading indicator
│   │   ├── SettingsButton.tsx   # Settings button
│   │   ├── StationList.tsx       # List of nearby stations
│   │   ├── VoiceInputButton.tsx  # Voice input button
│   │   └── ui/
│   │       └── button.tsx       # Custom button component
│   ├── hooks/
│   │   ├── useDeviceOrientation.ts # Device orientation hook
│   │   ├── useGeolocation.ts     # Geolocation hook
│   │   └── useVoiceInput.ts       # Voice input hook
│   ├── lib/
│   │   └── utils.ts               # Utility functions
│   ├── pages/
│   │   ├── HomePage.tsx         # Main application page
│   │   └── SettingsPage.tsx     # Settings page
│   ├── styles/
│   │   └── globals.css           # Global Tailwind styles + custom CSS
│   ├── types/
│   │   └── index.ts               # TypeScript interfaces
│   ├── App.tsx                    # Main app component
│   └── main.tsx                   # Entry point
├── package.json
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
└── postcss.config.js
```

#### Key Features
- **Modern React** with hooks and TypeScript
- **Beautiful Tailwind CSS** styling with custom theme
- **Responsive design** optimized for iPhone
- **iOS-specific optimizations** (safe areas, no overscroll)
- **Real-time compass** that points to target
- **Voice input** with recording state animation
- **Station list** with bottom sheet
- **Geolocation** integration
- **Device orientation** for compass heading

### Configuration Files

#### `.env.example` (Project Root)
Contains environment variables template for both backend and frontend.

#### `.env.example` (Frontend)
Frontend-specific environment variables.

#### `Dockerfile`
Multi-stage Docker build for both frontend and backend.

#### `docker-compose.yml`
Docker Compose configuration for easy development and deployment.

## How to Use

### Quick Start

1. **Create environment files**:
   ```bash
   cp .env.example .env
   cp frontend/.env.example frontend/.env
   ```

2. **Add your Mistral API keys** to `.env`:
   ```
   MISTRAL_API_KEY=your_key_here
   MISTRAL_VOX_API_KEY=your_vox_key_here
   ```

3. **Start the backend**:
   ```bash
   cd backend
   python -m venv .venv
   .venv\Scripts\activate  # Windows
   pip install -r requirements.txt
   uvicorn app.main:app --reload
   ```

4. **Start the frontend** (in a new terminal):
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

5. **Access the app**: Open `http://localhost:3000`

### Docker Deployment

```bash
# Build and start all services
docker-compose up --build

# For development (with hot reload)
docker-compose --profile development up
```

## Technical Details

### Compass Algorithm
The compass uses:
1. **Geolocation API** to get user's current position
2. **DeviceOrientation API** to get phone's heading (compass direction)
3. **Haversine formula** to calculate distance between coordinates
4. **Bearing calculation** to determine direction from user to target
5. **Relative direction** calculation based on device heading

### Voice Input Flow
1. User taps microphone button
2. Browser requests microphone permission
3. Audio is recorded using MediaRecorder API
4. Audio is sent to backend
5. Backend uses Mistral Vox for transcription
6. Transcribed text is processed by Mistral LLM
7. Destination is extracted and returned to frontend
8. Frontend finds closest station to destination
9. Compass points to the station

### Station Data
- Uses **mock data** for development (5 stations in central Paris)
- In production, can connect to official **Velib API**
- Data is **cached** for 5 minutes to reduce API calls
- Stations are filtered to only show those with **available docks**

### Fallback Mechanisms
- If Mistral API keys are not configured, falls back to **pattern matching**
- If voice input fails, shows appropriate error messages
- If geolocation is denied, shows error and instructions
- All features work without API keys (with limited functionality)

## File Count Summary

### Backend Files Created
- `backend/app/main.py` - FastAPI application
- `backend/config/settings.py` - Configuration
- `backend/models/location.py` - Location model
- `backend/models/user.py` - User input models
- `backend/models/velib.py` - Velib station models
- `backend/services/llm_service.py` - LLM service
- `backend/services/velib_service.py` - Velib service
- `backend/services/voice_service.py` - Voice service
- `backend/requirements.txt` - Dependencies

### Frontend Files Created
- `frontend/src/App.tsx` - Main app
- `frontend/src/main.tsx` - Entry point
- `frontend/src/pages/HomePage.tsx` - Home page
- `frontend/src/pages/SettingsPage.tsx` - Settings page
- `frontend/src/components/Compass.tsx` - Compass component
- `frontend/src/components/DistanceDisplay.tsx` - Distance display
- `frontend/src/components/VoiceInputButton.tsx` - Voice button
- `frontend/src/components/Header.tsx` - Header
- `frontend/src/components/LoadingSpinner.tsx` - Spinner
- `frontend/src/components/SettingsButton.tsx` - Settings button
- `frontend/src/components/StationList.tsx` - Station list
- `frontend/src/components/ui/button.tsx` - UI button
- `frontend/src/hooks/useGeolocation.ts` - Geolocation hook
- `frontend/src/hooks/useDeviceOrientation.ts` - Orientation hook
- `frontend/src/hooks/useVoiceInput.ts` - Voice input hook
- `frontend/src/lib/utils.ts` - Utility functions
- `frontend/src/types/index.ts` - TypeScript types
- `frontend/src/api/client.ts` - API client
- `frontend/src/styles/globals.css` - Global styles
- `frontend/package.json` - Dependencies
- `frontend/tailwind.config.js` - Tailwind config
- `frontend/tsconfig.json` - TypeScript config
- `frontend/vite.config.ts` - Vite config
- `frontend/postcss.config.js` - PostCSS config
- `frontend/index.html` - HTML template

### Configuration Files
- `.env.example` - Environment template
- `frontend/.env.example` - Frontend environment template
- `Dockerfile` - Docker build
- `docker-compose.yml` - Docker Compose
- `.gitignore` - Git ignore
- `frontend/.gitignore` - Frontend git ignore

## Next Steps

### For Production
1. Add **real Velib API** integration in `backend/services/velib_service.py`
2. Add **real geocoding API** (like OpenCage or Nominatim)
3. Add **error tracking** (Sentry, etc.)
4. Add **analytics** for usage tracking
5. Add **rate limiting** to prevent API abuse
6. Add **authentication** if needed

### For Enhanced Features
1. Add **map view** alongside compass
2. Add **station details** page
3. Add **favorites** for saved destinations
4. Add **history** of recent destinations
5. Add **offline mode** with cached station data
6. Add **PWA support** for installable app

### For Improved UX
1. Add **vibration feedback** on voice input
2. Add **sound effects** for recording state
3. Add **haptic feedback** on button presses
4. Add **animations** for smooth transitions
5. Add **tutorial** for first-time users
6. Add **accessibility** improvements

## Notes on Mistral API Integration

The current implementation has **fallback mechanisms** that work without API keys:

1. **LLM Service**: Falls back to regex pattern matching for destination extraction
2. **Voice Service**: Falls back to simulated transcription
3. **Velib Service**: Uses mock data for development

This means you can **test the entire app without any API keys**. When you add your Mistral keys, the app will automatically use the real APIs.

## Testing the App

Even without Mistral API keys, you can test:
- ✅ Compass navigation (uses geolocation and device orientation)
- ✅ Voice input button (will simulate transcription)
- ✅ Station list (shows mock stations)
- ✅ Distance calculation (between mock locations)
- ✅ Park/Unpark toggle
- ✅ Settings page

With Mistral API keys, you get:
- ✅ Real voice-to-text transcription
- ✅ Real destination extraction using LLM
- ✅ More accurate results

## iPhone Optimization

The app is specifically optimized for iPhone:
- **Safe Area Support**: Properly handles iPhone notch and bottom bar
- **No Overscroll**: Prevents the bounce effect on iOS
- **Touch Targets**: Large buttons (44x44pt minimum)
- **Compass Accuracy**: Uses DeviceOrientation API which works well on iOS
- **Geolocation**: Uses high-accuracy GPS when available
- **Fullscreen**: Uses 100% viewport height
- **iOS Icons**: Uses SF Symbol-style icons where appropriate

## Conclusion

The app is now a **modern, full-stack web application** with:
- Beautiful React + Tailwind frontend
- Fast FastAPI backend
- Mistral AI integration
- Complete iPhone optimization
- Docker deployment support
- Fallback mechanisms for demo/testing

Everything is ready for you to **copy your Mistral API keys into `.env`** and start using the app!

---

**Happy coding!** 🚀

For any questions or issues, the code is well-commented and follows modern best practices for React, FastAPI, and TypeScript.