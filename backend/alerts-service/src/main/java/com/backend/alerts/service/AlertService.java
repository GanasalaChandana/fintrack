package com.backend.alerts.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.backend.alerts.model.Alert;
import com.backend.alerts.repository.AlertRepository;

import java.util.List;
import java.util.UUID;

@Service
public class AlertService {

    @Autowired
    private AlertRepository alertRepository;

    public List<Alert> getAllAlerts() {
        return alertRepository.findAll();
    }

    public Alert getAlertById(Long id) {
        return alertRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Alert not found with id: " + id));
    }

    public List<Alert> getAlertsByUserId(Long userId) {
        return alertRepository.findByUserId(userId);
    }

    public Alert createAlert(Alert alert) {
        return alertRepository.save(alert);
    }

    public Alert updateAlert(Long id, Alert alert) {
        Alert existingAlert = getAlertById(id);
        existingAlert.setMessage(alert.getMessage());
        existingAlert.setType(alert.getType());
        existingAlert.setStatus(alert.getStatus());
        existingAlert.setPriority(alert.getPriority());
        return alertRepository.save(existingAlert);
    }

    public void deleteAlert(Long id) {
        alertRepository.deleteById(id);
    }

    public Alert updateAlertStatus(Long id, String status) {
        Alert alert = getAlertById(id);
        alert.setStatus(status);
        return alertRepository.save(alert);
    }

    // Kafka-related helper methods - Fixed to use Long instead of String

    public void createBudgetExceededAlert(UUID userId, String category, double spent, double budget) {
        Alert alert = new Alert();
        alert.setUserId(userId.getMostSignificantBits()); // Convert UUID to Long
        alert.setType("BUDGET_EXCEEDED");
        alert.setMessage(String.format("Budget exceeded for %s: $%.2f spent (Budget: $%.2f)",
                category, spent, budget));
        alert.setStatus("UNREAD");
        alert.setPriority("HIGH");
        alertRepository.save(alert);
    }

    public void createBudgetWarningAlert(UUID userId, String category, double spent, double budget, double percentage) {
        Alert alert = new Alert();
        alert.setUserId(userId.getMostSignificantBits()); // Convert UUID to Long
        alert.setType("BUDGET_WARNING");
        alert.setMessage(String.format("Budget warning for %s: $%.2f spent (%.0f%% of $%.2f budget)",
                category, spent, percentage, budget));
        alert.setStatus("UNREAD");
        alert.setPriority("MEDIUM");
        alertRepository.save(alert);
    }

    public void createGoalMilestoneAlert(UUID userId, UUID goalId, String goalName, double progress) {
        Alert alert = new Alert();
        alert.setUserId(userId.getMostSignificantBits()); // Convert UUID to Long
        alert.setType("GOAL_MILESTONE");
        alert.setMessage(String.format("Goal milestone reached for '%s': %.0f%% complete",
                goalName, progress));
        alert.setStatus("UNREAD");
        alert.setPriority("MEDIUM");
        alertRepository.save(alert);
    }

    public void createGoalAchievedAlert(UUID userId, UUID goalId, String goalName) {
        Alert alert = new Alert();
        alert.setUserId(userId.getMostSignificantBits()); // Convert UUID to Long
        alert.setType("GOAL_ACHIEVED");
        alert.setMessage(String.format("Congratulations! Goal '%s' has been achieved!", goalName));
        alert.setStatus("UNREAD");
        alert.setPriority("HIGH");
        alertRepository.save(alert);
    }

    public void createUnusualSpendingAlert(UUID userId, String category, double amount, double average) {
        Alert alert = new Alert();
        alert.setUserId(userId.getMostSignificantBits()); // Convert UUID to Long
        alert.setType("UNUSUAL_SPENDING");
        alert.setMessage(String.format("Unusual spending detected in %s: $%.2f (Average: $%.2f)",
                category, amount, average));
        alert.setStatus("UNREAD");
        alert.setPriority("MEDIUM");
        alertRepository.save(alert);
    }
}