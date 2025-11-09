from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from typing import Optional
import re

app = FastAPI(title="FinTrack ML Classifier")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TransactionInput(BaseModel):
    description: str
    amount: float
    merchant: Optional[str] = ""

class TransactionOutput(BaseModel):
    category: str
    confidence: float

# Rule-based classification (works without ML model)
CATEGORY_RULES = {
    "Groceries": {
        "keywords": ["grocery", "groceries", "walmart", "kroger", "target", "whole foods", 
                     "trader joe", "costco", "safeway", "food", "supermarket"],
        "confidence": 0.85
    },
    "Dining": {
        "keywords": ["restaurant", "cafe", "coffee", "starbucks", "mcdonald", "burger", 
                     "pizza", "chipotle", "subway", "dunkin", "dining", "food"],
        "confidence": 0.88
    },
    "Transportation": {
        "keywords": ["gas", "fuel", "shell", "exxon", "chevron", "bp", "mobil", 
                     "uber", "lyft", "taxi", "parking", "toll", "transit"],
        "confidence": 0.82
    },
    "Entertainment": {
        "keywords": ["netflix", "spotify", "hulu", "disney", "amazon prime", "movie", 
                     "theater", "cinema", "concert", "ticket", "game", "entertainment"],
        "confidence": 0.90
    },
    "Shopping": {
        "keywords": ["amazon", "ebay", "shop", "store", "mall", "clothing", "shoes", 
                     "electronics", "best buy", "purchase"],
        "confidence": 0.75
    },
    "Bills & Utilities": {
        "keywords": ["electric", "water", "gas bill", "internet", "phone", "utility", 
                     "bill", "payment", "insurance", "rent", "mortgage"],
        "confidence": 0.92
    },
    "Healthcare": {
        "keywords": ["pharmacy", "doctor", "hospital", "medical", "health", "cvs", 
                     "walgreens", "clinic", "prescription", "medicine"],
        "confidence": 0.87
    },
    "Travel": {
        "keywords": ["hotel", "airline", "flight", "airbnb", "booking", "expedia", 
                     "travel", "vacation", "trip"],
        "confidence": 0.83
    },
    "Fitness": {
        "keywords": ["gym", "fitness", "yoga", "sports", "athletic", "workout", 
                     "exercise", "health club"],
        "confidence": 0.86
    }
}

def classify_by_rules(description: str, merchant: str) -> tuple[str, float]:
    """Rule-based classification"""
    text = f"{description} {merchant}".lower()
    
    # Check each category
    for category, rules in CATEGORY_RULES.items():
        for keyword in rules["keywords"]:
            if keyword in text:
                return category, rules["confidence"]
    
    # Default category
    return "Other", 0.50

@app.get("/")
async def root():
    return {
        "service": "FinTrack ML Classifier",
        "status": "running",
        "version": "1.0.0",
        "mode": "rule-based"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "model_loaded": True,  # Using rule-based classification
        "mode": "rule-based"
    }

@app.post("/classify", response_model=TransactionOutput)
async def classify_transaction(transaction: TransactionInput):
    """Classify a transaction using rule-based logic"""
    
    try:
        category, confidence = classify_by_rules(
            transaction.description,
            transaction.merchant or ""
        )
        
        return TransactionOutput(
            category=category,
            confidence=confidence
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Classification error: {str(e)}")

@app.post("/batch-classify")
async def batch_classify(transactions: list[TransactionInput]):
    """Classify multiple transactions at once"""
    
    results = []
    for transaction in transactions:
        try:
            category, confidence = classify_by_rules(
                transaction.description,
                transaction.merchant or ""
            )
            results.append({
                "description": transaction.description,
                "category": category,
                "confidence": confidence
            })
        except Exception as e:
            results.append({
                "description": transaction.description,
                "error": str(e)
            })
    
    return {"results": results}

@app.get("/categories")
async def get_categories():
    """Get list of available categories"""
    return {
        "categories": list(CATEGORY_RULES.keys()) + ["Other"],
        "total": len(CATEGORY_RULES) + 1
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    print(f"Starting ML Classifier on port {port}")
    print("Mode: Rule-based classification")
    uvicorn.run(app, host="0.0.0.0", port=port)