#!/usr/bin/env pwsh
# Launch Multiple Service Tunnels

Write-Host "`n Launching Service Tunnels..." -ForegroundColor Cyan
Write-Host "=" * 70 -ForegroundColor Cyan

$services = @(
    @{Name="Reports"; Service="reports-service"; Namespace="fintrack"},
    @{Name="API Gateway"; Service="api-gateway"; Namespace="fintrack"},
    @{Name="Grafana"; Service="grafana"; Namespace="monitoring"},
    @{Name="Prometheus"; Service="prometheus"; Namespace="monitoring"}
)

Write-Host "`n Starting tunnels for all services..." -ForegroundColor Yellow
Write-Host "   Opening new PowerShell windows..." -ForegroundColor Gray
Write-Host ""

foreach ($svc in $services) {
    Write-Host "   Starting tunnel for $($svc.Name)..." -ForegroundColor Cyan
    
    $command = "& 'C:\Program Files\Kubernetes\Minikube\minikube.exe' service $($svc.Service) -n $($svc.Namespace); Read-Host 'Press Enter to close'"
    
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $command
    Start-Sleep -Seconds 2
}

Write-Host "`n All tunnels started!" -ForegroundColor Green
Write-Host "   Check the new PowerShell windows for service URLs" -ForegroundColor Yellow
Write-Host "   Keep those windows open to maintain access!" -ForegroundColor Yellow
Write-Host ""
Write-Host "=" * 70 -ForegroundColor Cyan
