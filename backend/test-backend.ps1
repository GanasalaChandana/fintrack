Write-Host "`n Testing Backend Services..." -ForegroundColor Cyan

$services = @(
    @{Name="API Gateway"; URL="https://fintrack-api-gateway.onrender.com/actuator/health"},
    @{Name="Users"; URL="https://fintrack-users-service.onrender.com/actuator/health"},
    @{Name="Transactions"; URL="https://fintrack-transactions-service.onrender.com/actuator/health"},
    @{Name="Alerts"; URL="https://fintrack-alerts-service.onrender.com/actuator/health"},
    @{Name="Reports"; URL="https://fintrack-reports-service.onrender.com/actuator/health"}
)

foreach ($svc in $services) {
    Write-Host "`n $($svc.Name)..." -ForegroundColor Yellow
    try {
        $response = Invoke-RestMethod $svc.URL -TimeoutSec 20
        if ($response.status -eq "UP") {
            Write-Host "    UP - Healthy!" -ForegroundColor Green
        } else {
            Write-Host "     Status: $($response.status)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "     Service may be sleeping (free tier)" -ForegroundColor Yellow
        Write-Host "   Try again in 30 seconds..." -ForegroundColor Gray
    }
}
