#!/usr/bin/env pwsh
# Test All FinTrack Services

Write-Host "`n🧪 FinTrack - Service Health Testing" -ForegroundColor Cyan
Write-Host "=" * 70 -ForegroundColor Cyan

$services = @(
    @{Name="API Gateway"; Port=30080; Path="/actuator/health"},
    @{Name="Users Service"; Port=30081; Path="/actuator/health"},
    @{Name="Transactions"; Port=30082; Path="/actuator/health"},
    @{Name="Alerts"; Port=30083; Path="/actuator/health"},
    @{Name="Reports"; Port=30084; Path="/actuator/health"}
)

Write-Host "`n🔍 Testing service health endpoints..." -ForegroundColor Yellow
Write-Host ""

foreach ($service in $services) {
    Write-Host "Testing $($service.Name)..." -ForegroundColor Gray -NoNewline
    
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$($service.Port)$($service.Path)" -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
        
        if ($response.StatusCode -eq 200) {
            Write-Host " ✅ Healthy" -ForegroundColor Green
            $content = $response.Content | ConvertFrom-Json
            Write-Host "   Status: $($content.status)" -ForegroundColor Gray
        }
    } catch {
        Write-Host " ❌ Not accessible" -ForegroundColor Red
        Write-Host "   Note: Run 'minikube service $($service.Name.ToLower().Replace(' ','-')) -n fintrack' to create tunnel" -ForegroundColor Yellow
    }
}

Write-Host "`n" + ("=" * 70) -ForegroundColor Cyan
Write-Host "💡 To access services:" -ForegroundColor Cyan
Write-Host "   Open separate terminals and run minikube service commands" -ForegroundColor White
Write-Host "=" * 70 -ForegroundColor Cyan
