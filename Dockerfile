# Base Python image
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8000

# Set working directory
WORKDIR /app

# Copy dependency definition
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend application, frontend assets, and existing database
COPY backend/ ./backend/
COPY frontend/ ./frontend/
COPY shopsense.db* ./

# Expose application port
EXPOSE 8000

# Command to run the application using Uvicorn
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]

