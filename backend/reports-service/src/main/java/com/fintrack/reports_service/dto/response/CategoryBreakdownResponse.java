package com.fintrack.reports_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CategoryBreakdownResponse {
    
    private LocalDate startDate;
    
    private LocalDate endDate;
    
    private List<CategoryDetail> categories;
    
    private BigDecimal totalAmount;
    
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class CategoryDetail {
        private String categoryName;
        private BigDecimal amount;
        private Integer transactionCount;
        private Double percentageOfTotal;
        private BigDecimal averageTransactionAmount;
        private BigDecimal highestTransaction;
        private BigDecimal lowestTransaction;
    }
}
