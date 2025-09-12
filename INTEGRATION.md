# AgriClip Model Integration Guide

This guide explains how to set up and run the AgriClip application with the integrated FastAPI model service.

## Architecture Overview

The AgriClip application consists of two main components:

1. **Express Backend**: Handles user authentication, file uploads, chat functionality, and serves as the main API for the frontend.

2. **FastAPI Model Service**: Provides the AI model for crop disease detection, running as a separate service.

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- Python 3.8 or higher
- MongoDB

### Step 1: Set up the Express Backend

1. Navigate to the server directory:

```bash
cd server
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file based on the `.env.example` file:

```bash
cp .env.example .env
```

4. Update the `.env` file with your MongoDB connection string and other configuration options.

5. Add the FastAPI model service URL to the `.env` file:

```
MODEL_SERVICE_URL=http://localhost:8000
```

6. Start the Express server:

```bash
npm run dev
```

### Step 2: Set up the FastAPI Model Service

1. Navigate to the model directory:

```bash
cd model
```

2. On Windows, run the `start.bat` script:

```bash
start.bat
```

Or manually set up the Python environment:

```bash
python -m venv venv
venv\Scripts\activate  # On Windows
source venv/bin/activate  # On macOS/Linux
pip install -r requirements.txt
python main.py
```

## Running the Integration

1. Start the FastAPI model service:
   ```bash
   cd model
   .\start.bat
   ```
   This will set up a virtual environment, install dependencies, and start the FastAPI server on port 8000.

2. Start the Express backend server:
   ```bash
   cd server
   npm install
   npm run dev
   ```
   This will install dependencies and start the Express server on port 5000.

## API Endpoints

### Express Backend Endpoints

- `GET /api/model/status`: Check the status of the model service
- `GET /api/model/diseases`: Get a list of diseases from the model service
- `POST /api/model/classify`: Classify a crop image for disease detection

### FastAPI Model Service Endpoints

- `GET /health`: Check the health status of the API
- `GET /diseases`: Get a list of diseases that the model can detect
- `POST /classify`: Classify an uploaded image for crop disease detection

## Troubleshooting

### Common Issues

1. **FastAPI service not running**:
   - Check if Python is installed correctly
   - Verify that all dependencies are installed
   - Check if the port 8000 is already in use

2. **Express backend cannot connect to FastAPI service**:
   - Verify that the `MODEL_SERVICE_URL` in the `.env` file is correct
   - Check if the FastAPI service is running
   - Check for any firewall or network issues

3. **MongoDB connection issues**:
   - Verify that MongoDB is running
   - Check the MongoDB connection string in the `.env` file

## Next Steps

- Implement a real AI model for crop disease detection
- Add more crop types and diseases to the model
- Improve the user interface for disease detection results
- Add more detailed recommendations for each disease