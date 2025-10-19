from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import os
from typing import Optional

app = FastAPI(title="FinTrack ML Classifier")

# Load model (create a dummy one if it doesn't exist)
MODEL_PATH = "category_classifier.pkl"

class TransactionInput(BaseModel):
    description: str
    amount: float

class ClassificationOutput(BaseModel):
    category: str
    confidence: float

# Simple rule-based classifier (replace with trained model later)
def classify_transaction(description: str, amount: float) -> dict:
    description_lower = description.lower()
    
    # Simple rules
    if any(word in description_lower for word in ['starbucks', 'coffee', 'restaurant', 'mcdonald', 'food']):
        return {"category": "Dining", "confidence": 0.85}
    elif any(word in description_lower for word in ['uber', 'lyft', 'taxi', 'gas', 'fuel']):
        return {"category": "Transportation", "confidence": 0.80}
    elif any(word in description_lower for word in ['amazon', 'walmart', 'target', 'shopping']):
        return {"category": "Shopping", "confidence": 0.75}
    elif any(word in description_lower for word in ['netflix', 'spotify', 'subscription']):
        return {"category": "Entertainment", "confidence": 0.82}
    elif any(word in description_lower for word in ['rent', 'mortgage', 'utilities', 'electric']):
        return {"category": "Bills", "confidence": 0.90}
    else:
        return {"category": "Other", "confidence": 0.50}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "ml-classifier"}

@app.post("/classify", response_model=ClassificationOutput)
async def classify(transaction: TransactionInput):
    try:
        result = classify_transaction(transaction.description, transaction.amount)
        return ClassificationOutput(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def root():
    return {"message": "FinTrack ML Classifier API", "version": "1.0"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8085)
