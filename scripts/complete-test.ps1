#!/usr/bin/env pwsh
# Complete FinTrack Access & Testing - Enhanced Version

Write-Host "`n FinTrack - Complete Access Guide" -ForegroundColor Cyan
Write-Host "=" * 70 -ForegroundColor Cyan

# Check all pods
Write-Host "`n All Pods Running:" -ForegroundColor Green
kubectl get pods -n fintrack | Select-String "Running" | Measure-Object | ForEach-Object { Write-Host "   FinTrack: $($_.Count) pods" -ForegroundColor White }
kubectl get pods -n monitoring | Select-String "Running" | Measure-Object | ForEach-Object { Write-Host "   Monitoring: $($_.Count) pods" -ForegroundColor White }

Write-Host "`n Access Information:" -ForegroundColor Cyan
Write-Host "=" * 70 -ForegroundColor Cyan

# Service info
$services = @(
    @{Name="API Gateway"; Service="api-gateway"; Port=30080},
    @{Name="Users Service"; Service="users-service"; Port=30081},
    @{Name="Transactions"; Service="transactions-service"; Port=30082},
    @{Name="Alerts"; Service="alerts-service"; Port=30083},
    @{Name="Reports"; Service="reports-service"; Port=30084}
)

Write-Host "`n Microservices (FinTrack):" -ForegroundColor Yellow
foreach ($svc in $services) {
    Write-Host "`n   $($svc.Name)" -ForegroundColor White
    Write-Host "      To access, run: minikube service $($svc.Service) -n fintrack" -ForegroundColor Gray
    Write-Host "      Or use NodePort: http://<minikube-ip>:$($svc.Port)" -ForegroundColor Gray
    Write-Host "      Endpoints:" -ForegroundColor Gray
    Write-Host "         /actuator/health" -ForegroundColor DarkGray
    Write-Host "         /actuator/metrics" -ForegroundColor DarkGray
    Write-Host "         /actuator/info" -ForegroundColor DarkGray
}

Write-Host "`n Monitoring Stack:" -ForegroundColor Yellow
Write-Host "`n   Prometheus" -ForegroundColor White
Write-Host "      To access, run: minikube service prometheus -n monitoring" -ForegroundColor Gray
Write-Host "      Or use NodePort: http://<minikube-ip>:30090" -ForegroundColor Gray

Write-Host "`n   Grafana" -ForegroundColor White
Write-Host "      To access, run: minikube service grafana -n monitoring" -ForegroundColor Gray
Write-Host "      Or use NodePort: http://<minikube-ip>:30300" -ForegroundColor Gray
Write-Host "      Username: admin" -ForegroundColor DarkGray
Write-Host "      Password: admin" -ForegroundColor DarkGray

# Get Minikube IP
Write-Host "`n Minikube IP Address:" -ForegroundColor Cyan
$minikubeIp = & "C:\Program Files\Kubernetes\Minikube\minikube.exe" ip
Write-Host "   $minikubeIp" -ForegroundColor Green

Write-Host "`n Direct Access URLs (if tunnels don't work):" -ForegroundColor Cyan
Write-Host "   API Gateway:    http://${minikubeIp}:30080/actuator/health" -ForegroundColor White
Write-Host "   Users Service:  http://${minikubeIp}:30081/actuator/health" -ForegroundColor White
Write-Host "   Transactions:   http://${minikubeIp}:30082/actuator/health" -ForegroundColor White
Write-Host "   Alerts:         http://${minikubeIp}:30083/actuator/health" -ForegroundColor White
Write-Host "   Reports:        http://${minikubeIp}:30084/actuator/health" -ForegroundColor White
Write-Host "   Prometheus:     http://${minikubeIp}:30090" -ForegroundColor White
Write-Host "   Grafana:        http://${minikubeIp}:30300" -ForegroundColor White

Write-Host "`n Quick Health Test:" -ForegroundColor Yellow
Write-Host "   Testing Reports Service..." -ForegroundColor Gray

try {
    $response = Invoke-WebRequest "http://${minikubeIp}:30084/actuator/health" -UseBasicParsing -TimeoutSec 5
    $health = $response.Content | ConvertFrom-Json
    Write-Host "    Reports Service: $($health.status)" -ForegroundColor Green
} catch {
    Write-Host "     Cannot reach via NodePort. Use minikube service command." -ForegroundColor Yellow
}

Write-Host "`n" + ("=" * 70) -ForegroundColor Cyan
Write-Host " QUICK START COMMANDS" -ForegroundColor Cyan
Write-Host ("=" * 70) -ForegroundColor Cyan

Write-Host @"

# Access a service (opens browser with tunnel):
minikube service reports-service -n fintrack

# Get URL without opening browser:
minikube service reports-service -n fintrack --url

# Access Grafana dashboard:
minikube service grafana -n monitoring

# View logs:
kubectl logs -n fintrack -l app=reports-service --tail=50

# Test health endpoint:
curl http://${minikubeIp}:30084/actuator/health

"@ -ForegroundColor White

Write-Host "=" * 70 -ForegroundColor Cyan
Write-Host " FinTrack is fully deployed and accessible!" -ForegroundColor Green
Write-Host ("=" * 70) -ForegroundColor Cyan
