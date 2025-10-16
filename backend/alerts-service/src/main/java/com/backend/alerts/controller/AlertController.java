package com.fintrack.alerts.controller;

import com.fintrack.alerts.dto.CreateAlertRuleRequest;
import com.fintrack.alerts.entity.AlertHistory;
import com.fintrack.alerts.entity.AlertRule;
import com.fintrack.alerts.service.AlertService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;  // ← ADD THIS IMPORT
import java.util.UUID;

@RestController
@RequestMapping("/alerts")
@RequiredArgsConstructor
public class AlertController {
    
    private final AlertService alertService;
    
    @GetMapping
    public Page<AlertHistory> getUserAlerts(
        @RequestHeader("X-User-Id") UUID userId,
        Pageable pageable
    ) {
        return alertService.getUserAlerts(userId, pageable);
    }
    
    @GetMapping("/unread-count")
    public Map<String, Long> getUnreadCount(@RequestHeader("X-User-Id") UUID userId) {
        return Map.of("unreadCount", alertService.getUnreadCount(userId));
    }
    
    @PatchMapping("/{alertId}/read")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void markAsRead(
        @RequestHeader("X-User-Id") UUID userId,
        @PathVariable UUID alertId
    ) {
        alertService.markAsRead(alertId, userId);
    }
    
    @GetMapping("/rules")
    public List<AlertRule> getUserRules(@RequestHeader("X-User-Id") UUID userId) {
        return alertService.getUserRules(userId);
    }
    
    @PostMapping("/rules")
    @ResponseStatus(HttpStatus.CREATED)
    public AlertRule createRule(
        @RequestHeader("X-User-Id") UUID userId,
        @Valid @RequestBody CreateAlertRuleRequest request
    ) {
        return alertService.createRule(userId, request);
    }
    
    @DeleteMapping("/rules/{ruleId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteRule(
        @RequestHeader("X-User-Id") UUID userId,
        @PathVariable UUID ruleId
    ) {
        alertService.deleteRule(ruleId, userId);
    }
}