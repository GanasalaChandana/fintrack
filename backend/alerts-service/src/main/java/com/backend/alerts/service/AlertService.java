package com.fintrack.alerts.service;

import com.fintrack.alerts.dto.CreateAlertRuleRequest;
import com.fintrack.alerts.entity.AlertHistory;
import com.fintrack.alerts.entity.AlertRule;
import com.fintrack.alerts.repository.AlertHistoryRepository;
import com.fintrack.alerts.repository.AlertRuleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AlertService {
    
    private final AlertHistoryRepository alertHistoryRepository;
    private final AlertRuleRepository alertRuleRepository;
    
    public Page<AlertHistory> getUserAlerts(UUID userId, Pageable pageable) {
        return alertHistoryRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
    }
    
    public long getUnreadCount(UUID userId) {
        return alertHistoryRepository.countByUserIdAndIsReadFalse(userId);
    }
    
    @Transactional
    public void markAsRead(UUID alertId, UUID userId) {
        alertHistoryRepository.findById(alertId)
            .filter(alert -> alert.getUserId().equals(userId))
            .ifPresent(alert -> {
                alert.setIsRead(true);
                alertHistoryRepository.save(alert);
                log.info("Marked alert {} as read for user {}", alertId, userId);
            });
    }
    
    public List<AlertRule> getUserRules(UUID userId) {
        return alertRuleRepository.findByUserIdAndIsActiveTrue(userId);
    }
    
    @Transactional
    public AlertRule createRule(UUID userId, CreateAlertRuleRequest request) {
        AlertRule rule = new AlertRule();
        rule.setUserId(userId);
        rule.setRuleType(request.getRuleType());
        rule.setThresholdAmount(request.getThresholdAmount());
        rule.setCategory(request.getCategory());
        rule.setIsActive(true);
        
        AlertRule saved = alertRuleRepository.save(rule);
        log.info("Created alert rule {} for user {}", saved.getId(), userId);
        return saved;
    }
    
    @Transactional
    public void deleteRule(UUID ruleId, UUID userId) {
        alertRuleRepository.findById(ruleId)
            .filter(rule -> rule.getUserId().equals(userId))
            .ifPresent(rule -> {
                rule.setIsActive(false);
                alertRuleRepository.save(rule);
                log.info("Deactivated alert rule {} for user {}", ruleId, userId);
            });
    }
}