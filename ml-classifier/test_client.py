"""
Test client for ML Classifier API
Demonstrates all available endpoints
"""

import requests
import json
from typing import Dict, List

# API base URL
BASE_URL = "http://localhost:8006"

def print_response(title: str, response: requests.Response):
    """Pretty print API response"""
    print(f"\n{'='*60}")
    print(f"{title}")
    print(f"{'='*60}")
    print(f"Status Code: {response.status_code}")
    print(f"\nResponse:")
    try:
        print(json.dumps(response.json(), indent=2))
    except:
        print(response.text)

def test_health_check():
    """Test health check endpoint"""
    response = requests.get(f"{BASE_URL}/health")
    print_response("Health Check", response)

def test_get_categories():
    """Test get categories endpoint"""
    response = requests.get(f"{BASE_URL}/categories")
    print_response("Available Categories", response)

def test_single_prediction():
    """Test single transaction prediction"""
    transaction = {
        "description": "STARBUCKS COFFEE #5678",
        "amount": 6.50,
        "merchant": "Starbucks"
    }
    
    response = requests.post(
        f"{BASE_URL}/predict",
        json=transaction
    )
    print_response("Single Transaction Prediction", response)
    return response

def test_batch_prediction():
    """Test batch transaction prediction"""
    transactions = {
        "transactions": [
            {
                "description": "WHOLE FOODS MARKET",
                "amount": 85.42,
                "merchant": "Whole Foods"
            },
            {
                "description": "NETFLIX SUBSCRIPTION",
                "amount": 15.99,
                "merchant": "Netflix"
            },
            {
                "description": "SHELL GAS STATION",
                "amount": 45.00,
                "merchant": "Shell"
            },
            {
                "description": "AMAZON.COM PURCHASE",
                "amount": 129.99,
                "merchant": "Amazon"
            },
            {
                "description": "UBER TRIP",
                "amount": 22.50,
                "merchant": "Uber"
            }
        ]
    }
    
    response = requests.post(
        f"{BASE_URL}/predict/batch",
        json=transactions
    )
    print_response("Batch Transaction Prediction", response)

def test_model_metrics():
    """Test model metrics endpoint"""
    response = requests.get(f"{BASE_URL}/metrics")
    print_response("Model Metrics", response)

def test_edge_cases():
    """Test edge cases and unusual inputs"""
    
    print("\n" + "="*60)
    print("Testing Edge Cases")
    print("="*60)
    
    # Case 1: Short description
    try:
        response = requests.post(
            f"{BASE_URL}/predict",
            json={"description": "FOOD", "amount": 10.00}
        )
        if response.status_code == 200:
            result = response.json()
            print(f"\nCase 1: Short description - {result.get('category', 'N/A')}")
        else:
            print(f"\nCase 1: Error - {response.status_code}")
    except Exception as e:
        print(f"\nCase 1: Exception - {e}")
    
    # Case 2: Large amount
    try:
        response = requests.post(
            f"{BASE_URL}/predict",
            json={"description": "PAYROLL DEPOSIT", "amount": 5000.00}
        )
        if response.status_code == 200:
            result = response.json()
            print(f"Case 2: Large amount - {result.get('category', 'N/A')}")
        else:
            print(f"Case 2: Error - {response.status_code}")
    except Exception as e:
        print(f"Case 2: Exception - {e}")
    
    # Case 3: Negative amount (refund)
    try:
        response = requests.post(
            f"{BASE_URL}/predict",
            json={"description": "REFUND AMAZON", "amount": -50.00}
        )
        if response.status_code == 200:
            result = response.json()
            print(f"Case 3: Negative amount - {result.get('category', 'N/A')}")
        else:
            print(f"Case 3: Error - {response.status_code}")
    except Exception as e:
        print(f"Case 3: Exception - {e}")
    
    # Case 4: Unknown merchant
    try:
        response = requests.post(
            f"{BASE_URL}/predict",
            json={"description": "XYZ UNKNOWN STORE 123", "amount": 25.00}
        )
        if response.status_code == 200:
            result = response.json()
            print(f"Case 4: Unknown merchant - {result.get('category', 'N/A')}")
        else:
            print(f"Case 4: Error - {response.status_code}")
    except Exception as e:
        print(f"Case 4: Exception - {e}")

def run_comprehensive_test():
    """Run all tests"""
    print("\n" + "="*60)
    print("ML CLASSIFIER API - COMPREHENSIVE TEST SUITE")
    print("="*60)
    
    try:
        # Test 1: Health Check
        test_health_check()
        
        # Test 2: Get Categories
        test_get_categories()
        
        # Test 3: Single Prediction
        test_single_prediction()
        
        # Test 4: Batch Prediction
        test_batch_prediction()
        
        # Test 5: Model Metrics
        test_model_metrics()
        
        # Test 6: Edge Cases
        test_edge_cases()
        
        print("\n" + "="*60)
        print("ALL TESTS COMPLETED SUCCESSFULLY!")
        print("="*60)
        
    except requests.exceptions.ConnectionError:
        print("\n❌ ERROR: Could not connect to the API.")
        print("Please make sure the server is running on http://localhost:8006")
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    run_comprehensive_test()