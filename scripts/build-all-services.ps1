#!/usr/bin/env pwsh
# Master Build Script for FinTrack

param(
    [switch]$BuildBackend = $true,
    [switch]$BuildFrontend = $false,
    [switch]$Verbose = $false
)

Write-Host "`n FinTrack Master Build" -ForegroundColor Cyan
Write-Host "=" * 70 -ForegroundColor Cyan

$results = @{
    Success = @()
    Failed = @()
    Skipped = @()
}

# Backend Services
if ($BuildBackend) {
    $services = @("alerts-service", "api-gateway", "reports-service", "transactions-service", "users-service")
    
    foreach ($service in $services) {
        Write-Host "`n Building: $service" -ForegroundColor Yellow
        
        # Check prerequisites
        if (-not (Test-Path "backend\$service\Dockerfile")) {
            Write-Host "     No Dockerfile found, skipping..." -ForegroundColor DarkYellow
            $results.Skipped += $service
            continue
        }
        
        if (-not (Test-Path "backend\$service\pom.xml")) {
            Write-Host "     No pom.xml found, skipping..." -ForegroundColor DarkYellow
            $results.Skipped += $service
            continue
        }
        
        # Build with Docker
        Write-Host "   Building Docker image..." -ForegroundColor Gray
        $output = docker build -t "fintrack-$service:latest" -f "backend\$service\Dockerfile" . 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "    Success!" -ForegroundColor Green
            $results.Success += $service
        } else {
            Write-Host "    Failed!" -ForegroundColor Red
            $results.Failed += $service
            if ($Verbose) {
                Write-Host $output -ForegroundColor DarkRed
            }
        }
    }
}

# Frontend
if ($BuildFrontend) {
    Write-Host "`n  Building: Frontend" -ForegroundColor Yellow
    
    if (Test-Path "frontend\web\Dockerfile") {
        $output = docker build -t "fintrack-frontend:latest" -f "frontend\web\Dockerfile" . 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "    Success!" -ForegroundColor Green
            $results.Success += "frontend"
        } else {
            Write-Host "    Failed!" -ForegroundColor Red
            $results.Failed += "frontend"
            if ($Verbose) {
                Write-Host $output -ForegroundColor DarkRed
            }
        }
    } else {
        Write-Host "     No Dockerfile found" -ForegroundColor DarkYellow
        $results.Skipped += "frontend"
    }
}

# Summary
Write-Host "`n" + ("=" * 70) -ForegroundColor Cyan
Write-Host " Build Summary" -ForegroundColor Cyan
Write-Host ("=" * 70) -ForegroundColor Cyan

if ($results.Success.Count -gt 0) {
    Write-Host "`n Successful ($($results.Success.Count)):" -ForegroundColor Green
    $results.Success | ForEach-Object { Write-Host "    $_" -ForegroundColor Green }
}

if ($results.Failed.Count -gt 0) {
    Write-Host "`n Failed ($($results.Failed.Count)):" -ForegroundColor Red
    $results.Failed | ForEach-Object { Write-Host "    $_" -ForegroundColor Red }
}

if ($results.Skipped.Count -gt 0) {
    Write-Host "`n  Skipped ($($results.Skipped.Count)):" -ForegroundColor Yellow
    $results.Skipped | ForEach-Object { Write-Host "    $_" -ForegroundColor Yellow }
}

# Show Docker images
Write-Host "`n Docker Images:" -ForegroundColor Cyan
docker images | Select-String "fintrack"

# Exit code
if ($results.Failed.Count -eq 0) {
    Write-Host "`n All builds completed successfully!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "`n  Some builds failed. Run with -Verbose for details." -ForegroundColor Yellow
    exit 1
}
