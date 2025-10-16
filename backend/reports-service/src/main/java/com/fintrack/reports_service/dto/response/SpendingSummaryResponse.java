package com.fintrack.reports_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SpendingSummaryResponse {
    
    private UUID userId;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal totalSpending;
    private BigDecimal totalIncome;
    private BigDecimal netBalance;
    private Integer transactionCount;
    private BigDecimal averageDailySpending;
    private String topCategory;
    private BigDecimal topCategoryAmount;
    private List<CategorySummary> categorySummaries;
    
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class CategorySummary {
        private String category;
        private BigDecimal amount;
        private Integer transactionCount;
        private Double percentage;
    }
}