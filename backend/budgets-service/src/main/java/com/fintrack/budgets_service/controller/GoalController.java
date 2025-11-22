package com.fintrack.budgets_service.controller;

import com.fintrack.budgets_service.dto.GoalDTO;
import com.fintrack.budgets_service.entity.Goal;
import com.fintrack.budgets_service.service.GoalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/goals")
@RequiredArgsConstructor
public class GoalController {

    private final GoalService goalService;

    // Get all goals for the authenticated user
    @GetMapping
    public ResponseEntity<List<Goal>> getAllGoals(
            @RequestHeader(value = "X-User-Id", required = false) String userIdStr) {

        if (userIdStr == null || userIdStr.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        // Try to parse as Long, if fails use hash code or default to 1
        Long userId;
        try {
            userId = Long.parseLong(userIdStr);
        } catch (NumberFormatException e) {
            // In dev mode with "dev-user-123", use 1 as default
            userId = 1L;
        }

        List<Goal> goals = goalService.getAllGoalsByUserId(userId);
        return ResponseEntity.ok(goals);
    }

    // Get a specific goal by ID
    @GetMapping("/{id}")
    public ResponseEntity<Goal> getGoalById(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Id", required = false) String userIdStr) {

        if (userIdStr == null || userIdStr.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Long userId;
        try {
            userId = Long.parseLong(userIdStr);
        } catch (NumberFormatException e) {
            userId = 1L;
        }

        Goal goal = goalService.getGoalById(id, userId);
        return ResponseEntity.ok(goal);
    }

    // Create a new goal
    @PostMapping
    public ResponseEntity<Goal> createGoal(
            @Valid @RequestBody GoalDTO goalDTO,
            @RequestHeader(value = "X-User-Id", required = false) String userIdStr) {

        if (userIdStr == null || userIdStr.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Long userId;
        try {
            userId = Long.parseLong(userIdStr);
        } catch (NumberFormatException e) {
            userId = 1L;
        }

        goalDTO.setUserId(userId);
        Goal createdGoal = goalService.createGoal(goalDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdGoal);
    }

    // Update an existing goal
    @PutMapping("/{id}")
    public ResponseEntity<Goal> updateGoal(
            @PathVariable Long id,
            @Valid @RequestBody GoalDTO goalDTO,
            @RequestHeader(value = "X-User-Id", required = false) String userIdStr) {

        if (userIdStr == null || userIdStr.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Long userId;
        try {
            userId = Long.parseLong(userIdStr);
        } catch (NumberFormatException e) {
            userId = 1L;
        }

        Goal updatedGoal = goalService.updateGoal(id, goalDTO, userId);
        return ResponseEntity.ok(updatedGoal);
    }

    // Update goal progress (PATCH endpoint for frontend)
    @PatchMapping("/{id}/progress")
    public ResponseEntity<Goal> updateProgress(
            @PathVariable Long id,
            @RequestBody Map<String, BigDecimal> payload,
            @RequestHeader(value = "X-User-Id", required = false) String userIdStr) {

        if (userIdStr == null || userIdStr.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Long userId;
        try {
            userId = Long.parseLong(userIdStr);
        } catch (NumberFormatException e) {
            userId = 1L;
        }

        BigDecimal current = payload.get("current");
        if (current == null) {
            return ResponseEntity.badRequest().build();
        }

        Goal updatedGoal = goalService.updateGoalProgress(id, current, userId);
        return ResponseEntity.ok(updatedGoal);
    }

    // Delete a goal
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteGoal(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Id", required = false) String userIdStr) {

        if (userIdStr == null || userIdStr.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Long userId;
        try {
            userId = Long.parseLong(userIdStr);
        } catch (NumberFormatException e) {
            userId = 1L;
        }

        goalService.deleteGoal(id, userId);
        return ResponseEntity.ok(Map.of("message", "Goal deleted successfully"));
    }
}