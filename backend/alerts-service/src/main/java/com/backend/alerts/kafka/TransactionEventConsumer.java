package com.backend.alerts.kafka;

import com.backend.alerts.dto.TransactionEvent;
import com.backend.alerts.service.AlertProcessingService;
import com.backend.alerts.service.AlertService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class TransactionEventConsumer {

    private final AlertProcessingService alertProcessingService;
    private final AlertService alertService;
    private final ObjectMapper objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());

    /** Legacy listener — typed DTO from old topic */
    @KafkaListener(
        topics = "transactions.created",
        groupId = "alerts-service-group",
        containerFactory = "kafkaListenerContainerFactory"
    )
    public void consumeTransactionEvent(
            @Payload TransactionEvent event,
            @Header(KafkaHeaders.RECEIVED_PARTITION) int partition,
            @Header(KafkaHeaders.OFFSET) long offset) {
        log.info("Consumed legacy transaction event: id={}, partition={}, offset={}",
                event.getId(), partition, offset);
        try {
            alertProcessingService.processTransaction(event);
        } catch (Exception e) {
            log.error("Error processing legacy transaction event: {}", event.getId(), e);
        }
    }

    /** New listener — raw JSON string from transaction-events topic */
    @KafkaListener(
        topics = "${app.kafka.topic.transaction-events:transaction-events}",
        groupId = "${spring.kafka.consumer.group-id:alerts-service}",
        containerFactory = "kafkaListenerContainerFactory"
    )
    public void onTransactionEvent(String message, Acknowledgment ack) {
        try {
            log.info("📥 Received transaction event: {}",
                    message.substring(0, Math.min(100, message.length())));

            @SuppressWarnings("unchecked")
            Map<String, Object> event = objectMapper.readValue(message, Map.class);

            String eventType = (String) event.get("eventType");
            String userId    = (String) event.get("userId");
            String category  = (String) event.get("category");
            Object amountObj = event.get("amount");
            BigDecimal amount = amountObj != null
                    ? new BigDecimal(amountObj.toString())
                    : BigDecimal.ZERO;

            if ("CREATED".equals(eventType) || "UPDATED".equals(eventType)) {
                alertService.checkBudgetThreshold(userId, category, amount);
            }

            if (ack != null) ack.acknowledge();
            log.info("✅ Processed {} event for user: {}", eventType, userId);

        } catch (Exception e) {
            log.error("❌ Failed to process transaction event: {}", e.getMessage(), e);
            if (ack != null) ack.acknowledge(); // avoid infinite retry
        }
    }
}
