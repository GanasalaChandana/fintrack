from fastapi import FastAPI, HTTPException, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import httpx
import os
from typing import Optional
import redis
from datetime import datetime

app = FastAPI(title="FinTrack API Gateway")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://fintrack-git-main-ganasalachandanas-projects.vercel.app",
        "http://localhost:3000",
        "http://localhost:3001"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Service URLs from environment variables
SERVICES = {
    'transactions': os.getenv('TRANSACTIONS_SERVICE_URL', 'http://localhost:8001'),
    'reports': os.getenv('REPORTS_SERVICE_URL', 'http://localhost:8002'),
    'alerts': os.getenv('ALERTS_SERVICE_URL', 'http://localhost:8003'),
    'users': os.getenv('USERS_SERVICE_URL', 'http://localhost:8004'),
    'ml_classifier': os.getenv('ML_CLASSIFIER_URL', 'http://localhost:8005'),
}

# Redis connection for caching (optional)
redis_client = None
try:
    redis_url = os.getenv('REDIS_URL')
    if redis_url:
        redis_client = redis.from_url(redis_url, decode_responses=True)
        print("Redis connected successfully")
except Exception as e:
    print(f"Redis connection failed: {e}")

# HTTP client with timeout
http_client = httpx.AsyncClient(timeout=30.0)

@app.on_event("shutdown")
async def shutdown_event():
    await http_client.aclose()

@app.get("/")
async def root():
    return {
        "service": "FinTrack API Gateway",
        "version": "1.0.0",
        "status": "running",
        "services": list(SERVICES.keys())
    }

@app.get("/health")
async def health_check():
    """Check health of all services"""
    health_status = {}
    
    for service_name, service_url in SERVICES.items():
        try:
            response = await http_client.get(f"{service_url}/health", timeout=5.0)
            health_status[service_name] = {
                "status": "healthy" if response.status_code == 200 else "unhealthy",
                "url": service_url
            }
        except Exception as e:
            health_status[service_name] = {
                "status": "unreachable",
                "error": str(e)
            }
    
    return {
        "gateway": "healthy",
        "services": health_status,
        "timestamp": datetime.now().isoformat()
    }

async def proxy_request(
    service_name: str,
    endpoint: str,
    method: str = "GET",
    data: Optional[dict] = None,
    headers: Optional[dict] = None
):
    """Proxy requests to microservices"""
    
    if service_name not in SERVICES:
        raise HTTPException(status_code=404, detail=f"Service {service_name} not found")
    
    service_url = SERVICES[service_name]
    url = f"{service_url}{endpoint}"
    
    try:
        response = await http_client.request(
            method=method,
            url=url,
            json=data,
            headers=headers
        )
        
        if response.status_code >= 400:
            return JSONResponse(
                status_code=response.status_code,
                content={"error": response.text}
            )
        
        return JSONResponse(
            status_code=response.status_code,
            content=response.json()
        )
    
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail=f"Service {service_name} timeout")
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Service {service_name} error: {str(e)}")

# ============= TRANSACTION ROUTES =============
@app.get("/api/transactions")
async def get_transactions(request: Request):
    """Get all transactions for a user"""
    return await proxy_request(
        "transactions",
        f"/transactions?{request.query_params}",
        method="GET",
        headers=dict(request.headers)
    )

@app.post("/api/transactions")
async def create_transaction(request: Request):
    """Create a new transaction with ML classification"""
    data = await request.json()
    
    # First, classify the transaction using ML
    try:
        classify_response = await http_client.post(
            f"{SERVICES['ml_classifier']}/classify",
            json={
                "description": data.get("description", ""),
                "amount": data.get("amount", 0),
                "merchant": data.get("merchant", "")
            }
        )
        
        if classify_response.status_code == 200:
            classification = classify_response.json()
            data["category"] = classification.get("category")
            data["ml_confidence"] = classification.get("confidence")
    except Exception as e:
        print(f"ML Classification failed: {e}")
        # Continue without classification
    
    # Create the transaction
    return await proxy_request(
        "transactions",
        "/transactions",
        method="POST",
        data=data,
        headers=dict(request.headers)
    )

@app.get("/api/transactions/{transaction_id}")
async def get_transaction(transaction_id: str, request: Request):
    """Get a specific transaction"""
    return await proxy_request(
        "transactions",
        f"/transactions/{transaction_id}",
        method="GET",
        headers=dict(request.headers)
    )

@app.put("/api/transactions/{transaction_id}")
async def update_transaction(transaction_id: str, request: Request):
    """Update a transaction"""
    data = await request.json()
    return await proxy_request(
        "transactions",
        f"/transactions/{transaction_id}",
        method="PUT",
        data=data,
        headers=dict(request.headers)
    )

@app.delete("/api/transactions/{transaction_id}")
async def delete_transaction(transaction_id: str, request: Request):
    """Delete a transaction"""
    return await proxy_request(
        "transactions",
        f"/transactions/{transaction_id}",
        method="DELETE",
        headers=dict(request.headers)
    )

# ============= REPORTS ROUTES =============
@app.get("/api/reports/summary")
async def get_summary(request: Request):
    """Get financial summary report"""
    return await proxy_request(
        "reports",
        f"/reports/summary?{request.query_params}",
        method="GET",
        headers=dict(request.headers)
    )

@app.get("/api/reports/category-breakdown")
async def get_category_breakdown(request: Request):
    """Get spending by category"""
    return await proxy_request(
        "reports",
        f"/reports/category-breakdown?{request.query_params}",
        method="GET",
        headers=dict(request.headers)
    )

@app.get("/api/reports/trends")
async def get_trends(request: Request):
    """Get spending trends over time"""
    return await proxy_request(
        "reports",
        f"/reports/trends?{request.query_params}",
        method="GET",
        headers=dict(request.headers)
    )

# ============= ALERTS ROUTES =============
@app.get("/api/alerts")
async def get_alerts(request: Request):
    """Get all alerts for a user"""
    return await proxy_request(
        "alerts",
        f"/alerts?{request.query_params}",
        method="GET",
        headers=dict(request.headers)
    )

@app.post("/api/alerts")
async def create_alert(request: Request):
    """Create a new alert"""
    data = await request.json()
    return await proxy_request(
        "alerts",
        "/alerts",
        method="POST",
        data=data,
        headers=dict(request.headers)
    )

# ============= USER ROUTES =============
@app.post("/api/auth/register")
async def register(request: Request):
    """Register a new user"""
    data = await request.json()
    return await proxy_request(
        "users",
        "/auth/register",
        method="POST",
        data=data
    )

@app.post("/api/auth/login")
async def login(request: Request):
    """Login user"""
    data = await request.json()
    return await proxy_request(
        "users",
        "/auth/login",
        method="POST",
        data=data
    )

@app.get("/api/users/me")
async def get_current_user(request: Request):
    """Get current user profile"""
    return await proxy_request(
        "users",
        "/users/me",
        method="GET",
        headers=dict(request.headers)
    )

# ============= ML CLASSIFICATION ROUTES =============
@app.post("/api/classify")
async def classify_transaction(request: Request):
    """Classify a transaction using ML"""
    data = await request.json()
    return await proxy_request(
        "ml_classifier",
        "/classify",
        method="POST",
        data=data
    )

@app.post("/api/classify/batch")
async def batch_classify(request: Request):
    """Classify multiple transactions"""
    data = await request.json()
    return await proxy_request(
        "ml_classifier",
        "/batch-classify",
        method="POST",
        data=data
    )

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)