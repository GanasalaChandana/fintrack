package com.backend.alerts.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.backend.alerts.service.AlertService;
import com.backend.alerts.model.Alert;

import java.util.List;

@RestController
@RequestMapping("/api/alerts")
public class AlertController {

    @Autowired
    private AlertService alertService;

    @GetMapping
    public ResponseEntity<List<Alert>> getAllAlerts(
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        System.out.println("📥 GET /api/alerts - userId from header: " + userId);
        List<Alert> alerts = alertService.getAllAlerts();
        System.out.println("📤 Returning " + alerts.size() + " alerts");
        return ResponseEntity.ok(alerts);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Alert> getAlertById(@PathVariable Long id) {
        System.out.println("📥 GET /api/alerts/" + id);
        Alert alert = alertService.getAlertById(id);
        return ResponseEntity.ok(alert);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Alert>> getAlertsByUserId(@PathVariable Long userId) {
        System.out.println("📥 GET /api/alerts/user/" + userId);
        List<Alert> alerts = alertService.getAlertsByUserId(userId);
        return ResponseEntity.ok(alerts);
    }

    @PostMapping
    public ResponseEntity<Alert> createAlert(
            @RequestBody Alert alert,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        System.out.println("📥 POST /api/alerts - userId: " + userId);
        Alert createdAlert = alertService.createAlert(alert);
        return ResponseEntity.ok(createdAlert);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Alert> updateAlert(
            @PathVariable Long id,
            @RequestBody Alert alert) {
        System.out.println("📥 PUT /api/alerts/" + id);
        Alert updatedAlert = alertService.updateAlert(id, alert);
        return ResponseEntity.ok(updatedAlert);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAlert(@PathVariable Long id) {
        System.out.println("📥 DELETE /api/alerts/" + id);
        alertService.deleteAlert(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Alert> updateAlertStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        System.out.println("📥 PATCH /api/alerts/" + id + "/status - new status: " + status);
        Alert updatedAlert = alertService.updateAlertStatus(id, status);
        return ResponseEntity.ok(updatedAlert);
    }
}