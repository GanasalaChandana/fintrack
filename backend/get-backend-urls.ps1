Write-Host "`n Your Backend Service URLs:" -ForegroundColor Cyan
Write-Host "=" * 70 -ForegroundColor Cyan

$services = @(
    "fintrack-api-gateway",
    "fintrack-users-service",
    "fintrack-transactions-service",
    "fintrack-alerts-service",
    "fintrack-reports-service"
)

foreach ($svc in $services) {
    $url = "https://$svc.onrender.com"
    Write-Host "`n $svc" -ForegroundColor Yellow
    Write-Host "   URL: $url" -ForegroundColor White
    Write-Host "   Health: $url/actuator/health" -ForegroundColor Gray
}

Write-Host "`n" + ("=" * 70) -ForegroundColor Cyan
