# Multi-stage Dockerfile for Velib Parking Guide
# Builds both frontend and backend

# ==================== Backend Stage ====================
FROM python:3.11-slim as backend

# Set working directory
WORKDIR /app

# Copy backend requirements
COPY backend/requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir --user -r requirements.txt

# Copy backend code
COPY backend/ ./backend/

# Install backend as package
RUN cd backend && pip install --no-cache-dir --user -e .

# ==================== Frontend Stage ====================
FROM node:20-alpine as frontend

# Set working directory
WORKDIR /app

# Install frontend dependencies
COPY frontend/package.json frontend/package-lock.json* ./frontend/
RUN cd frontend && npm ci

# Copy frontend code
COPY frontend/ ./frontend/

# Build frontend
RUN cd frontend && npm run build

# ==================== Final Stage ====================
FROM python:3.11-slim as final

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Install system dependencies for running the app
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy backend from backend stage
COPY --from=backend /root/.local /root/.local
COPY --from=backend /app /app

# Make sure scripts in .local are usable
ENV PATH=/root/.local/bin:$PATH

# Copy built frontend from frontend stage
COPY --from=frontend /app/frontend/build ./frontend/build

# Copy environment files
COPY .env.example .

# Expose ports
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/api/health || exit 1

# Run the application
CMD ["uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000"]