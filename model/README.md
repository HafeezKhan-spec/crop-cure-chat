# AgriClip FastAPI Model Service

This directory contains the FastAPI implementation for the AgriClip crop disease detection model.

## Setup Instructions

### Prerequisites

- Python 3.8 or higher
- pip (Python package manager)

### Installation

#### Windows

1. Run the `start.bat` script to set up the virtual environment and start the server:

```
.\start.bat
```

This script will:
- Check if Python is installed
- Create a virtual environment if it doesn't exist
- Install the required dependencies
- Start the FastAPI server

#### Manual Setup

1. Create a virtual environment:

```
python -m venv venv
```

2. Activate the virtual environment:

- Windows: `venv\Scripts\activate`
- macOS/Linux: `source venv/bin/activate`

3. Install dependencies:

```
pip install -r requirements.txt
```

4. Start the server:

```
python main.py
```

## API Endpoints

### Health Check

```
GET /health
```

Returns the health status of the API.

### Classify Image

```
POST /classify
```

Classifies an uploaded image for crop disease detection.

**Parameters:**

- `file`: The image file to classify (required)
- `uploadId`: The ID of the upload in the database (required)
- `cropType`: The type of crop (optional)
- `location`: The location where the image was taken (optional)
- `additionalInfo`: Additional information about the image (optional)

**Response:**

```json
{
  "success": true,
  "message": "Classification completed successfully",
  "data": {
    "classification": {
      "uploadId": "upload_id",
      "diseaseDetected": true,
      "diseaseName": "Disease Name",
      "confidence": 95,
      "severity": "high",
      "affectedArea": 30,
      "recommendations": ["Recommendation 1", "Recommendation 2"],
      "processingTime": 1.0,
      "model": "agriclip-v1"
    }
  }
}
```

### Get Diseases

```
GET /diseases
```

Returns a list of diseases that the model can detect.

## Integration with Express Backend

The Express backend communicates with this FastAPI service using the `axios` library. The connection is configured in the `.env` file of the Express backend with the `MODEL_SERVICE_URL` environment variable.

## Environment Variables

The following environment variables can be configured in the `.env` file:

- `MODEL_PORT`: The port on which the FastAPI server runs (default: 8000)
- `MODEL_HOST`: The host on which the FastAPI server runs (default: 0.0.0.0)
- `DEBUG`: Whether to run the server in debug mode (default: True)
- `BACKEND_API_URL`: The URL of the Express backend API (default: http://localhost:3000/api)