# Velib Parking Guide 🚲

A phone compass for the **last few minutes** of a Paris bike trip.

![React](https://img.shields.io/badge/React-18-blue.svg) ![FastAPI](https://img.shields.io/badge/FastAPI-0.109-green.svg) ![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-purple.svg) ![Mistral](https://img.shields.io/badge/Mistral-AI-orange.svg)

## 🧭 The problem

When you unlock a Vélib, you already know where you're going — you don't route from your front door. The riding is easy.

The part no app answers is the **last few minutes**. Google Maps and the Vélib app both assume you're on foot from the start and plan the whole route before you move: walk to a station, ride, park, walk to the door. Neither tells you, in the moment, the two things you actually need near your destination:

1. Which dock has a **free spot right now**?
2. Once you've locked the bike, **which way do you walk**?

This app skips the plan. By default the compass points to the nearest free dock. Say your destination and, once you park, the needle turns to point at the door.

## 🎯 Features

- **Compass to the nearest free dock**: Points straight at the closest station with an open dock — no route, just a bearing
- **Park mode**: Tap "Parked" and the needle flips from the dock to your final destination
- **Voice input with Mistral Vox**: Speak your destination naturally in French or English
- **Smart destination extraction**: A Mistral LLM pulls the address out of what you said and geocodes it
- **Live Vélib availability**: Dock counts come from the Paris open-data real-time feed
- **On-device math**: Distance, bearing, and nearest-dock selection all run in the browser — the only call that leaves the phone is the address
- **True-north iOS compass**: Uses `webkitCompassHeading` behind a user-gesture permission tap

## 📱 How It Works

1. **Open the app**: The compass immediately points to the nearest dock with a free spot near you
2. **Give it a destination** (optional): Speak it ("I'm going to 21 rue des Gravilliers"), type it, or hit demo
3. **Mistral transcribes and extracts**: Mistral Vox turns speech to text; a Mistral LLM pulls out the address, which is geocoded to `lat, lng`
4. **Ride, following the needle**: The compass points at the nearest free dock the whole way
5. **Park your bike**: Tap "Parked" and the compass switches to point at your actual destination for the final walk

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

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ (for frontend)
- Python 3.11+ (for backend)
- Mistral API keys (optional - has fallback mode)

### 1. Clone the Repository

```bash
git clone https://github.com/your-repo/velib-parking-guide.git
cd velib-parking-guide
```

### 2. Setup Environment Variables

Create `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` and add your Mistral API keys:

```env
# Backend Configuration
MISTRAL_API_KEY=your_mistral_api_key_here
MISTRAL_VOX_API_KEY=your_mistral_vox_api_key_here

# Frontend Configuration  
VITE_API_URL=http://localhost:8000
```

Get your API keys from: [https://console.mistral.ai/](https://console.mistral.ai/)

### 3. Setup Backend

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv .venv

# Activate virtual environment
# On Windows:
.venv\Scripts\activate
# On macOS/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the backend server
uvicorn app.main:app --reload
```

The backend will be available at: `http://localhost:8000`

**API Documentation**: Visit `http://localhost:8000/docs` for interactive Swagger UI

### 4. Setup Frontend

```bash
# Navigate to frontend directory (in a new terminal)
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will be available at: `http://localhost:3000`

### 5. Access the App

Open your browser and navigate to: [http://localhost:3000](http://localhost:3000)

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

### Using Docker (Recommended)

```bash
docker-compose up --build
```

### Manual Deployment

1. **Backend**: Deploy the FastAPI app to any Python hosting
2. **Frontend**: Build with `npm run build` and serve the `dist` folder

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