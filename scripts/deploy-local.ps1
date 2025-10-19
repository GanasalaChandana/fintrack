#!/usr/bin/env pwsh
# Local Kubernetes Deployment Script

param(
    [string]$ImageTag = "latest"
)

Write-Host " Deploying to Local Kubernetes..." -ForegroundColor Cyan

# Build the Docker image
Write-Host " Building Docker image..." -ForegroundColor Yellow
docker build -t fintrack-reports-service:$ImageTag -f backend/reports-service/Dockerfile .

# Load image into Minikube
Write-Host " Loading image into Minikube..." -ForegroundColor Yellow
& "C:\Program Files\Kubernetes\Minikube\minikube.exe" image load fintrack-reports-service:$ImageTag

# Apply Kubernetes manifests
Write-Host "  Applying Kubernetes manifests..." -ForegroundColor Yellow
kubectl apply -f infra/k8s/base/

# Wait for deployment
Write-Host " Waiting for deployment to complete..." -ForegroundColor Yellow
kubectl wait --for=condition=available --timeout=300s deployment/reports-service -n fintrack

# Show status
Write-Host "`n Deployment Status:" -ForegroundColor Green
kubectl get pods -n fintrack
kubectl get svc -n fintrack

# Get service URL
Write-Host "`n Service URL:" -ForegroundColor Cyan
& "C:\Program Files\Kubernetes\Minikube\minikube.exe" service reports-service -n fintrack --url

Write-Host "`n Deployment complete!" -ForegroundColor Green
