package com.backend.alerts.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.backend.alerts.service.AlertService;
import com.backend.alerts.service.BudgetAlertScheduler;
import com.backend.alerts.model.Alert;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/alerts")
public class AlertController {

    @Autowired
    private AlertService alertService;

    @Autowired(required = false)
    private BudgetAlertScheduler budgetAlertScheduler;

    @GetMapping
    public ResponseEntity<List<Alert>> getAllAlerts(
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        System.out.println("📥 GET /api/alerts - userId: " + userId);
        List<Alert> alerts;
        if (userId != null && !userId.isBlank()) {
            alerts = alertService.getAlertsByUserId(userId);
        } else {
            alerts = alertService.getAllAlerts();
        }
        System.out.println("📤 Returning " + alerts.size() + " alerts");
        return ResponseEntity.ok(alerts);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Alert> getAlertById(@PathVariable Long id) {
        return ResponseEntity.ok(alertService.getAlertById(id));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Alert>> getAlertsByUserId(@PathVariable String userId) {
        return ResponseEntity.ok(alertService.getAlertsByUserId(userId));
    }

    @PostMapping
    public ResponseEntity<Alert> createAlert(
            @RequestBody Alert alert,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        return ResponseEntity.ok(alertService.createAlert(alert));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Alert> updateAlert(@PathVariable Long id, @RequestBody Alert alert) {
        return ResponseEntity.ok(alertService.updateAlert(id, alert));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAlert(@PathVariable Long id) {
        alertService.deleteAlert(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Alert> updateAlertStatus(@PathVariable Long id, @RequestParam String status) {
        return ResponseEntity.ok(alertService.updateAlertStatus(id, status));
    }

    @PostMapping("/{id}/acknowledge")
    public ResponseEntity<Alert> acknowledgeAlert(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        return ResponseEntity.ok(alertService.acknowledgeAlert(id));
    }

    @PostMapping("/acknowledge-all")
    public ResponseEntity<Map<String, Object>> acknowledgeAll(
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        int count;
        if (userId != null && !userId.isBlank()) {
            count = alertService.acknowledgeAllByUserId(userId);
        } else {
            count = alertService.acknowledgeAllAlerts();
        }
        System.out.println("✅ Acknowledged " + count + " alerts");
        return ResponseEntity.ok(Map.of("acknowledged", count, "success", true));
    }

    @PostMapping("/trigger-check")
    public ResponseEntity<Map<String, String>> triggerBudgetCheck() {
        if (budgetAlertScheduler != null) {
            budgetAlertScheduler.checkBudgetAlerts();
            return ResponseEntity.ok(Map.of("status", "triggered", "message", "Check completed"));
        }
        return ResponseEntity.ok(Map.of("status", "skipped", "message", "Scheduler not available"));
    }
}