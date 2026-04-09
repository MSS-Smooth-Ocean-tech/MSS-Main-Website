FROM python:3.11-slim

# Set working directory
WORKDIR /srv

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first (for better caching)
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Set Python path
ENV PYTHONPATH="/srv"

# Expose port (internal)
EXPOSE 8000

# Start the FastAPI app with uvicorn on internal port 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
