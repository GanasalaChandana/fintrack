#!/usr/bin/env pwsh
# Get All Service URLs

Write-Host "`n🌐 FinTrack - Service URLs" -ForegroundColor Cyan
Write-Host "=" * 70 -ForegroundColor Cyan

$services = @("api-gateway", "users-service", "transactions-service", "alerts-service", "reports-service")

Write-Host "`n📋 Getting service URLs (this will open tunnels)..." -ForegroundColor Yellow
Write-Host "Note: Keep these terminals open!" -ForegroundColor DarkYellow
Write-Host ""

foreach ($service in $services) {
    Write-Host "🔗 $service" -ForegroundColor Cyan
    $url = & "C:\Program Files\Kubernetes\Minikube\minikube.exe" service $service -n fintrack --url
    Write-Host "   $url" -ForegroundColor White
    Write-Host ""
}

Write-Host "=" * 70 -ForegroundColor Cyan
