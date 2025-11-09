"""
Integration tests for FinTrack
Run with: pytest tests/test_integration.py -v
"""

import pytest
import requests
import time
from typing import Dict

# Base URLs
API_GATEWAY_URL = "http://localhost:8000"
ML_CLASSIFIER_URL = "http://localhost:8005"

class TestHealthChecks:
    """Test all service health endpoints"""
    
    def test_api_gateway_health(self):
        """Test API Gateway health"""
        response = requests.get(f"{API_GATEWAY_URL}/health")
        assert response.status_code == 200
        data = response.json()
        assert data["gateway"] == "healthy"
        print(f"✅ API Gateway: {data['gateway']}")
    
    def test_ml_classifier_health(self):
        """Test ML Classifier health"""
        response = requests.get(f"{ML_CLASSIFIER_URL}/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        print(f"✅ ML Classifier: {data['status']}")
    
    def test_all_services_health(self):
        """Test all services through API Gateway"""
        response = requests.get(f"{API_GATEWAY_URL}/health")
        assert response.status_code == 200
        data = response.json()
        
        for service, status in data["services"].items():
            print(f"Service: {service} - Status: {status['status']}")
            assert status["status"] in ["healthy", "running"]


class TestMLClassifier:
    """Test ML Classification functionality"""
    
    def test_classify_single_transaction(self):
        """Test single transaction classification"""
        payload = {
            "description": "Starbucks coffee",
            "amount": 5.50,
            "merchant": "Starbucks"
        }
        
        response = requests.post(
            f"{ML_CLASSIFIER_URL}/classify",
            json=payload
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert "category" in data
        assert "confidence" in data
        assert isinstance(data["confidence"], float)
        assert 0 <= data["confidence"] <= 1
        
        print(f"✅ Classification: {data['category']} (confidence: {data['confidence']:.2f})")
    
    def test_classify_different_categories(self):
        """Test classification across different categories"""
        test_cases = [
            {
                "description": "Grocery shopping at Walmart",
                "amount": 125.50,
                "merchant": "Walmart",
                "expected_category": "Groceries"
            },
            {
                "description": "Gas station fill up",
                "amount": 45.00,
                "merchant": "Shell",
                "expected_category": "Transportation"
            },
            {
                "description": "Movie tickets",
                "amount": 24.00,
                "merchant": "AMC",
                "expected_category": "Entertainment"
            }
        ]
        
        for test in test_cases:
            response = requests.post(
                f"{ML_CLASSIFIER_URL}/classify",
                json={
                    "description": test["description"],
                    "amount": test["amount"],
                    "merchant": test["merchant"]
                }
            )
            
            assert response.status_code == 200
            data = response.json()
            print(f"✅ {test['description'][:30]}... → {data['category']}")
    
    def test_batch_classification(self):
        """Test batch classification"""
        transactions = [
            {
                "description": "Netflix subscription",
                "amount": 15.99,
                "merchant": "Netflix"
            },
            {
                "description": "Amazon purchase",
                "amount": 89.99,
                "merchant": "Amazon"
            },
            {
                "description": "Restaurant dinner",
                "amount": 65.00,
                "merchant": "Olive Garden"
            }
        ]
        
        response = requests.post(
            f"{ML_CLASSIFIER_URL}/batch-classify",
            json=transactions
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert "results" in data
        assert len(data["results"]) == len(transactions)
        
        for result in data["results"]:
            assert "category" in result or "error" in result
            print(f"✅ Batch: {result.get('description', 'N/A')[:30]} → {result.get('category', 'Error')}")


class TestAPIGateway:
    """Test API Gateway routing"""
    
    @pytest.fixture
    def auth_headers(self):
        """Create test user and get auth token"""
        # Register test user
        register_payload = {
            "email": f"test_{int(time.time())}@example.com",
            "password": "TestPass123!",
            "name": "Test User"
        }
        
        requests.post(
            f"{API_GATEWAY_URL}/api/auth/register",
            json=register_payload
        )
        
        # Login
        login_payload = {
            "email": register_payload["email"],
            "password": register_payload["password"]
        }
        
        response = requests.post(
            f"{API_GATEWAY_URL}/api/auth/login",
            json=login_payload
        )
        
        assert response.status_code == 200
        token = response.json()["token"]
        
        return {"Authorization": f"Bearer {token}"}
    
    def test_classify_through_gateway(self):
        """Test ML classification through API Gateway"""
        payload = {
            "description": "Coffee shop",
            "amount": 4.50,
            "merchant": "Local Cafe"
        }
        
        response = requests.post(
            f"{API_GATEWAY_URL}/api/classify",
            json=payload
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert "category" in data
        assert "confidence" in data
        
        print(f"✅ Gateway Classification: {data['category']}")
    
    def test_create_transaction_with_ml(self, auth_headers):
        """Test creating transaction with automatic ML classification"""
        payload = {
            "description": "Target shopping",
            "amount": 78.99,
            "merchant": "Target",
            "type": "expense",
            "date": "2025-10-20"
        }
        
        response = requests.post(
            f"{API_GATEWAY_URL}/api/transactions",
            json=payload,
            headers=auth_headers
        )
        
        # Should succeed or return 201
        assert response.status_code in [200, 201]
        data = response.json()
        
        # Should have category assigned by ML
        if "category" in data:
            print(f"✅ Transaction created with category: {data['category']}")
        else:
            print(f"✅ Transaction created: {data}")
    
    def test_get_transactions(self, auth_headers):
        """Test getting transactions"""
        response = requests.get(
            f"{API_GATEWAY_URL}/api/transactions",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert isinstance(data, list)
        print(f"✅ Retrieved {len(data)} transactions")


class TestEndToEnd:
    """End-to-end integration tests"""
    
    def test_complete_transaction_flow(self):
        """Test complete flow: Register → Login → Create Transaction → Get Reports"""
        
        # 1. Register
        email = f"e2e_test_{int(time.time())}@example.com"
        register_response = requests.post(
            f"{API_GATEWAY_URL}/api/auth/register",
            json={
                "email": email,
                "password": "TestPass123!",
                "name": "E2E Test User"
            }
        )
        print(f"✅ Step 1: User registered")
        
        # 2. Login
        login_response = requests.post(
            f"{API_GATEWAY_URL}/api/auth/login",
            json={
                "email": email,
                "password": "TestPass123!"
            }
        )
        assert login_response.status_code == 200
        token = login_response.json()["token"]
        headers = {"Authorization": f"Bearer {token}"}
        print(f"✅ Step 2: User logged in")
        
        # 3. Create multiple transactions
        transactions = [
            {
                "description": "Grocery shopping",
                "amount": 150.00,
                "merchant": "Kroger",
                "type": "expense"
            },
            {
                "description": "Salary deposit",
                "amount": 3000.00,
                "type": "income"
            },
            {
                "description": "Gas station",
                "amount": 45.00,
                "merchant": "Shell",
                "type": "expense"
            }
        ]
        
        for txn in transactions:
            response = requests.post(
                f"{API_GATEWAY_URL}/api/transactions",
                json=txn,
                headers=headers
            )
            # Allow 200 or 201
            assert response.status_code in [200, 201]
        
        print(f"✅ Step 3: Created {len(transactions)} transactions")
        
        # 4. Get transactions
        get_response = requests.get(
            f"{API_GATEWAY_URL}/api/transactions",
            headers=headers
        )
        assert get_response.status_code == 200
        user_transactions = get_response.json()
        print(f"✅ Step 4: Retrieved {len(user_transactions)} transactions")
        
        # 5. Get reports (if endpoint exists)
        try:
            report_response = requests.get(
                f"{API_GATEWAY_URL}/api/reports/summary",
                headers=headers
            )
            if report_response.status_code == 200:
                print(f"✅ Step 5: Generated summary report")
        except:
            print(f"⚠️  Step 5: Reports endpoint not available")


class TestPerformance:
    """Performance tests"""
    
    def test_ml_classification_performance(self):
        """Test ML classification response time"""
        payload = {
            "description": "Test transaction",
            "amount": 50.00,
            "merchant": "Test Merchant"
        }
        
        start_time = time.time()
        response = requests.post(
            f"{ML_CLASSIFIER_URL}/classify",
            json=payload
        )
        end_time = time.time()
        
        response_time = (end_time - start_time) * 1000  # Convert to ms
        
        assert response.status_code == 200
        assert response_time < 1000  # Should respond in less than 1 second
        
        print(f"✅ ML Classification response time: {response_time:.2f}ms")
    
    def test_api_gateway_performance(self):
        """Test API Gateway response time"""
        start_time = time.time()
        response = requests.get(f"{API_GATEWAY_URL}/health")
        end_time = time.time()
        
        response_time = (end_time - start_time) * 1000
        
        assert response.status_code == 200
        assert response_time < 500  # Should respond in less than 500ms
        
        print(f"✅ API Gateway response time: {response_time:.2f}ms")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])