"""
Transaction Classifier using scikit-learn
Implements a Random Forest classifier with TF-IDF features
"""

import numpy as np
import re
from datetime import datetime
from typing import List, Tuple, Dict
from sklearn.ensemble import RandomForestClassifier
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import cross_val_score
import pickle
import logging

logger = logging.getLogger(__name__)

class TransactionClassifier:
    """
    ML Classifier for transaction categorization
    Uses Random Forest with TF-IDF features
    """
    
    def __init__(self):
        self.is_trained = False
        self.model = None
        self.vectorizer = None
        self.scaler = None
        self.categories = []
        self.training_samples = 0
        self.accuracy = 0.0
        self.last_trained = None
        self.feature_count = 0
        
    def _preprocess_text(self, text: str) -> str:
        """Clean and normalize transaction descriptions"""
        if not text:
            return ""
        
        # Convert to lowercase
        text = text.lower()
        
        # Remove special characters but keep spaces
        text = re.sub(r'[^a-z0-9\s]', ' ', text)
        
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text).strip()
        
        return text
    
    def _extract_features(self, transactions: List[Dict]) -> np.ndarray:
        """
        Extract features from transactions
        
        Features include:
        - TF-IDF vectors from description
        - Transaction amount (normalized)
        - Merchant information
        """
        if not transactions:
            return np.array([])
        
        # Prepare text data
        descriptions = []
        for trans in transactions:
            desc = self._preprocess_text(trans.get('description', ''))
            merchant = self._preprocess_text(trans.get('merchant', ''))
            
            # Combine description and merchant
            combined_text = f"{desc} {merchant}".strip()
            
            # Handle empty text - add placeholder
            if not combined_text:
                combined_text = "unknown transaction"
            
            descriptions.append(combined_text)
        
        # Extract amounts - handle edge cases
        amounts = []
        for trans in transactions:
            amount = trans.get('amount', 0.0)
            # Handle negative amounts (refunds) by taking absolute value
            amounts.append(abs(float(amount)))
        
        amounts = np.array(amounts).reshape(-1, 1)
        
        # Initialize or use existing vectorizer
        if self.vectorizer is None:
            self.vectorizer = TfidfVectorizer(
                max_features=100,
                ngram_range=(1, 2),
                min_df=1,
                max_df=0.95,
                lowercase=True,
                token_pattern=r'\b\w+\b'
            )
            text_features = self.vectorizer.fit_transform(descriptions).toarray()
        else:
            try:
                text_features = self.vectorizer.transform(descriptions).toarray()
            except Exception as e:
                logger.warning(f"Error transforming text features: {e}")
                # Fallback: create zero vector of correct size
                text_features = np.zeros((len(descriptions), len(self.vectorizer.get_feature_names_out())))
        
        # Initialize or use existing scaler
        if self.scaler is None:
            self.scaler = StandardScaler()
            amount_features = self.scaler.fit_transform(amounts)
        else:
            try:
                amount_features = self.scaler.transform(amounts)
            except Exception as e:
                logger.warning(f"Error scaling amounts: {e}")
                # Fallback: use normalized amounts
                amount_features = (amounts - np.mean(amounts)) / (np.std(amounts) + 1e-8)
        
        # Combine features
        features = np.hstack([text_features, amount_features])
        
        return features
    
    def train(self, transactions: List[Dict], categories: List[str]):
        """
        Train the classifier on labeled transactions
        
        Args:
            transactions: List of transaction dictionaries
            categories: List of corresponding category labels
        """
        if len(transactions) != len(categories):
            raise ValueError("Number of transactions must match number of categories")
        
        if len(transactions) < 5:
            raise ValueError("At least 5 training samples required")
        
        logger.info(f"Training classifier with {len(transactions)} samples...")
        
        # Reset vectorizer and scaler for new training
        self.vectorizer = None
        self.scaler = None
        
        # Extract features
        X = self._extract_features(transactions)
        y = np.array(categories)
        
        # Store unique categories
        self.categories = sorted(list(set(categories)))
        
        # Create and train model
        self.model = RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            min_samples_split=5,
            min_samples_leaf=2,
            random_state=42,
            n_jobs=-1
        )
        
        self.model.fit(X, y)
        
        # Calculate cross-validation accuracy
        try:
            if len(transactions) >= 10:
                cv_scores = cross_val_score(self.model, X, y, cv=min(5, len(transactions) // 2))
                self.accuracy = cv_scores.mean()
            else:
                self.accuracy = self.model.score(X, y)
        except Exception as e:
            logger.warning(f"Could not calculate accuracy: {e}")
            self.accuracy = 0.0
        
        # Store metadata
        self.is_trained = True
        self.training_samples = len(transactions)
        self.last_trained = datetime.utcnow().isoformat()
        self.feature_count = X.shape[1]
        
        logger.info(f"Training complete! Accuracy: {self.accuracy:.2%}")
        logger.info(f"Categories: {self.categories}")
    
    def predict(self, transaction: Dict) -> Tuple[str, float, List[Tuple[str, float]]]:
        """
        Predict category for a single transaction
        
        Returns:
            category: Predicted category
            confidence: Confidence score (0-1)
            alternatives: List of (category, probability) tuples for top 3 alternatives
        """
        if not self.is_trained:
            raise ValueError("Model not trained yet")
        
        try:
            # Extract features
            X = self._extract_features([transaction])
            
            # Get prediction and probabilities
            category = self.model.predict(X)[0]
            probabilities = self.model.predict_proba(X)[0]
            
            # Get confidence for predicted category
            predicted_idx = list(self.model.classes_).index(category)
            confidence = probabilities[predicted_idx]
            
            # Get top 3 alternative predictions
            top_indices = np.argsort(probabilities)[-3:][::-1]
            alternatives = [
                (self.model.classes_[idx], float(probabilities[idx]))
                for idx in top_indices
            ]
            
            return category, float(confidence), alternatives
            
        except Exception as e:
            logger.error(f"Prediction failed: {e}")
            # Return a default prediction
            default_category = self.categories[0] if self.categories else "Other"
            return default_category, 0.0, [(default_category, 0.0)]
    
    def predict_batch(self, transactions: List[Dict]) -> List[Tuple[str, float]]:
        """
        Predict categories for multiple transactions
        
        Returns:
            List of (category, confidence) tuples
        """
        if not self.is_trained:
            raise ValueError("Model not trained yet")
        
        try:
            # Extract features
            X = self._extract_features(transactions)
            
            # Get predictions and probabilities
            categories = self.model.predict(X)
            probabilities = self.model.predict_proba(X)
            
            # Get confidence for each prediction
            results = []
            for i, category in enumerate(categories):
                predicted_idx = list(self.model.classes_).index(category)
                confidence = probabilities[i][predicted_idx]
                results.append((category, float(confidence)))
            
            return results
            
        except Exception as e:
            logger.error(f"Batch prediction failed: {e}")
            # Return default predictions
            default_category = self.categories[0] if self.categories else "Other"
            return [(default_category, 0.0) for _ in transactions]
    
    def get_metrics(self) -> Dict:
        """Get model performance metrics"""
        if not self.is_trained:
            return {}
        
        return {
            'accuracy': round(self.accuracy, 4),
            'training_samples': self.training_samples,
            'categories': self.categories,
            'last_trained': self.last_trained,
            'feature_count': self.feature_count
        }
    
    def save_model(self, filepath: str):
        """Save model to disk"""
        if not self.is_trained:
            raise ValueError("No trained model to save")
        
        model_data = {
            'model': self.model,
            'vectorizer': self.vectorizer,
            'scaler': self.scaler,
            'categories': self.categories,
            'training_samples': self.training_samples,
            'accuracy': self.accuracy,
            'last_trained': self.last_trained,
            'feature_count': self.feature_count
        }
        
        with open(filepath, 'wb') as f:
            pickle.dump(model_data, f)
        
        logger.info(f"Model saved to {filepath}")
    
    def load_model(self, filepath: str):
        """Load model from disk"""
        with open(filepath, 'rb') as f:
            model_data = pickle.load(f)
        
        self.model = model_data['model']
        self.vectorizer = model_data['vectorizer']
        self.scaler = model_data['scaler']
        self.categories = model_data['categories']
        self.training_samples = model_data['training_samples']
        self.accuracy = model_data['accuracy']
        self.last_trained = model_data['last_trained']
        self.feature_count = model_data['feature_count']
        self.is_trained = True
        
        logger.info(f"Model loaded from {filepath}")
        logger.info(f"Accuracy: {self.accuracy:.2%}, Categories: {len(self.categories)}")