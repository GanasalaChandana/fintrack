#!/usr/bin/env pwsh
# Service Tunnel Manager

Write-Host "`n FinTrack - Service Tunnel Manager" -ForegroundColor Cyan
Write-Host "=" * 70 -ForegroundColor Cyan

$services = @(
    @{Name="Reports Service"; Service="reports-service"; Namespace="fintrack"},
    @{Name="API Gateway"; Service="api-gateway"; Namespace="fintrack"},
    @{Name="Users Service"; Service="users-service"; Namespace="fintrack"},
    @{Name="Grafana"; Service="grafana"; Namespace="monitoring"},
    @{Name="Prometheus"; Service="prometheus"; Namespace="monitoring"}
)

Write-Host "`n Available Services:" -ForegroundColor Yellow
for ($i = 0; $i -lt $services.Count; $i++) {
    Write-Host "   [$($i+1)] $($services[$i].Name)" -ForegroundColor White
}

Write-Host "`n Choose a service to access (1-$($services.Count)): " -ForegroundColor Cyan -NoNewline
$choice = Read-Host

if ($choice -match '^\d+$' -and [int]$choice -ge 1 -and [int]$choice -le $services.Count) {
    $selected = $services[[int]$choice - 1]
    Write-Host "`n Opening $($selected.Name)..." -ForegroundColor Green
    Write-Host "   Keep this window open to maintain the tunnel!" -ForegroundColor Yellow
    Write-Host ""
    
    & "C:\Program Files\Kubernetes\Minikube\minikube.exe" service $selected.Service -n $selected.Namespace
} else {
    Write-Host "`n Invalid choice!" -ForegroundColor Red
}
