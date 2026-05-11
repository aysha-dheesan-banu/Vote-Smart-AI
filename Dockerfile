# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
# Use empty string for VITE_API_URL so it uses relative paths (current origin)
ARG VITE_SSO_URL
ARG VITE_CLIENT_ID
ARG VITE_REDIRECT_URI
RUN VITE_API_URL= VITE_SSO_URL=$VITE_SSO_URL VITE_CLIENT_ID=$VITE_CLIENT_ID VITE_REDIRECT_URI=$VITE_REDIRECT_URI npm run build

# Stage 2: Final Image
FROM python:3.11-slim
WORKDIR /app

# Copy requirements and install
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ ./

# Copy built frontend from Stage 1 to a 'static' directory in the backend
COPY --from=frontend-builder /app/frontend/dist ./static

# Expose port
EXPOSE 8080

# Run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
