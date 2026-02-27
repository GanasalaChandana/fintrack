package com.fintrack.transactions.client;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.Map;

@Slf4j
@Component
public class MLClassifierClient {

    @Value("${ml-classifier.url:http://localhost:8000}")
    private String mlClassifierUrl;

    @Value("${ml-classifier.enabled:true}")
    private boolean enabled;

    private final RestTemplate restTemplate = new RestTemplate();

    public String classifyTransaction(String description, BigDecimal amount, String merchant) {
        if (!enabled) {
            log.debug("ML Classifier is disabled, using rule-based classification");
            return classifyByRules(description, merchant);
        }

        try {
            log.info("Calling ML Classifier /predict for: {}", description);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> requestBody = Map.of(
                "description", description != null ? description : "",
                "amount", amount != null ? amount.doubleValue() : 0.0,
                "merchant", merchant != null ? merchant : ""
            );

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            @SuppressWarnings("unchecked")
            ResponseEntity<Map> response = restTemplate.postForEntity(
                mlClassifierUrl + "/predict", entity, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Object category = response.getBody().get("category");
                if (category != null) {
                    log.info("✅ ML Classifier returned category: {} for: {}", category, description);
                    return category.toString();
                }
            }

            log.warn("ML Classifier returned unexpected response, falling back to rules");
            return classifyByRules(description, merchant);

        } catch (Exception e) {
            log.warn("ML Classifier failed ({}), falling back to rules: {}", mlClassifierUrl, e.getMessage());
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