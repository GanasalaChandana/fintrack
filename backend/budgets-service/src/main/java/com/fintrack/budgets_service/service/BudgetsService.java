package com.fintrack.budgets_service.service;

import com.fintrack.budgets_service.entity.Budget;
import com.fintrack.budgets_service.exception.ResourceNotFoundException;
import com.fintrack.budgets_service.exception.UnauthorizedException;
import com.fintrack.budgets_service.repository.BudgetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class BudgetsService {

    private final BudgetRepository budgetRepository;

    public List<Budget> getAllBudgetsByUserId(String userId, String month) {
        if (month != null && !month.isEmpty()) {
            return budgetRepository.findByUserIdAndMonth(userId, month);
        }
        return budgetRepository.findByUserId(userId);
    }

    public Optional<Budget> getBudgetByCategory(String userId, String category) {
        return budgetRepository.findByUserIdAndCategory(userId, category);
    }

    public Budget getBudgetById(String id, String userId) {
        Budget budget = budgetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Budget not found"));

        if (!budget.getUserId().equals(userId)) {
            throw new UnauthorizedException("You don't have permission to access this budget");
        }

        return budget;
    }

    @Transactional
    public Budget createBudget(Budget budget) {
        // Set default values if not provided
        if (budget.getSpent() == null) {
            budget.setSpent(0.0);
        }
        if (budget.getIcon() == null || budget.getIcon().isEmpty()) {
            budget.setIcon("💰");
        }
        if (budget.getColor() == null || budget.getColor().isEmpty()) {
            budget.setColor("#3b82f6");
        }
        if (budget.getMonth() == null || budget.getMonth().isEmpty()) {
            budget.setMonth(YearMonth.now().format(DateTimeFormatter.ofPattern("yyyy-MM")));
        }

        return budgetRepository.save(budget);
    }

    @Transactional
    public Budget updateBudget(String id, Budget budgetUpdate, String userId) {
        Budget budget = getBudgetById(id, userId);

        if (budgetUpdate.getCategory() != null) {
            budget.setCategory(budgetUpdate.getCategory());
        }
        if (budgetUpdate.getBudget() != null) {
            budget.setBudget(budgetUpdate.getBudget());
        }
        if (budgetUpdate.getSpent() != null) {
            budget.setSpent(budgetUpdate.getSpent());
        }
        if (budgetUpdate.getIcon() != null) {
            budget.setIcon(budgetUpdate.getIcon());
        }
        if (budgetUpdate.getColor() != null) {
            budget.setColor(budgetUpdate.getColor());
        }
        if (budgetUpdate.getMonth() != null) {
            budget.setMonth(budgetUpdate.getMonth());
        }

        return budgetRepository.save(budget);
    }

    @Transactional
    public Budget updateSpent(String id, Double spent, String userId) {
        Budget budget = getBudgetById(id, userId);
        budget.setSpent(spent);
        return budgetRepository.save(budget);
    }

    @Transactional
    public void deleteBudget(String id, String userId) {
        Budget budget = getBudgetById(id, userId);
        budgetRepository.delete(budget);
    }

    public Map<String, Object> getBudgetSummary(String userId, String month) {
        String targetMonth = month != null ? month : YearMonth.now().format(DateTimeFormatter.ofPattern("yyyy-MM"));

        List<Budget> budgets = budgetRepository.findByUserIdAndMonth(userId, targetMonth);

        double totalBudget = budgets.stream()
                .mapToDouble(Budget::getBudget)
                .sum();

        double totalSpent = budgets.stream()
                .mapToDouble(Budget::getSpent)
                .sum();

        double remaining = totalBudget - totalSpent;
        double percentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

        return Map.of(
                "month", targetMonth,
                "totalBudget", totalBudget,
                "totalSpent", totalSpent,
                "remaining", remaining,
                "percentage", Math.round(percentage * 100.0) / 100.0,
                "budgets", budgets);
    }
}