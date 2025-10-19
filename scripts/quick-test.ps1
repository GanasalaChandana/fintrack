#!/usr/bin/env pwsh
# Quick Service Test via curl

Write-Host "`n Testing Services via Minikube Tunnels" -ForegroundColor Cyan
Write-Host "=" * 70 -ForegroundColor Cyan

$services = @("reports-service", "api-gateway", "users-service", "transactions-service", "alerts-service")

Write-Host "`n Getting service URLs..." -ForegroundColor Yellow

foreach ($svc in $services) {
    Write-Host "`n $svc" -ForegroundColor Cyan
    $url = & "C:\Program Files\Kubernetes\Minikube\minikube.exe" service $svc -n fintrack --url 2>&1 | Select-Object -Last 1
    
    if ($url -match "http://") {
        Write-Host "   URL: $url" -ForegroundColor Green
        
        # Test health endpoint
        try {
            $response = Invoke-RestMethod "$url/actuator/health" -TimeoutSec 5 -ErrorAction Stop
            Write-Host "   Status: $($response.status) " -ForegroundColor Green
        } catch {
            Write-Host "   Status: Not responding " -ForegroundColor Yellow
        }
    } else {
        Write-Host "   Could not get URL " -ForegroundColor Red
    }
}

Write-Host "`n" + ("=" * 70) -ForegroundColor Cyan
