import torch
from PIL import Image
import numpy as np
import io
from transformers import AutoImageProcessor, AutoModelForImageClassification
import torchvision.transforms as T


class AgriClipModel:
    def __init__(self):
        print("Loading AgriClip PlantVillage-15k classifier...")
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.model_id = "HafeezKing/agriclip-plantvillage-15k"
        # Try to load an official image processor; fall back to a sane CLIP-style pipeline
        try:
            self.processor = AutoImageProcessor.from_pretrained(self.model_id)
        except Exception as e:
            print(f"Warning: AutoImageProcessor unavailable for {self.model_id}: {e}")
            print("Using fallback torchvision preprocessing (CLIP normalization, 224x224).")
            self.processor = None

        self.model = AutoModelForImageClassification.from_pretrained(self.model_id).to(self.device)
        self.model.eval()
        print(f"AgriClip classifier loaded successfully on {self.device} from {self.model_id}!")

        # Prepare fallback transform (only used if processor is None)
        # Prefer vision_config.image_size if present; otherwise default to 224
        try:
            size = getattr(getattr(self.model.config, "vision_config", self.model.config), "image_size", 224)
        except Exception:
            size = 224
        self._fallback_transform = T.Compose([
            T.Resize(int(size * 1.14)),  # typical resize before center-crop
            T.CenterCrop(size),
            T.ToTensor(),
            # CLIP normalization (fits AgriClip lineage); if the model expects ImageNet, it remains close
            T.Normalize(mean=[0.48145466, 0.4578275, 0.40821073],
                        std=[0.26862954, 0.26130258, 0.27577711])
        ])

    def preprocess_image(self, image_bytes):
        try:
            image = Image.open(io.BytesIO(image_bytes))
            if image.mode != 'RGB':
                image = image.convert('RGB')
            return image
        except Exception as e:
            raise Exception(f"Error preprocessing image: {str(e)}")

    def predict(self, image_bytes):
        """Predict using HafeezKing/agriclip-plantvillage-15k image classifier"""
        try:
            image = self.preprocess_image(image_bytes)
            if self.processor is not None:
                inputs = self.processor(images=image, return_tensors="pt")
                inputs = {k: v.to(self.device) for k, v in inputs.items()}
            else:
                # Fallback path: create pixel_values directly
                pixel_values = self._fallback_transform(image).unsqueeze(0).to(self.device)
                inputs = {"pixel_values": pixel_values}
            with torch.inference_mode():
                outputs = self.model(**inputs)
                logits = outputs.logits
                probs = torch.softmax(logits, dim=-1).cpu().numpy()[0]
                pred_idx = int(np.argmax(probs))
                confidence = float(probs[pred_idx])
                label_map = self.model.config.id2label
                predicted_label = label_map.get(pred_idx, str(pred_idx))
                disease_detected = 'healthy' not in predicted_label.lower()

                # Build probabilities map for top-5 classes
                top_indices = np.argsort(probs)[-5:][::-1]
                all_probs = {label_map.get(int(i), str(int(i))): float(probs[int(i)]) for i in top_indices}

                # Generic recommendations
                if disease_detected:
                    recommendations = [
                        "Remove heavily affected leaves to prevent spread",
                        "Improve air circulation and avoid overhead watering",
                        "Consider appropriate fungicide or treatment based on disease"
                    ]
                    severity = None
                    affected_area = None
                else:
                    recommendations = [
                        "Maintain proper watering and nutrition",
                        "Continue regular monitoring for early signs of disease"
                    ]
                    severity = None
                    affected_area = 0

                return {
                    "diseaseDetected": disease_detected,
                    "diseaseName": predicted_label,
                    "confidence": int(confidence * 100),
                    "severity": severity,
                    "affectedArea": affected_area,
                    "recommendations": recommendations,
                    "modelType": "AgriClip PlantVillage-15k Classifier",
                    "allProbabilities": all_probs
                }
        except Exception as e:
            raise Exception(f"Error during AgriClip prediction: {str(e)}")


_model_instance = None


def get_model():
    """Get or create AgriClip model instance"""
    global _model_instance
    if _model_instance is None:
        _model_instance = AgriClipModel()
    return _model_instance