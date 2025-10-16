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
public class IncomeVsExpenseResponse {
    
    private LocalDate startDate;
    
    private LocalDate endDate;
    
    private BigDecimal totalIncome;
    
    private BigDecimal totalExpense;
    
    private BigDecimal netSavings;
    
    private Double savingsRate; // Percentage
    
    private List<PeriodData> periodBreakdown;
    
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class PeriodData {
        private String period; // Date or Month
        private BigDecimal income;
        private BigDecimal expense;
        private BigDecimal netSavings;
    }
}
