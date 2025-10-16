from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict
import numpy as np
from datetime import datetime
import logging

# Import our ML components
from ml_model import TransactionClassifier
from training_data import get_training_data, get_categories

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Transaction Classifier API",
    description="ML-powered transaction categorization service",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the classifier
classifier = TransactionClassifier()

# Pydantic models
class Transaction(BaseModel):
    description: str = Field(..., description="Transaction description")
    amount: float = Field(..., description="Transaction amount")
    merchant: Optional[str] = Field(None, description="Merchant name")
    
    class Config:
        json_schema_extra = {
            "example": {
                "description": "STARBUCKS COFFEE #1234",
                "amount": 5.75,
                "merchant": "Starbucks"
            }
        }

class TransactionBatch(BaseModel):
    transactions: List[Transaction]

class AlternativePrediction(BaseModel):
    category: str
    confidence: float

class PredictionResponse(BaseModel):
    category: str
    confidence: float
    alternatives: List[AlternativePrediction] = Field(
        default_factory=list,
        description="Alternative categories with their probabilities"
    )

class BatchPredictionResponse(BaseModel):
    predictions: List[PredictionResponse]
    processing_time_ms: float

class TrainingRequest(BaseModel):
    transactions: List[Dict]
    categories: List[str]

class ModelMetrics(BaseModel):
    accuracy: float
    training_samples: int
    categories: List[str]
    last_trained: Optional[str]
    feature_count: int

# Startup event
@app.on_event("startup")
async def startup_event():
    """Initialize and train the model on startup"""
    logger.info("Starting ML Classifier Service...")
    
    # Load training data
    X_train, y_train = get_training_data()
    
    # Train the model
    logger.info(f"Training model with {len(X_train)} samples...")
    classifier.train(X_train, y_train)
    
    logger.info("Model training complete!")

# Health check
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "ml-classifier",
        "model_trained": classifier.is_trained,
        "timestamp": datetime.utcnow().isoformat()
    }

# Predict single transaction
@app.post("/predict", response_model=PredictionResponse)
async def predict_category(transaction: Transaction):
    """
    Predict the category for a single transaction
    
    Returns the predicted category, confidence score, and alternative predictions
    """
    if not classifier.is_trained:
        raise HTTPException(status_code=503, detail="Model not trained yet")
    
    try:
        # Prepare transaction data
        trans_data = {
            'description': transaction.description,
            'amount': transaction.amount,
            'merchant': transaction.merchant or ''
        }
        
        # Get prediction
        category, confidence, alternatives = classifier.predict(trans_data)
        
        return PredictionResponse(
            category=category,
            confidence=confidence,
            alternatives=[
                AlternativePrediction(category=cat, confidence=conf)
                for cat, conf in alternatives
            ]
        )
    
    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

# Predict batch of transactions
@app.post("/predict/batch", response_model=BatchPredictionResponse)
async def predict_batch(batch: TransactionBatch):
    """
    Predict categories for multiple transactions
    
    Efficient batch processing for multiple transactions
    """
    if not classifier.is_trained:
        raise HTTPException(status_code=503, detail="Model not trained yet")
    
    start_time = datetime.utcnow()
    
    try:
        predictions = []
        
        for transaction in batch.transactions:
            trans_data = {
                'description': transaction.description,
                'amount': transaction.amount,
                'merchant': transaction.merchant or ''
            }
            
            category, confidence, alternatives = classifier.predict(trans_data)
            
            predictions.append(PredictionResponse(
                category=category,
                confidence=confidence,
                alternatives=[
                    AlternativePrediction(category=cat, confidence=conf)
                    for cat, conf in alternatives
                ]
            ))
        
        processing_time = (datetime.utcnow() - start_time).total_seconds() * 1000
        
        return BatchPredictionResponse(
            predictions=predictions,
            processing_time_ms=round(processing_time, 2)
        )
    
    except Exception as e:
        logger.error(f"Batch prediction error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Batch prediction failed: {str(e)}")

# Retrain model
@app.post("/train")
async def train_model(training_request: TrainingRequest):
    """
    Retrain the model with new data
    
    Allows updating the model with user-provided labeled transactions
    """
    try:
        transactions = training_request.transactions
        categories = training_request.categories
        
        if len(transactions) != len(categories):
            raise HTTPException(
                status_code=400,
                detail="Number of transactions must match number of categories"
            )
        
        if len(transactions) < 10:
            raise HTTPException(
                status_code=400,
                detail="At least 10 training samples required"
            )
        
        # Train the model
        classifier.train(transactions, categories)
        
        return {
            "status": "success",
            "message": f"Model retrained with {len(transactions)} samples",
            "timestamp": datetime.utcnow().isoformat()
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Training error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Training failed: {str(e)}")

# Get model metrics
@app.get("/metrics", response_model=ModelMetrics)
async def get_metrics():
    """
    Get model performance metrics and information
    """
    if not classifier.is_trained:
        raise HTTPException(status_code=503, detail="Model not trained yet")
    
    metrics = classifier.get_metrics()
    
    return ModelMetrics(
        accuracy=metrics['accuracy'],
        training_samples=metrics['training_samples'],
        categories=metrics['categories'],
        last_trained=metrics['last_trained'],
        feature_count=metrics['feature_count']
    )

# Get available categories
@app.get("/categories")
async def get_available_categories():
    """
    Get list of available transaction categories
    """
    return {
        "categories": get_categories(),
        "count": len(get_categories())
    }

# Root endpoint
@app.get("/")
async def root():
    """
    API root with service information
    """
    return {
        "service": "Transaction Classifier",
        "version": "1.0.0",
        "status": "operational",
        "endpoints": {
            "predict": "/predict",
            "batch_predict": "/predict/batch",
            "train": "/train",
            "metrics": "/metrics",
            "categories": "/categories",
            "health": "/health",
            "docs": "/docs"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8006)