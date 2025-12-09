package com.fintrack.budgets_service.controller;

import com.fintrack.budgets_service.entity.Budget;
import com.fintrack.budgets_service.service.BudgetsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/budgets")
@RequiredArgsConstructor
public class BudgetController {

    private final BudgetsService budgetsService;

    // Get all budgets for the authenticated user
    @GetMapping
    public ResponseEntity<List<Budget>> getAllBudgets(
            @RequestParam(required = false) String month,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {

        if (userId == null || userId.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        List<Budget> budgets = budgetsService.getAllBudgetsByUserId(userId, month);
        return ResponseEntity.ok(budgets);
    }

    // Get budget summary
    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getBudgetSummary(
            @RequestParam(required = false) String month,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {

        if (userId == null || userId.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Map<String, Object> summary = budgetsService.getBudgetSummary(userId, month);
        return ResponseEntity.ok(summary);
    }

    // Get a specific budget by ID
    @GetMapping("/{id}")
    public ResponseEntity<Budget> getBudgetById(
            @PathVariable String id,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {

        if (userId == null || userId.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Budget budget = budgetsService.getBudgetById(id, userId);
        return ResponseEntity.ok(budget);
    }

    @GetMapping("/category")
    public ResponseEntity<Map<String, Object>> getBudgetByCategory(
            @RequestParam String userId,
            @RequestParam String category) {

        Optional<Budget> budget = budgetsService.getBudgetByCategory(userId, category);

        if (budget.isPresent()) {
            Map<String, Object> result = new HashMap<>();
            result.put("amount", budget.get().getBudget());
            result.put("category", budget.get().getCategory());
            return ResponseEntity.ok(result);
        }

        // Return default budget if not found
        Map<String, Object> defaultBudget = new HashMap<>();
        defaultBudget.put("amount", 1000);
        defaultBudget.put("category", category);
        return ResponseEntity.ok(defaultBudget);
    }

    // Create a new budget
    @PostMapping
    public ResponseEntity<Budget> createBudget(
            @Valid @RequestBody Budget budget,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {

        if (userId == null || userId.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        budget.setUserId(userId);
        Budget createdBudget = budgetsService.createBudget(budget);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdBudget);
    }

    // Update an existing budget
    @PutMapping("/{id}")
    public ResponseEntity<Budget> updateBudget(
            @PathVariable String id,
            @Valid @RequestBody Budget budget,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {

        if (userId == null || userId.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Budget updatedBudget = budgetsService.updateBudget(id, budget, userId);
        return ResponseEntity.ok(updatedBudget);
    }

    // Update budget spent amount (PATCH endpoint for frontend)
    @PatchMapping("/{id}/spent")
    public ResponseEntity<Budget> updateSpent(
            @PathVariable String id,
            @RequestBody Map<String, Double> payload,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {

        if (userId == null || userId.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Double spent = payload.get("spent");
        if (spent == null) {
            return ResponseEntity.badRequest().build();
        }

        Budget updatedBudget = budgetsService.updateSpent(id, spent, userId);
        return ResponseEntity.ok(updatedBudget);
    }

    // Delete a budget
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteBudget(
            @PathVariable String id,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {

        if (userId == null || userId.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        budgetsService.deleteBudget(id, userId);
        return ResponseEntity.ok(Map.of("message", "Budget deleted successfully"));
    }
}