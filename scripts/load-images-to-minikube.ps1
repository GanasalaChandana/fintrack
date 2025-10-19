#!/usr/bin/env pwsh
# Load All Images to Minikube - Fixed Version

Write-Host "`n Loading FinTrack Images to Minikube" -ForegroundColor Cyan
Write-Host "=" * 70 -ForegroundColor Cyan

$services = @("api-gateway", "alerts-service", "transactions-service", "users-service", "reports-service")
$successful = @()
$failed = @()

# First check if images exist
Write-Host "`n Checking Docker images..." -ForegroundColor Yellow
foreach ($service in $services) {
    $imageName = "fintrack-$service"
    $exists = docker images --format "{{.Repository}}:{{.Tag}}" | Select-String "^${imageName}:latest$"
    
    if ($exists) {
        Write-Host "    $imageName:latest found" -ForegroundColor Green
    } else {
        Write-Host "    $imageName:latest NOT FOUND" -ForegroundColor Red
        $failed += $service
    }
}

# Load to Minikube
if ($failed.Count -eq 0) {
    Write-Host "`n Loading to Minikube..." -ForegroundColor Yellow
    
    foreach ($service in $services) {
        $imageName = "fintrack-$service"
        Write-Host "   Loading $imageName..." -ForegroundColor Gray
        
        # Use proper command syntax
        $cmd = "& 'C:\Program Files\Kubernetes\Minikube\minikube.exe' image load ${imageName}:latest"
        $output = Invoke-Expression $cmd 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "       Loaded" -ForegroundColor Green
            $successful += $service
        } else {
            Write-Host "       Failed" -ForegroundColor Red
            $failed += $service
        }
    }
}

# Summary
Write-Host "`n" + ("=" * 70) -ForegroundColor Cyan
Write-Host " Summary:" -ForegroundColor Cyan

if ($successful.Count -gt 0) {
    Write-Host "    Loaded: $($successful.Count)" -ForegroundColor Green
}

if ($failed.Count -gt 0) {
    Write-Host "    Failed: $($failed.Count)" -ForegroundColor Red
    $failed | ForEach-Object { Write-Host "      - $_" -ForegroundColor Red }
}
