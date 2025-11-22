package com.fintrack.budgets_service.dto;

import com.fintrack.budgets_service.entity.Budget;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BudgetSummaryResponse {
    private String month;
    private Double totalBudget;
    private Double totalSpent;
    private Double remaining;
    private Double percentage;
    private List<Budget> budgets;
}