#!/usr/bin/env pwsh
# Get All Service URLs from Render

Write-Host "`n FinTrack Production Service URLs" -ForegroundColor Cyan
Write-Host "=" * 70 -ForegroundColor Cyan

$services = @(
    "fintrack-api-gateway",
    "fintrack-users-service",
    "fintrack-transactions-service",
    "fintrack-alerts-service",
    "fintrack-reports-service"
)

Write-Host "`n Service URLs (check Render dashboard for exact URLs):" -ForegroundColor Yellow
Write-Host ""

foreach ($service in $services) {
    Write-Host "   $service" -ForegroundColor White
    Write-Host "      https://$service.onrender.com/actuator/health" -ForegroundColor Green
    Write-Host ""
}

Write-Host "`n Test Commands:" -ForegroundColor Yellow
Write-Host ""
Write-Host "   # Test Reports Service" -ForegroundColor Gray
Write-Host "   curl https://fintrack-reports-service.onrender.com/actuator/health" -ForegroundColor White
Write-Host ""
Write-Host "   # Test API Gateway" -ForegroundColor Gray
Write-Host "   curl https://fintrack-api-gateway.onrender.com/actuator/health" -ForegroundColor White
Write-Host ""

Write-Host "=" * 70 -ForegroundColor Cyan
