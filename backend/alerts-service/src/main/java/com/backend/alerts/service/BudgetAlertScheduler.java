package com.backend.alerts.service; // ✅ match your existing package name

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class BudgetAlertScheduler {

    private final AlertService alertService;
    private final WebClient webClient;

    @Value("${services.budgets.url:http://localhost:8085}")
    private String budgetsServiceUrl;

    public BudgetAlertScheduler(AlertService alertService, WebClient.Builder builder) {
        this.alertService = alertService;
        this.webClient = builder.build();
    }

    @Scheduled(fixedDelay = 3600000) // every hour
    public void checkBudgetAlerts() {
        log.info("🔔 Running budget alert check...");
        try {
            List<Map> budgets = webClient.get()
                    .uri(budgetsServiceUrl + "/budgets/all-with-spending")
                    .retrieve()
                    .bodyToFlux(Map.class)
                    .collectList()
                    .onErrorResume(e -> {
                        log.warn("⚠️ Could not fetch budgets: {}", e.getMessage());
                        return Mono.just(List.of());
                    })
                    .block();

            if (budgets == null || budgets.isEmpty()) {
                log.info("No budgets found to check");
                return;
            }

            for (Map budget : budgets) {
                try {
                    String userId = (String) budget.get("userId");
                    String category = (String) budget.get("category");
                    if (userId == null || category == null)
                        continue;

                    double budgetAmount = ((Number) budget.getOrDefault("budget", 0)).doubleValue();
                    double spent = ((Number) budget.getOrDefault("spent", 0)).doubleValue();

                    if (budgetAmount <= 0)
                        continue;

                    double percentage = (spent / budgetAmount) * 100;

                    if (percentage >= 100) {
                        alertService.createAlertIfNotExists(
                                userId, category, "EXCEEDED_100",
                                "Budget Exceeded: " + category,
                                String.format("You've exceeded your %s budget by $%.2f (spent $%.2f of $%.2f)",
                                        category, spent - budgetAmount, spent, budgetAmount),
                                "HIGH");
                    } else if (percentage >= 80) {
                        alertService.createAlertIfNotExists(
                                userId, category, "WARNING_80",
                                "Budget Warning: " + category,
                                String.format("You've used %.0f%% of your %s budget ($%.2f of $%.2f)",
                                        percentage, category, spent, budgetAmount),
                                "MEDIUM");
                    }
                } catch (Exception e) {
                    log.warn("⚠️ Error processing budget alert: {}", e.getMessage());
                }
            }
            log.info("✅ Budget alert check complete");
        } catch (Exception e) {
            log.error("❌ Budget alert check failed: {}", e.getMessage());
        }
    }
}