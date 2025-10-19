#!/usr/bin/env pwsh
# Complete FinTrack Deployment

Write-Host "`n🚀 FinTrack - Complete Deployment" -ForegroundColor Cyan
Write-Host "=" * 70 -ForegroundColor Cyan

# Configure Docker to use Minikube
Write-Host "`n🔧 Configuring Docker to use Minikube..." -ForegroundColor Yellow
& "C:\Program Files\Kubernetes\Minikube\minikube.exe" docker-env --shell powershell | Invoke-Expression
Write-Host "✅ Using Minikube's Docker daemon" -ForegroundColor Green

# Verify images
Write-Host "`n🐳 Available images in Minikube:" -ForegroundColor Cyan
docker images | Select-String "fintrack"

# Deploy to Kubernetes
Write-Host "`n☸️  Deploying to Kubernetes..." -ForegroundColor Yellow
kubectl apply -f infra/k8s/base/

# Wait for pods
Write-Host "`n⏳ Waiting for pods to be ready (40 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 40

# Check status
Write-Host "`n" + ("=" * 70) -ForegroundColor Cyan
Write-Host "📊 Deployment Status" -ForegroundColor Cyan
Write-Host ("=" * 70) -ForegroundColor Cyan

Write-Host "`n🔷 Pods:" -ForegroundColor Cyan
kubectl get pods -n fintrack

Write-Host "`n🔷 Services:" -ForegroundColor Cyan
kubectl get svc -n fintrack

# Show access URLs
Write-Host "`n" + ("=" * 70) -ForegroundColor Cyan
Write-Host "🌐 Service Access (via Minikube tunnel)" -ForegroundColor Cyan
Write-Host ("=" * 70) -ForegroundColor Cyan

Write-Host @"

To access services, open NEW terminal windows and run:

1. API Gateway (Port 30080):
   minikube service api-gateway -n fintrack

2. Users Service (Port 30081):
   minikube service users-service -n fintrack

3. Transactions (Port 30082):
   minikube service transactions-service -n fintrack

4. Alerts (Port 30083):
   minikube service alerts-service -n fintrack

5. Reports (Port 30084):
   minikube service reports-service -n fintrack

"@ -ForegroundColor Yellow

Write-Host "`n✅ Deployment complete!" -ForegroundColor Green
Write-Host "=" * 70 -ForegroundColor Cyan
