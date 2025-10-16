package com.fintrack.reports_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DashboardSummaryResponse {
    
    private CurrentPeriodStats currentMonth;
    
    private CurrentPeriodStats lastMonth;
    
    private List<RecentTransaction> recentTransactions;
    
    private List<CategorySpending> topCategories;
    
    private Map<String, BigDecimal> monthlyTrend; // Last 6 months
    
    private List<UpcomingAlert> upcomingAlerts;
    
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class CurrentPeriodStats {
        private BigDecimal totalSpending;
        private BigDecimal totalIncome;
        private BigDecimal netBalance;
        private Integer transactionCount;
        private Double changePercentage; // vs previous period
    }
    
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class RecentTransaction {
        private String id;
        private String description;
        private BigDecimal amount;
        private String category;
        private String date;
    }
    
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class CategorySpending {
        private String category;
        private BigDecimal amount;
        private Double percentage;
    }
    
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class UpcomingAlert {
        private String type;
        private String message;
        private String severity;
    }
}
