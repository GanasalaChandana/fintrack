package com.backend.alerts.kafka;

import com.backend.alerts.service.AlertService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class AlertKafkaListener {

    private final AlertService alertService;
    private final ObjectMapper objectMapper;

    @KafkaListener(topics = "budget-exceeded", groupId = "alerts-service")
    public void handleBudgetExceeded(String message) {
        try {
            log.info("Received budget-exceeded event: {}", message);
            JsonNode event = objectMapper.readTree(message);

            UUID userId = UUID.fromString(event.get("userId").asText());
            String category = event.get("category").asText();
            double spent = event.get("spent").asDouble();
            double budget = event.get("budget").asDouble();

            alertService.createBudgetExceededAlert(userId, category, spent, budget);
            log.info("Created budget exceeded alert for user {}", userId);

        } catch (Exception e) {
            log.error("Error processing budget-exceeded event", e);
        }
    }

    @KafkaListener(topics = "budget-warning", groupId = "alerts-service")
    public void handleBudgetWarning(String message) {
        try {
            log.info("Received budget-warning event: {}", message);
            JsonNode event = objectMapper.readTree(message);

            UUID userId = UUID.fromString(event.get("userId").asText());
            String category = event.get("category").asText();
            double spent = event.get("spent").asDouble();
            double budget = event.get("budget").asDouble();
            double percentage = event.get("percentage").asDouble();

            alertService.createBudgetWarningAlert(userId, category, spent, budget, percentage);
            log.info("Created budget warning alert for user {}", userId);

        } catch (Exception e) {
            log.error("Error processing budget-warning event", e);
        }
    }

    @KafkaListener(topics = "goal-milestone", groupId = "alerts-service")
    public void handleGoalMilestone(String message) {
        try {
            log.info("Received goal-milestone event: {}", message);
            JsonNode event = objectMapper.readTree(message);

            UUID userId = UUID.fromString(event.get("userId").asText());
            UUID goalId = UUID.fromString(event.get("goalId").asText());
            String goalName = event.get("goalName").asText();
            double progress = event.get("progress").asDouble();

            alertService.createGoalMilestoneAlert(userId, goalId, goalName, progress);
            log.info("Created goal milestone alert for user {}", userId);

        } catch (Exception e) {
            log.error("Error processing goal-milestone event", e);
        }
    }

    @KafkaListener(topics = "goal-achieved", groupId = "alerts-service")
    public void handleGoalAchieved(String message) {
        try {
            log.info("Received goal-achieved event: {}", message);
            JsonNode event = objectMapper.readTree(message);

            UUID userId = UUID.fromString(event.get("userId").asText());
            UUID goalId = UUID.fromString(event.get("goalId").asText());
            String goalName = event.get("goalName").asText();

            alertService.createGoalAchievedAlert(userId, goalId, goalName);
            log.info("Created goal achieved alert for user {}", userId);

        } catch (Exception e) {
            log.error("Error processing goal-achieved event", e);
        }
    }

    @KafkaListener(topics = "unusual-spending", groupId = "alerts-service")
    public void handleUnusualSpending(String message) {
        try {
            log.info("Received unusual-spending event: {}", message);
            JsonNode event = objectMapper.readTree(message);

            UUID userId = UUID.fromString(event.get("userId").asText());
            String category = event.get("category").asText();
            double amount = event.get("amount").asDouble();
            double average = event.get("average").asDouble();

            alertService.createUnusualSpendingAlert(userId, category, amount, average);
            log.info("Created unusual spending alert for user {}", userId);

        } catch (Exception e) {
            log.error("Error processing unusual-spending event", e);
        }
    }
}