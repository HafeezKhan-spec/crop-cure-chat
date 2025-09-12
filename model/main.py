from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import uvicorn
import os
import json
from PIL import Image
import io
import random
import time

app = FastAPI(
    title="AgriClip Model API",
    description="FastAPI backend for AgriClip crop disease detection model",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Model response schemas
class ClassificationResult(BaseModel):
    diseaseDetected: bool
    diseaseName: str
    confidence: int
    severity: Optional[str] = None
    affectedArea: Optional[int] = None
    recommendations: List[str]

class ClassificationResponse(BaseModel):
    success: bool
    message: str
    data: Dict[str, Any]

# Mock disease database
diseases = [
    {
        "name": "Northern Corn Leaf Blight",
        "probability": 0.87,
        "severity": "medium",
        "recommendations": [
            "Apply fungicide containing azoxystrobin",
            "Improve field drainage",
            "Remove infected plant debris",
            "Consider resistant varieties for next season"
        ]
    },
    {
        "name": "Bacterial Leaf Spot",
        "probability": 0.92,
        "severity": "high",
        "recommendations": [
            "Apply copper-based bactericide",
            "Reduce overhead irrigation",
            "Increase plant spacing for better air circulation",
            "Remove and destroy infected leaves"
        ]
    },
    {
        "name": "Rust Disease",
        "probability": 0.78,
        "severity": "low",
        "recommendations": [
            "Apply preventive fungicide spray",
            "Monitor weather conditions",
            "Ensure proper plant nutrition",
            "Remove alternate host plants nearby"
        ]
    },
    {
        "name": "Healthy",
        "probability": 0.95,
        "severity": None,
        "recommendations": [
            "Continue current management practices",
            "Monitor regularly for early disease signs",
            "Maintain proper nutrition and irrigation",
            "Keep field records for future reference"
        ]
    }
]

@app.get("/")
async def root():
    return {"message": "AgriClip Model API is running"}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": time.time(),
        "version": "1.0.0"
    }

@app.post("/classify", response_model=ClassificationResponse)
async def classify_image(
    file: UploadFile = File(...),
    uploadId: str = Form(...),
    cropType: Optional[str] = Form(None),
    location: Optional[str] = Form(None),
    additionalInfo: Optional[str] = Form(None)
):
    # Validate image file
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    try:
        # Read and process the image
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        
        # Simulate model processing time
        time.sleep(1)
        
        # Select a random disease from our mock database
        selected_disease = random.choice(diseases)
        is_healthy = selected_disease["name"] == "Healthy"
        
        # Create classification result
        result = {
            "diseaseDetected": not is_healthy,
            "diseaseName": selected_disease["name"],
            "confidence": int(selected_disease["probability"] * 100),
            "severity": selected_disease["severity"],
            "affectedArea": 0 if is_healthy else random.randint(10, 50),
            "recommendations": selected_disease["recommendations"]
        }
        
        # Return response
        return {
            "success": True,
            "message": "Classification completed successfully",
            "data": {
                "classification": {
                    "uploadId": uploadId,
                    **result,
                    "processingTime": 1.0,
                    "model": "agriclip-v1"
                }
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")

@app.get("/diseases")
async def get_diseases():
    return {
        "success": True,
        "data": {
            "diseases": [{
                "name": disease["name"],
                "severity": disease["severity"]
            } for disease in diseases if disease["name"] != "Healthy"]
        }
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)