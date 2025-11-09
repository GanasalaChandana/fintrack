package com.fintrack.budgets_service.controller;

import com.fintrack.budgets_service.dto.BudgetDTO;
import com.fintrack.budgets_service.dto.CreateBudgetRequest;
import com.fintrack.budgets_service.service.BudgetsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/budgets") // <-- accept both
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:3001" })
public class BudgetController {

    private final BudgetsService budgetsService;

    @Value("${app.environment:dev}")
    private String environment;

    @GetMapping
    public ResponseEntity<List<BudgetDTO>> getAllBudgets(
            @RequestHeader(name = "X-User-Id", required = false) String userId,
            @RequestHeader(name = "Authorization", required = false) String authHeader) {

        String uid = resolveUserId(userId, authHeader);
        log.info("Getting all budgets for user: {}", uid);
        return ResponseEntity.ok(budgetsService.getAllBudgets(uid));
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getBudgetStats(
            @RequestHeader(name = "X-User-Id", required = false) String userId,
            @RequestHeader(name = "Authorization", required = false) String authHeader) {

        String uid = resolveUserId(userId, authHeader);
        log.info("Getting budget stats for user: {}", uid);
        return ResponseEntity.ok(budgetsService.getBudgetStats(uid));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BudgetDTO> getBudgetById(
            @PathVariable String id,
            @RequestHeader(name = "X-User-Id", required = false) String userId,
            @RequestHeader(name = "Authorization", required = false) String authHeader) {

        String uid = resolveUserId(userId, authHeader);
        log.info("Getting budget {} for user: {}", id, uid);
        return ResponseEntity.ok(budgetsService.getBudgetById(uid, id));
    }

    @PostMapping
    public ResponseEntity<BudgetDTO> createBudget(
            @RequestBody CreateBudgetRequest request,
            @RequestHeader(name = "X-User-Id", required = false) String userId,
            @RequestHeader(name = "Authorization", required = false) String authHeader) {

        String uid = resolveUserId(userId, authHeader);
        log.info("Creating budget for user: {}", uid);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(budgetsService.createBudget(uid, request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BudgetDTO> updateBudget(
            @PathVariable String id,
            @RequestBody CreateBudgetRequest request,
            @RequestHeader(name = "X-User-Id", required = false) String userId,
            @RequestHeader(name = "Authorization", required = false) String authHeader) {

        String uid = resolveUserId(userId, authHeader);
        log.info("Updating budget {} for user: {}", id, uid);
        return ResponseEntity.ok(budgetsService.updateBudget(uid, id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBudget(
            @PathVariable String id,
            @RequestHeader(name = "X-User-Id", required = false) String userId,
            @RequestHeader(name = "Authorization", required = false) String authHeader) {

        String uid = resolveUserId(userId, authHeader);
        log.info("Deleting budget {} for user: {}", id, uid);
        budgetsService.deleteBudget(uid, id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        log.debug("Health check called");
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "budgets-service",
                "environment", environment));
    }

    private String resolveUserId(String xUserId, String authHeader) {
        if (xUserId != null && !xUserId.isBlank()) {
            log.debug("Using X-User-Id from header: {}", xUserId);
            return xUserId;
        }
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            log.debug("Found Authorization header but not extracting user ID yet");
        }
        if ("dev".equals(environment) || "development".equals(environment)) {
            String defaultUserId = "dev-user-123";
            log.warn("DEV MODE: No X-User-Id found, using default: {}", defaultUserId);
            return defaultUserId;
        }
        throw new IllegalStateException(
                "Missing X-User-Id header. Gateway must inject user ID or set app.environment=dev");
    }
}
