# Velib Parking Guide 🚲

A beautiful web app for iPhone that helps you find the closest Velib dock with available parking spots in Paris.

![React](https://img.shields.io/badge/React-18-blue.svg) ![FastAPI](https://img.shields.io/badge/FastAPI-0.109-green.svg) ![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-purple.svg) ![Mistral](https://img.shields.io/badge/Mistral-AI-orange.svg)

## 🎯 Features

- **Real-time Compass Navigation**: Points you directly to the closest Velib station with available docks
- **Voice Input with Mistral Vox**: Speak your destination naturally in French or English
- **Smart Destination Extraction**: Uses Mistral LLM to understand your spoken destination
- **Beautiful UI with Tailwind CSS**: Modern, responsive design optimized for iPhone
- **Geolocation Integration**: Uses browser geolocation to track your position
- **Device Orientation**: Compass automatically adjusts based on your phone's orientation
- **Park Mode**: Toggle between navigating to station vs. navigating to your destination

## 📱 How It Works

1. **Speak your destination**: Tap the microphone button and say "I'm going to 21 rue des Gravilliers"
2. **Mistral LLM processes your input**: Extracts the destination address
3. **Find closest station**: App finds the nearest Velib station with available parking docks
4. **Compass points the way**: Follow the compass needle to reach the station
5. **Park your bike**: Tap the park button to switch the compass to point to your destination

## 🏗️ Tech Stack

### Frontend
- **React 18** - Modern component-based UI
- **TypeScript** - Type safety
- **Tailwind CSS** - Beautiful styling
- **Vite** - Fast development server
- **Lucide Icons** - Beautiful icons
- **React Hot Toast** - Notifications

### Backend
- **FastAPI** - High-performance Python API
- **Pydantic** - Data validation
- **HTTPX** - Async HTTP client
- **CacheTools** - Caching for performance

### AI Services
- **Mistral Vox** - Speech-to-text for voice input
- **Mistral LLM** - Natural language processing for destination extraction

## 🚀 Quick Start (Docker Compose)

The app runs as a **single container** — FastAPI serves both the API and the
built React SPA on one origin, exactly like the deployed Cloud Run image.

### Prerequisites

- Docker + Docker Compose
- Mistral API key (optional — voice/LLM fall back to limited mode without it)
- Google Geocoding API key (optional — address lookup falls back to Paris center without it)

### 1. Configure environment

```bash
cp .env.example .env
# edit .env and add MISTRAL_API_KEY (and GEOCODING_API_KEY for real address lookup)
```

Get a Mistral key at [console.mistral.ai](https://console.mistral.ai/); create a
Geocoding key (restricted to the Geocoding API) in the
[Google Cloud console](https://console.cloud.google.com/apis/credentials).

### 2. Run

```bash
docker compose up --build
```

### 3. Open the app

Navigate to **[http://localhost:8080](http://localhost:8080)**.
API docs are at [http://localhost:8080/docs](http://localhost:8080/docs).

> **iPhone testing:** the compass (device orientation) and reliable geolocation
> require **HTTPS**. The deployed Cloud Run URL is HTTPS; for local device
> testing, expose `http://localhost:8080` through a secure tunnel (e.g. ngrok).

## 📁 Project Structure

```
velib-parking-guide/
├── backend/                          # FastAPI Backend
│   ├── app/                         # Main application
│   │   └── main.py                  # FastAPI routes
│   ├── config/                      # Configuration
│   │   └── settings.py              # Environment settings
│   ├── models/                     # Pydantic models
│   │   ├── location.py             # Location model
│   │   ├── velib.py                # Velib station model
│   │   └── user.py                 # User input model
│   ├── services/                   # Business logic services
│   │   ├── llm_service.py          # Mistral LLM integration
│   │   ├── velib_service.py        # Velib station service
│   │   └── voice_service.py        # Mistral Vox integration
│   ├── requirements.txt            # Python dependencies
│   └── __init__.py
│
├── frontend/                        # React Frontend
│   ├── src/                        # Source code
│   │   ├── components/             # React components
│   │   │   ├── Compass.tsx         # Compass component
│   │   │   ├── DistanceDisplay.tsx # Distance display
│   │   │   ├── Header.tsx          # App header
│   │   │   ├── LoadingSpinner.tsx # Loading indicator
│   │   │   ├── SettingsButton.tsx # Settings button
│   │   │   ├── StationList.tsx    # Station list
│   │   │   ├── VoiceInputButton.tsx # Voice input button
│   │   │   └── ui/                # UI primitives
│   │   │       └── button.tsx     # Button component
│   │   ├── hooks/                  # React hooks
│   │   │   ├── useDeviceOrientation.ts # Device orientation
│   │   │   ├── useGeolocation.ts # Geolocation
│   │   │   └── useVoiceInput.ts   # Voice input
│   │   ├── lib/                    # Utility functions
│   │   │   └── utils.ts           # Helper functions
│   │   ├── pages/                  # Application pages
│   │   │   ├── HomePage.tsx       # Main page
│   │   │   └── SettingsPage.tsx  # Settings page
│   │   ├── api/                    # API client
│   │   │   └── client.ts          # API client
│   │   ├── types/                 # TypeScript types
│   │   │   └── index.ts           # Type definitions
│   │   ├── styles/                # CSS styles
│   │   │   └── globals.css        # Global styles
│   │   ├── App.tsx                # Main app component
│   │   └── main.tsx               # Entry point
│   ├── package.json              # npm dependencies
│   ├── tailwind.config.js         # Tailwind configuration
│   ├── tsconfig.json              # TypeScript configuration
│   └── vite.config.ts             # Vite configuration
│
├── .env.example                    # Environment variables template
├── .gitignore                      # Git ignore patterns
├── Dockerfile                      # Docker build file
├── docker-compose.yml              # Docker Compose configuration
└── README.md                       # Project documentation
```

## 🎨 Design

### Color Scheme
- **Primary**: Purple gradient (#667eea to #764ba2)
- **Text**: White with shadows for readability
- **Cards**: Semi-transparent white with blur
- **Accents**: Green for available docks, Red for recording

### UI Components
- **Compass**: Large, animated compass that points toward target
- **Distance Display**: Shows distance to target in meters/km
- **Voice Button**: Floating button with recording state animation
- **Station List**: Bottom sheet with nearby stations
- **Status Bar**: Shows current destination and navigation state

## 🔧 Configuration

### Environment Variables

#### Backend
```env
MISTRAL_API_KEY=your_api_key_here
MISTRAL_VOX_API_KEY=your_vox_key_here
DEBUG=true
BACKEND_HOST=localhost
BACKEND_PORT=8000
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

#### Frontend
```env
VITE_API_URL=http://localhost:8000
```

## 🚢 Deployment

Deployed on **Google Cloud Run** (project `velib-502812`, region `europe-west9`)
as a single HTTPS container. Cloud Run provides HTTPS automatically, which the
iOS compass/geolocation APIs require.

### Deploy via Cloud Build

`cloudbuild.yaml` builds the image, pushes it to Artifact Registry, and deploys
to Cloud Run (the deploy step runs server-side). Mistral and geocoding keys are
injected from Secret Manager.

```bash
gcloud builds submit --config cloudbuild.yaml .
```

The Cloud Run service URL is printed on completion. Secrets used:
`mistral-api-key`, `mistral-vox-api-key`, `geocoding-api-key`.

### Run the production image locally

```bash
docker compose up --build   # http://localhost:8080
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 📊 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/stations` | Get nearby stations |
| GET | `/api/stations/closest` | Get closest station |
| GET | `/api/stations/{id}` | Get specific station |
| POST | `/api/stations/refresh` | Refresh station cache |
| POST | `/api/nlp/extract-destination` | Extract destination from text |
| POST | `/api/voice/transcribe` | Transcribe audio |
| POST | `/api/voice/process` | Process voice input |

## 💡 Tips for Best Experience

1. **Enable Location Permissions**: Required for geolocation
2. **Enable Microphone**: Required for voice input
3. **Use Headphones**: Better voice recognition in noisy environments
4. **Hold Phone Flat**: Better compass accuracy
5. **Speak Clearly**: For best voice recognition results

## 🌍 Supported Languages

- **Voice Input**: French (fr), English (en), Spanish (es), German (de), Italian (it)
- **Destination Extraction**: Works best with French addresses in Paris

## 🤖 AI Features

### Mistral Vox Integration
- Real-time speech-to-text
- Multi-language support
- High accuracy for French

### Mistral LLM Integration
- Natural language understanding
- Destination extraction from complex queries
- Pattern matching fallback

## 📱 iPhone Optimization

- **Fullscreen**: Uses safe area insets for notch
- **Touch Targets**: Large buttons for easy tapping
- **Orientation**: Supports both portrait and landscape
- **No Scroll**: Fixed layout to prevent accidental scrolling
- **Compass**: Uses device orientation for accurate navigation

## 🛠️ Development

### Code Generation
```bash
# Generate API client from OpenAPI spec
cd frontend
npm run codegen
```

## 📜 License

MIT License - Feel free to use, modify, and distribute.

## 🙏 Acknowledgments

- [Mistral AI](https://mistral.ai/) - For providing the LLM and Vox APIs
- [Vite](https://vitejs.dev/) - For the fast development server
- [Tailwind CSS](https://tailwindcss.com/) - For the beautiful styling
- [FastAPI](https://fastapi.tiangolo.com/) - For the easy-to-use backend framework
- [Velib Métropole](https://www.velib-metropole.fr/) - For the bike sharing service in Paris

---

**Built with ❤️ using React, FastAPI, Tailwind CSS, and Mistral AI**

*Perfect for navigating Paris by Velib!* 🚲💨