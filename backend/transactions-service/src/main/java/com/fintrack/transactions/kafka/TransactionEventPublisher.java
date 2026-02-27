package com.fintrack.transactions.kafka;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class TransactionEventPublisher {

    private final KafkaTemplate<String, String> kafkaTemplate;

    @Value("${app.kafka.topic.transaction-events:transaction-events}")
    private String transactionEventsTopic;

    private final ObjectMapper objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());

    public void publishTransactionCreated(TransactionEvent event) {
        publish(event, "CREATED");
    }

    public void publishTransactionUpdated(TransactionEvent event) {
        publish(event, "UPDATED");
    }

    public void publishTransactionDeleted(String transactionId, String userId) {
        TransactionEvent event = TransactionEvent.builder()
                .transactionId(transactionId)
                .userId(userId)
                .eventType("DELETED")
                .build();
        publish(event, "DELETED");
    }

    private void publish(TransactionEvent event, String eventType) {
        try {
            event.setEventType(eventType);
            String message = objectMapper.writeValueAsString(event);
            kafkaTemplate.send(transactionEventsTopic, event.getUserId(), message);
            log.info("📤 Published {} event for transaction: {} (user: {})",
                    eventType, event.getTransactionId(), event.getUserId());
        } catch (JsonProcessingException e) {
            log.error("❌ Failed to serialize transaction event: {}", e.getMessage());
        } catch (Exception e) {
            // Don't throw — Kafka failure should not break transaction creation
            log.warn("⚠️ Failed to publish transaction event (Kafka may be unavailable): {}", e.getMessage());
        }
    }
}
