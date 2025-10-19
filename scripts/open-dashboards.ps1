#!/usr/bin/env pwsh
# Open All Dashboards

$minikubeIp = & "C:\Program Files\Kubernetes\Minikube\minikube.exe" ip

Write-Host "`n Opening all dashboards..." -ForegroundColor Cyan

# Open services
Start-Process "http://${minikubeIp}:30080/actuator/health"  # API Gateway
Start-Sleep -Seconds 1
Start-Process "http://${minikubeIp}:30084/actuator/health"  # Reports
Start-Sleep -Seconds 1
Start-Process "http://${minikubeIp}:30090"  # Prometheus
Start-Sleep -Seconds 1
Start-Process "http://${minikubeIp}:30300"  # Grafana

Write-Host " All dashboards opened!" -ForegroundColor Green
Write-Host "   Grafana credentials: admin/admin" -ForegroundColor Yellow
