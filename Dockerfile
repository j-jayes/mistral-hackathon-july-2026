# Multi-stage Dockerfile for Velib Parking Guide (single-container Cloud Run deploy)
# Stage 1 builds the React SPA; stage 2 serves it + the FastAPI API from one origin.

# ==================== Frontend build stage ====================
FROM node:20-slim AS frontend

WORKDIR /fe

# Install deps first for better layer caching.
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm ci || npm install

# Build the SPA. VITE_API_URL="" makes the app call its own origin (relative /api),
# which is correct for the single-container deployment. Baked in at build time.
COPY frontend/ ./
ENV VITE_API_URL=""
RUN npm run build   # outputs to /fe/build (vite build.outDir)

# ==================== Runtime stage ====================
FROM python:3.11-slim AS final

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    SERVE_FRONTEND=true \
    FRONTEND_BUILD_DIR=/app/frontend/build \
    DEBUG=false

# curl for the healthcheck.
RUN apt-get update && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Python deps.
COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt

# Backend source (a proper package: backend.app.main:app).
COPY backend/ ./backend/

# Built SPA from stage 1 -> matches FRONTEND_BUILD_DIR above.
COPY --from=frontend /fe/build ./frontend/build

# Cloud Run provides $PORT (defaults to 8080); honor it.
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD curl -f "http://localhost:${PORT:-8080}/api/health" || exit 1

# Shell form so ${PORT} expands; exec so uvicorn gets SIGTERM directly.
CMD exec uvicorn backend.app.main:app --host 0.0.0.0 --port ${PORT:-8080}
