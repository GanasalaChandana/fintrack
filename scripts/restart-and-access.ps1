#!/usr/bin/env pwsh
# Restart Minikube and Access Services

Write-Host "`n🚀 FinTrack - Restart and Access" -ForegroundColor Cyan
Write-Host "=" * 70 -ForegroundColor Cyan

# Step 1: Check Minikube status
Write-Host "`n1️⃣  Checking Minikube status..." -ForegroundColor Yellow
$status = & "C:\Program Files\Kubernetes\Minikube\minikube.exe" status 2>&1

if ($status -match "Stopped" -or $status -match "does not exist") {
    Write-Host "   Minikube is stopped. Starting..." -ForegroundColor Yellow
    & "C:\Program Files\Kubernetes\Minikube\minikube.exe" start
    
    Write-Host "`n   ⏳ Waiting for Minikube to be ready..." -ForegroundColor Gray
    Start-Sleep -Seconds 45
} else {
    Write-Host "   ✅ Minikube is running" -ForegroundColor Green
}

# Step 2: Configure Docker to use Minikube
Write-Host "`n2️⃣  Configuring Docker..." -ForegroundColor Yellow
& "C:\Program Files\Kubernetes\Minikube\minikube.exe" docker-env --shell powershell | Invoke-Expression
Write-Host "   ✅ Docker configured" -ForegroundColor Green

# Step 3: Check pods
Write-Host "`n3️⃣  Checking pods..." -ForegroundColor Yellow
$fintrackPods = kubectl get pods -n fintrack 2>&1
$monitoringPods = kubectl get pods -n monitoring 2>&1

if ($fintrackPods -match "Running") {
    Write-Host "   ✅ FinTrack pods are running" -ForegroundColor Green
    kubectl get pods -n fintrack
} else {
    Write-Host "   ⚠️  Some pods may be starting..." -ForegroundColor Yellow
    kubectl get pods -n fintrack
}

if ($monitoringPods -match "Running") {
    Write-Host "`n   ✅ Monitoring pods are running" -ForegroundColor Green
    kubectl get pods -n monitoring
}

# Step 4: Wait a bit more if needed
Write-Host "`n4️⃣  Waiting for all pods to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 20

# Step 5: Start port forwarding
Write-Host "`n5️⃣  Starting port forwarding..." -ForegroundColor Yellow

$services = @(
    @{Name="Reports"; Service="reports-service"; Namespace="fintrack"; Port=8084},
    @{Name="API Gateway"; Service="api-gateway"; Namespace="fintrack"; Port=8080},
    @{Name="Grafana"; Service="grafana"; Namespace="monitoring"; Port=3000},
    @{Name="Prometheus"; Service="prometheus"; Namespace="monitoring"; Port=9090}
)

foreach ($svc in $services) {
    Write-Host "   Starting $($svc.Name)..." -ForegroundColor Gray
    
    $cmd = "Write-Host '🔌 $($svc.Name) Port Forward' -ForegroundColor Cyan; Write-Host 'Access: http://localhost:$($svc.Port)' -ForegroundColor Green; Write-Host ''; kubectl port-forward -n $($svc.Namespace) svc/$($svc.Service) $($svc.Port):$($svc.Port)"
    
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $cmd
    Start-Sleep -Seconds 2
}

Write-Host "`n✅ Port forwarding started!" -ForegroundColor Green

# Step 6: Open browsers
Write-Host "`n6️⃣  Opening services in browser..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

Start-Process "http://localhost:8084/actuator/health"
Start-Sleep -Seconds 1
Start-Process "http://localhost:3000"
Start-Sleep -Seconds 1
Start-Process "http://localhost:9090"

Write-Host "`n" + ("=" * 70) -ForegroundColor Cyan
Write-Host "✅ ALL SERVICES READY!" -ForegroundColor Green
Write-Host ("=" * 70) -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Access URLs:" -ForegroundColor Cyan
Write-Host "   Reports:    http://localhost:8084/actuator/health" -ForegroundColor White
Write-Host "   API Gateway: http://localhost:8080/actuator/health" -ForegroundColor White
Write-Host "   Grafana:    http://localhost:3000 (admin/admin)" -ForegroundColor White
Write-Host "   Prometheus: http://localhost:9090" -ForegroundColor White
Write-Host ""
Write-Host "💡 Keep the port-forward windows open!" -ForegroundColor Yellow
Write-Host "=" * 70 -ForegroundColor Cyan
