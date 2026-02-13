package com.fintrack.transactions.controller;

import com.fintrack.transactions.entity.Transaction;
import com.fintrack.transactions.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * NEW CONTROLLER: Provides transaction data to the Reports Service
 * This is separate from the main TransactionController to handle inter-service
 * communication
 */
@Slf4j
@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionReportsController {

    private final TransactionRepository transactionRepository;

    /**
     * Get transactions for reports with date range filtering
     * Called by the Reports Service (microservice communication)
     * 
     * Example: GET
     * /api/transactions/reports?userId=1&startDate=2024-01-01&endDate=2024-12-31
     */
    @GetMapping("/reports")
    public ResponseEntity<List<Map<String, Object>>> getTransactionsForReports(
            @RequestParam String userId,
            @RequestParam String startDate,
            @RequestParam String endDate) {

        log.info("📊 Reports request - userId: {}, startDate: {}, endDate: {}",
                userId, startDate, endDate);

        try {
            LocalDate start = LocalDate.parse(startDate);
            LocalDate end = LocalDate.parse(endDate);

            // Fetch transactions from database
            List<Transaction> transactions = transactionRepository
                    .findByUserIdAndDateBetween(userId, start, end);

            // Convert to Map format for easy JSON serialization
            List<Map<String, Object>> response = transactions.stream()
                    .map(this::convertToMap)
                    .collect(Collectors.toList());

            log.info("✅ Returning {} transactions for reports", response.size());
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("❌ Error fetching transactions for reports: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(List.of());
        }
    }

    /**
     * Get transactions by type (INCOME/EXPENSE) for a date range
     * Optimized endpoint for type-specific queries
     */
    @GetMapping("/reports/by-type")
    public ResponseEntity<List<Map<String, Object>>> getTransactionsByType(
            @RequestParam String userId,
            @RequestParam String type,
            @RequestParam String startDate,
            @RequestParam String endDate) {

        log.info("📊 Reports by type - userId: {}, type: {}, startDate: {}, endDate: {}",
                userId, type, startDate, endDate);

        try {
            LocalDate start = LocalDate.parse(startDate);
            LocalDate end = LocalDate.parse(endDate);

            List<Transaction> transactions = transactionRepository
                    .findByUserIdAndDateBetweenAndType(userId, start, end, type);

            List<Map<String, Object>> response = transactions.stream()
                    .map(this::convertToMap)
                    .collect(Collectors.toList());

            log.info("✅ Returning {} {} transactions", response.size(), type);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("❌ Error fetching transactions by type: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(List.of());
        }
    }

    /**
     * Get aggregated totals by type
     * Fast endpoint for summary calculations
     */
    @GetMapping("/reports/totals")
    public ResponseEntity<Map<String, Object>> getTransactionTotals(
            @RequestParam String userId,
            @RequestParam String startDate,
            @RequestParam String endDate) {

        log.info("📊 Reports totals - userId: {}, startDate: {}, endDate: {}",
                userId, startDate, endDate);

        try {
            LocalDate start = LocalDate.parse(startDate);
            LocalDate end = LocalDate.parse(endDate);

            java.math.BigDecimal incomeTotal = transactionRepository
                    .getTotalByTypeAndDateRange(userId, "INCOME", start, end);

            java.math.BigDecimal expenseTotal = transactionRepository
                    .getTotalByTypeAndDateRange(userId, "EXPENSE", start, end);

            Map<String, Object> totals = new HashMap<>();
            totals.put("income", incomeTotal);
            totals.put("expenses", expenseTotal);
            totals.put("net", incomeTotal.subtract(expenseTotal));

            log.info("✅ Totals - Income: {}, Expenses: {}", incomeTotal, expenseTotal);
            return ResponseEntity.ok(totals);

        } catch (Exception e) {
            log.error("❌ Error calculating totals: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(Map.of());
        }
    }

    /**
     * Get category breakdown for a user
     * Optimized for category analysis
     */
    @GetMapping("/reports/categories")
    public ResponseEntity<List<Map<String, Object>>> getCategoryBreakdown(
            @RequestParam String userId,
            @RequestParam String startDate,
            @RequestParam String endDate) {

        log.info("📊 Category breakdown - userId: {}, startDate: {}, endDate: {}",
                userId, startDate, endDate);

        try {
            LocalDate start = LocalDate.parse(startDate);
            LocalDate end = LocalDate.parse(endDate);

            List<Object[]> categoryData = transactionRepository
                    .getCategoryTotals(userId, start, end);

            List<Map<String, Object>> response = categoryData.stream()
                    .map(row -> {
                        Map<String, Object> category = new HashMap<>();
                        category.put("category", row[0]);
                        category.put("count", row[1]);
                        category.put("total", row[2]);
                        return category;
                    })
                    .collect(Collectors.toList());

            log.info("✅ Returning {} categories", response.size());
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("❌ Error getting category breakdown: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(List.of());
        }
    }

    /**
     * Health check endpoint for reports service
     */
    @GetMapping("/reports/health")
    public ResponseEntity<Map<String, String>> healthCheck() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "transactions-service",
                "feature", "reports-api"));
    }

    /**
     * Convert Transaction entity to Map for JSON serialization
     * This ensures all fields are properly formatted
     */
    private Map<String, Object> convertToMap(Transaction transaction) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", transaction.getId());
        map.put("userId", transaction.getUserId());
        map.put("date", transaction.getDate().toString());
        map.put("description", transaction.getDescription());

        // Handle merchant field (might be null)
        String merchant = transaction.getMerchant();
        map.put("merchant", merchant != null && !merchant.isEmpty()
                ? merchant
                : transaction.getDescription());

        map.put("category", transaction.getCategory());
        map.put("amount", transaction.getAmount());
        map.put("type", transaction.getType());

        // recurring field does not exist on Transaction entity yet - defaulting to
        // false
        map.put("recurring", false);

        return map;
    }
}