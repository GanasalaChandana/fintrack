package com.fintrack.reports_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TrendAnalysisResponse {
    
    private String groupBy; // DAY, WEEK, MONTH
    
    private List<TrendPoint> trendData;
    
    private TrendInsights insights;
    
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class TrendPoint {
        private String period;
        private BigDecimal amount;
        private Integer transactionCount;
        private Double changePercentage;
    }
    
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class TrendInsights {
        private String overallTrend; // INCREASING, DECREASING, STABLE
        private BigDecimal averageAmount;
        private BigDecimal peakAmount;
        private String peakPeriod;
        private BigDecimal lowestAmount;
        private String lowestPeriod;
        private Double volatility; // Standard deviation
    }
}

