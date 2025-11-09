package com.fintrack.budgets_service.service;

import com.fintrack.budgets_service.dto.BudgetDTO;
import com.fintrack.budgets_service.dto.CreateBudgetRequest;
import com.fintrack.budgets_service.entity.Budget;
import com.fintrack.budgets_service.repository.BudgetRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class BudgetsService {

    private final BudgetRepository budgetRepository;

    /* ---------- Queries ---------- */

    @Transactional(readOnly = true)
    public List<BudgetDTO> getAllBudgets(String userId) {
        log.info("Fetching all budgets for user: {}", userId);
        return budgetRepository.findByUserId(userId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<BudgetDTO> getActiveBudgets(String userId) {
        log.info("Fetching active budgets for user: {}", userId);
        return budgetRepository.findByUserIdAndIsActiveTrue(userId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public BudgetDTO getBudgetById(String userId, String budgetId) {
        log.info("Fetching budget {} for user {}", budgetId, userId);
        Budget budget = budgetRepository.findById(budgetId)
                .orElseThrow(() -> new RuntimeException("Budget not found"));
        if (!Objects.equals(budget.getUserId(), userId)) {
            throw new RuntimeException("Unauthorized access to budget");
        }
        return toDTO(budget);
    }

    /* ---------- Mutations ---------- */

    @Transactional
    public BudgetDTO createBudget(String userId, CreateBudgetRequest request) {
        log.info("Creating budget for user {}", userId);

        Budget budget = new Budget();
        budget.setUserId(userId);
        budget.setCategory(request.getCategory());
        budget.setAmount(request.getAmount());
        budget.setPeriod(request.getPeriod());
        budget.setStartDate(request.getStartDate());
        budget.setEndDate(request.getEndDate());
        budget.setAlertThreshold(request.getAlertThreshold());
        // spentAmount defaults to ZERO in entity; remaining/percentage are derived

        return toDTO(budgetRepository.save(budget));
    }

    @Transactional
    public BudgetDTO updateBudget(String userId, String budgetId, CreateBudgetRequest request) {
        log.info("Updating budget {} for user {}", budgetId, userId);

        Budget budget = budgetRepository.findById(budgetId)
                .orElseThrow(() -> new RuntimeException("Budget not found"));
        if (!Objects.equals(budget.getUserId(), userId)) {
            throw new RuntimeException("Unauthorized access to budget");
        }

        budget.setCategory(request.getCategory());
        budget.setAmount(request.getAmount());
        budget.setPeriod(request.getPeriod());
        budget.setStartDate(request.getStartDate());
        budget.setEndDate(request.getEndDate());
        budget.setAlertThreshold(request.getAlertThreshold());

        return toDTO(budgetRepository.save(budget));
    }

    @Transactional
    public void deleteBudget(String userId, String budgetId) {
        log.info("Deleting budget {} for user {}", budgetId, userId);
        Budget budget = budgetRepository.findById(budgetId)
                .orElseThrow(() -> new RuntimeException("Budget not found"));
        if (!Objects.equals(budget.getUserId(), userId)) {
            throw new RuntimeException("Unauthorized access to budget");
        }
        budgetRepository.delete(budget);
    }

    /* ---------- Aggregates ---------- */

    @Transactional(readOnly = true)
    public Map<String, Object> getBudgetStats(String userId) {
        List<BudgetDTO> list = getAllBudgets(userId);

        BigDecimal totalBudget = list.stream()
                .map(BudgetDTO::getAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalSpent = list.stream()
                .map(BudgetDTO::getSpentAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalRemaining = list.stream()
                .map(BudgetDTO::getRemainingAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        double avgUtilization = list.stream()
                .map(BudgetDTO::getPercentageUsed)
                .filter(Objects::nonNull)
                .mapToDouble(Double::doubleValue)
                .average()
                .orElse(0.0);

        long activeCount = list.stream()
                .filter(b -> Boolean.TRUE.equals(b.getIsActive()))
                .count();

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("count", list.size());
        stats.put("activeCount", activeCount);
        stats.put("totalBudget", totalBudget);
        stats.put("totalSpent", totalSpent);
        stats.put("totalRemaining", totalRemaining);
        stats.put("avgUtilization", Math.round(avgUtilization * 100.0) / 100.0);
        return stats;
    }

    /* ---------- Mapping ---------- */

    private BudgetDTO toDTO(Budget budget) {
        BudgetDTO dto = new BudgetDTO();
        dto.setId(budget.getId());
        dto.setUserId(budget.getUserId());
        dto.setCategory(budget.getCategory());
        dto.setAmount(budget.getAmount());
        dto.setSpentAmount(budget.getSpentAmount()); // BigDecimal
        dto.setRemainingAmount(budget.getRemainingAmount()); // BigDecimal (derived)
        dto.setPercentageUsed(budget.getPercentageUsed()); // Double (derived)
        dto.setPeriod(budget.getPeriod());
        dto.setStartDate(budget.getStartDate());
        dto.setEndDate(budget.getEndDate());
        dto.setAlertThreshold(budget.getAlertThreshold());
        dto.setIsActive(budget.getIsActive());
        dto.setCreatedAt(budget.getCreatedAt());
        dto.setUpdatedAt(budget.getUpdatedAt());
        return dto;
    }
}
