#!/usr/bin/env pwsh
# End-to-End Connection Test

Write-Host "`n FinTrack - End-to-End Connection Test" -ForegroundColor Cyan
Write-Host "=" * 70 -ForegroundColor Cyan

# Configuration
$frontendUrl = "https://fintrack-git-main-ganasalachandanas-projects.vercel.app"
$apiGatewayUrl = "https://fintrack-api-gateway.onrender.com"

# Test 1: Frontend is accessible
Write-Host "`n1  Testing Frontend..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest $frontendUrl -UseBasicParsing -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "    Frontend is UP and accessible!" -ForegroundColor Green
    }
} catch {
    Write-Host "    Frontend not accessible" -ForegroundColor Red
}

# Test 2: API Gateway is accessible
Write-Host "`n2  Testing API Gateway..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod "$apiGatewayUrl/actuator/health" -TimeoutSec 10
    Write-Host "    API Gateway Status: $($response.status)" -ForegroundColor Green
} catch {
    Write-Host "    API Gateway not responding" -ForegroundColor Red
}

# Test 3: CORS Configuration
Write-Host "`n3  Testing CORS..." -ForegroundColor Yellow
try {
    $headers = @{
        "Origin" = $frontendUrl
        "Access-Control-Request-Method" = "GET"
    }
    $response = Invoke-WebRequest `
        -Uri "$apiGatewayUrl/actuator/health" `
        -Headers $headers `
        -Method Options `
        -UseBasicParsing `
        -TimeoutSec 10
    
    if ($response.Headers['Access-Control-Allow-Origin']) {
        Write-Host "    CORS is configured correctly!" -ForegroundColor Green
        Write-Host "      Allow-Origin: $($response.Headers['Access-Control-Allow-Origin'])" -ForegroundColor Gray
    }
} catch {
    Write-Host "     CORS might need configuration" -ForegroundColor Yellow
    Write-Host "      Error: $($_.Exception.Message)" -ForegroundColor DarkYellow
}

# Test 4: All Backend Services
Write-Host "`n4  Testing Backend Services..." -ForegroundColor Yellow

$services = @{
    "Users" = "https://fintrack-users-service.onrender.com"
    "Transactions" = "https://fintrack-transactions-service.onrender.com"
    "Alerts" = "https://fintrack-alerts-service.onrender.com"
    "Reports" = "https://fintrack-reports-service.onrender.com"
}

foreach ($name in $services.Keys) {
    try {
        $response = Invoke-RestMethod "$($services[$name])/actuator/health" -TimeoutSec 10
        Write-Host "    $name Service: $($response.status)" -ForegroundColor Green
    } catch {
        Write-Host "     $name Service: Warming up (free tier)" -ForegroundColor Yellow
    }
    Start-Sleep -Seconds 1
}

# Summary
Write-Host "`n" + ("=" * 70) -ForegroundColor Cyan
Write-Host " SUMMARY" -ForegroundColor Cyan
Write-Host ("=" * 70) -ForegroundColor Cyan

Write-Host "`n Your Live URLs:" -ForegroundColor Yellow
Write-Host "   Frontend:    $frontendUrl" -ForegroundColor White
Write-Host "   API Gateway: $apiGatewayUrl" -ForegroundColor White

Write-Host "`n Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Open frontend in browser" -ForegroundColor White
Write-Host "   2. Press F12 to open DevTools" -ForegroundColor White
Write-Host "   3. Go to Network tab" -ForegroundColor White
Write-Host "   4. Interact with the app" -ForegroundColor White
Write-Host "   5. Check for API calls to Render" -ForegroundColor White

Write-Host "`n" + ("=" * 70) -ForegroundColor Cyan
