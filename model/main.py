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
import time
from agriclip_model import get_model

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

# Text-query endpoints removed; model is image-classification only

# Initialize model
print("Loading AgriClip model...")
model = get_model()
print("AgriClip model loaded successfully!")

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

# Removed /text-query route

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
        # Read the image
        contents = await file.read()
        
        # Record start time for processing time calculation
        start_time = time.time()
        
        # Use the real AgriClip model for prediction
        prediction_result = model.predict(contents)
        
        # Calculate processing time
        processing_time = time.time() - start_time
        
        # Return response with real model predictions
        return {
            "success": True,
            "message": "Classification completed successfully",
            "data": {
                "classification": {
                    "uploadId": uploadId,
                    **prediction_result,
                    "processingTime": round(processing_time, 2),
                    "model": "agriclip-plantvillage-15k"
                }
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")

@app.get("/diseases")
async def get_diseases():
    # Provide disease labels from the classifier config
    label_map = getattr(model.model.config, 'id2label', {})
    diseases_list = [
        {"name": name} for idx, name in sorted(label_map.items(), key=lambda x: int(x[0]))
        if 'healthy' not in name.lower()
    ]
    return {
        "success": True,
        "data": {
            "diseases": diseases_list
        }
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)