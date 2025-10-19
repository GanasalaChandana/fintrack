#!/usr/bin/env pwsh
# Port Forward Method - Most Reliable

Write-Host "`n Using Port Forwarding (Most Reliable Method)" -ForegroundColor Cyan
Write-Host "=" * 70 -ForegroundColor Cyan

Write-Host "`nThis will forward services to localhost ports." -ForegroundColor Yellow
Write-Host "Keep this window open!" -ForegroundColor Yellow

# Get pod names
$reportsPod = kubectl get pods -n fintrack -l app=reports-service -o jsonpath='{.items[0].metadata.name}'
$grafanaPod = kubectl get pods -n monitoring -l app=grafana -o jsonpath='{.items[0].metadata.name}'

Write-Host "`n Forwarding Reports Service to localhost:8084..." -ForegroundColor Green
Write-Host "   Access at: http://localhost:8084/actuator/health" -ForegroundColor White

Start-Process powershell -ArgumentList "-NoExit", "-Command", "kubectl port-forward -n fintrack $reportsPod 8084:8084"

Start-Sleep -Seconds 2

Write-Host "`n Forwarding Grafana to localhost:3000..." -ForegroundColor Green
Write-Host "   Access at: http://localhost:3000" -ForegroundColor White
Write-Host "   Credentials: admin / admin" -ForegroundColor Yellow

Start-Process powershell -ArgumentList "-NoExit", "-Command", "kubectl port-forward -n monitoring $grafanaPod 3000:3000"

Start-Sleep -Seconds 3

# Open browsers
Write-Host "`n Opening services in browser..." -ForegroundColor Cyan
Start-Process "http://localhost:8084/actuator/health"
Start-Sleep -Seconds 1
Start-Process "http://localhost:3000"

Write-Host "`n Services forwarded!" -ForegroundColor Green
Write-Host "   Keep the port-forward windows open!" -ForegroundColor Yellow
Write-Host ""
Write-Host " Access URLs:" -ForegroundColor Cyan
Write-Host "   Reports:  http://localhost:8084/actuator/health" -ForegroundColor White
Write-Host "   Grafana:  http://localhost:3000 (admin/admin)" -ForegroundColor White
