Write-Host "Testing Transaction Service APIs..." -ForegroundColor Cyan

# Test 1: Health Check
Write-Host "`n1. Health Check..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:8082/actuator/health" -Method Get
    Write-Host "   Status: $($health.status)" -ForegroundColor Green
} catch {
    Write-Host "   Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Create Transaction
Write-Host "`n2. Creating Transaction..." -ForegroundColor Yellow
try {
    $transaction = @{
        description = "Test Transaction"
        amount = 50.00
        merchant = "Test Merchant"
        category = "Other"
        type = "EXPENSE"
        date = (Get-Date -Format "yyyy-MM-dd")
    } | ConvertTo-Json

    $result = Invoke-RestMethod -Uri "http://localhost:8082/api/transactions" -Method Post -Body $transaction -ContentType "application/json" -Headers @{"X-User-Id"="test-user-123"}
    Write-Host "   Created Transaction ID: $($result.id)" -ForegroundColor Green
} catch {
    Write-Host "   Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Get Transactions
Write-Host "`n3. Getting Transactions..." -ForegroundColor Yellow
try {
    $transactions = Invoke-RestMethod -Uri "http://localhost:8082/api/transactions" -Method Get -Headers @{"X-User-Id"="test-user-123"}
    Write-Host "   Total Transactions: $($transactions.totalElements)" -ForegroundColor Green
} catch {
    Write-Host "   Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Get Summary
Write-Host "`n4. Getting Summary..." -ForegroundColor Yellow
try {
    $summary = Invoke-RestMethod -Uri "http://localhost:8082/api/transactions/summary" -Method Get -Headers @{"X-User-Id"="test-user-123"}
    Write-Host "   Balance: $($summary.balance)" -ForegroundColor Cyan
    Write-Host "   Income: $($summary.totalIncome)" -ForegroundColor Green
    Write-Host "   Expenses: $($summary.totalExpenses)" -ForegroundColor Red
} catch {
    Write-Host "   Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nAll tests completed!" -ForegroundColor Cyan