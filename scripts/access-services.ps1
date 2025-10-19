#!/usr/bin/env pwsh
# Access All FinTrack Services

Write-Host "`n🌐 FinTrack - Service Access Guide" -ForegroundColor Cyan
Write-Host "=" * 70 -ForegroundColor Cyan

Write-Host "`n📋 Opening service tunnels..." -ForegroundColor Yellow
Write-Host "Keep these terminals open to maintain access!" -ForegroundColor DarkYellow
Write-Host ""

# Start tunnels in background jobs
$services = @(
    @{Name="api-gateway"; Display="API Gateway"},
    @{Name="users-service"; Display="Users Service"},
    @{Name="transactions-service"; Display="Transactions"},
    @{Name="alerts-service"; Display="Alerts"},
    @{Name="reports-service"; Display="Reports"}
)

$urls = @{}

foreach ($service in $services) {
    Write-Host "Getting URL for $($service.Display)..." -ForegroundColor Gray
    $url = & "C:\Program Files\Kubernetes\Minikube\minikube.exe" service $($service.Name) -n fintrack --url 2>&1 | Select-Object -Last 1
    
    if ($url -match "http") {
        $urls[$service.Name] = $url
        Write-Host "   ✅ $url" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Failed to get URL" -ForegroundColor Red
    }
}

Write-Host "`n🧪 Testing Services..." -ForegroundColor Yellow
Write-Host ""

Start-Sleep -Seconds 3

foreach ($service in $services) {
    $serviceName = $service.Name
    $url = $urls[$serviceName]
    
    if ($url) {
        Write-Host "Testing $($service.Display)..." -ForegroundColor Cyan -NoNewline
        
        try {
            $response = Invoke-WebRequest -Uri "$url/actuator/health" -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
            
            if ($response.StatusCode -eq 200) {
                Write-Host " ✅ Healthy" -ForegroundColor Green
                $healthData = $response.Content | ConvertFrom-Json
                Write-Host "   URL: $url" -ForegroundColor Gray
                Write-Host "   Status: $($healthData.status)" -ForegroundColor Gray
            }
        } catch {
            Write-Host " ⚠️  Service starting..." -ForegroundColor Yellow
            Write-Host "   URL: $url" -ForegroundColor Gray
        }
        Write-Host ""
    }
}

Write-Host "=" * 70 -ForegroundColor Cyan
Write-Host "📝 Service URLs Summary" -ForegroundColor Cyan
Write-Host "=" * 70 -ForegroundColor Cyan
Write-Host ""

foreach ($service in $services) {
    $serviceName = $service.Name
    $url = $urls[$serviceName]
    if ($url) {
        Write-Host "$($service.Display):"
        Write-Host "   Health: $url/actuator/health" -ForegroundColor White
        Write-Host "   Metrics: $url/actuator/metrics" -ForegroundColor White
        Write-Host "   Info: $url/actuator/info" -ForegroundColor White
        Write-Host ""
    }
}

Write-Host "=" * 70 -ForegroundColor Cyan
Write-Host "💡 Tip: Keep the minikube tunnel terminals open!" -ForegroundColor Yellow
Write-Host "=" * 70 -ForegroundColor Cyan
