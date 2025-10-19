#!/usr/bin/env pwsh
# Port Forward with Non-Conflicting Ports

Write-Host "`n🔌 FinTrack - Port Forwarding (Fixed Ports)" -ForegroundColor Cyan
Write-Host "=" * 70 -ForegroundColor Cyan

# Using 90XX ports to avoid conflicts
$services = @(
    @{Name="Reports"; Service="reports-service"; Namespace="fintrack"; LocalPort=9084; RemotePort=8084},
    @{Name="API Gateway"; Service="api-gateway"; Namespace="fintrack"; LocalPort=9080; RemotePort=8080},
    @{Name="Users"; Service="users-service"; Namespace="fintrack"; LocalPort=9081; RemotePort=8081},
    @{Name="Transactions"; Service="transactions-service"; Namespace="fintrack"; LocalPort=9082; RemotePort=8082},
    @{Name="Alerts"; Service="alerts-service"; Namespace="fintrack"; LocalPort=9083; RemotePort=8083},
    @{Name="Grafana"; Service="grafana"; Namespace="monitoring"; LocalPort=3000; RemotePort=3000},
    @{Name="Prometheus"; Service="prometheus"; Namespace="monitoring"; LocalPort=9090; RemotePort=9090}
)

Write-Host "`n📋 Starting port forwarding..." -ForegroundColor Yellow
Write-Host ""

foreach ($svc in $services) {
    Write-Host "   ✅ $($svc.Name) -> localhost:$($svc.LocalPort)" -ForegroundColor Green
    
    $cmd = @"
Write-Host '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' -ForegroundColor Cyan
Write-Host '🔌 $($svc.Name) Port Forward' -ForegroundColor White
Write-Host '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' -ForegroundColor Cyan
Write-Host ''
Write-Host '✅ Access at: http://localhost:$($svc.LocalPort)' -ForegroundColor Green
Write-Host ''
Write-Host '⚠️  Keep this window open!' -ForegroundColor Yellow
Write-Host ''
kubectl port-forward -n $($svc.Namespace) svc/$($svc.Service) $($svc.LocalPort):$($svc.RemotePort)
"@
    
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $cmd
    Start-Sleep -Seconds 2
}

Write-Host "`n✅ All port forwards started!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Access URLs:" -ForegroundColor Cyan
Write-Host "   Reports:      http://localhost:9084/actuator/health" -ForegroundColor White
Write-Host "   API Gateway:  http://localhost:9080/actuator/health" -ForegroundColor White
Write-Host "   Users:        http://localhost:9081/actuator/health" -ForegroundColor White
Write-Host "   Transactions: http://localhost:9082/actuator/health" -ForegroundColor White
Write-Host "   Alerts:       http://localhost:9083/actuator/health" -ForegroundColor White
Write-Host "   Grafana:      http://localhost:3000 (admin/admin)" -ForegroundColor White
Write-Host "   Prometheus:   http://localhost:9090" -ForegroundColor White
Write-Host ""

# Wait then open browsers
Start-Sleep -Seconds 5
Write-Host "🌐 Opening services in browser..." -ForegroundColor Cyan

Start-Process "http://localhost:9084/actuator/health"
Start-Sleep -Seconds 1
Start-Process "http://localhost:3000"
Start-Sleep -Seconds 1
Start-Process "http://localhost:9090"

Write-Host "`n✅ Services opened!" -ForegroundColor Green
Write-Host "   Keep the port-forward windows open!" -ForegroundColor Yellow
Write-Host ""
Write-Host "=" * 70 -ForegroundColor Cyan
