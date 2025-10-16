package com.fintrack.reports_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MonthlyComparisonResponse {
    
    private List<MonthData> months;
    
    private ComparisonStats comparisonStats;
    
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class MonthData {
        private String month; // YYYY-MM
        private BigDecimal totalSpending;
        private BigDecimal totalIncome;
        private BigDecimal netBalance;
        private Integer transactionCount;
    }
    
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ComparisonStats {
        private BigDecimal averageMonthlySpending;
        private BigDecimal highestMonthSpending;
        private BigDecimal lowestMonthSpending;
        private String highestSpendingMonth;
        private String lowestSpendingMonth;
        private Double overallTrend; // Positive = increasing, Negative = decreasing
    }
}

