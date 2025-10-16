# Generate test traffic
for ($i = 1; $i -le 10; $i++) {
    Write-Host "Request $i"
    Invoke-WebRequest -Uri "http://localhost:8084/actuator/health" -UseBasicParsing | Out-Null
    Start-Sleep -Seconds 2
}
