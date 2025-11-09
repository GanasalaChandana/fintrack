package com.fintrack.transactions.client;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;

@Slf4j
@Component
public class MLClassifierClient {

    @Value("${ml-classifier.url:http://localhost:5000}")
    private String mlClassifierUrl;

    @Value("${ml-classifier.enabled:false}")
    private boolean enabled;

    private final RestTemplate restTemplate = new RestTemplate();

    public String classifyTransaction(String description, BigDecimal amount, String merchant) {
        if (!enabled) {
            log.debug("ML Classifier is disabled, using rule-based classification");
            return classifyByRules(description, merchant);
        }

        try {
            log.info("Calling ML Classifier for: {}", description);
            // TODO: Implement actual ML service call when available
            return classifyByRules(description, merchant);
        } catch (Exception e) {
            log.warn("ML Classifier failed, falling back to rules: {}", e.getMessage());
            return classifyByRules(description, merchant);
        }
    }

    private String classifyByRules(String description, String merchant) {
        String text = (description + " " + (merchant != null ? merchant : "")).toLowerCase();

        // Food & Dining
        if (text.contains("restaurant") || text.contains("food") || text.contains("cafe") || 
            text.contains("coffee") || text.contains("pizza") || text.contains("lunch") || 
            text.contains("dinner") || text.contains("breakfast")) {
            return "Food & Dining";
        }

        // Transportation
        if (text.contains("uber") || text.contains("lyft") || text.contains("taxi") || 
            text.contains("gas") || text.contains("fuel") || text.contains("parking") || 
            text.contains("transport")) {
            return "Transportation";
        }

        // Shopping
        if (text.contains("amazon") || text.contains("walmart") || text.contains("target") || 
            text.contains("shop") || text.contains("store") || text.contains("mall")) {
            return "Shopping";
        }

        // Entertainment
        if (text.contains("movie") || text.contains("netflix") || text.contains("spotify") || 
            text.contains("game") || text.contains("concert") || text.contains("entertainment")) {
            return "Entertainment";
        }

        // Utilities
        if (text.contains("electric") || text.contains("water") || text.contains("internet") || 
            text.contains("phone") || text.contains("utility") || text.contains("bill")) {
            return "Utilities";
        }

        // Healthcare
        if (text.contains("doctor") || text.contains("pharmacy") || text.contains("hospital") || 
            text.contains("medical") || text.contains("health") || text.contains("dental")) {
            return "Healthcare";
        }

        // Income
        if (text.contains("salary") || text.contains("paycheck") || text.contains("deposit") || 
            text.contains("income") || text.contains("payment received")) {
            return "Income";
        }

        return "Other";
    }
}