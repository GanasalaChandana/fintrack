package com.backend.alerts.kafka;

import com.backend.alerts.dto.TransactionEvent;
import com.backend.alerts.service.AlertProcessingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class TransactionEventConsumer {

    private final AlertProcessingService alertProcessingService;

    @KafkaListener(topics = "transactions.created", groupId = "alerts-service-group", containerFactory = "kafkaListenerContainerFactory")
    public void consumeTransactionEvent(
            @Payload TransactionEvent event,
            @Header(KafkaHeaders.RECEIVED_PARTITION) int partition,
            @Header(KafkaHeaders.OFFSET) long offset) {
        log.info("Consumed transaction event: id={}, partition={}, offset={}",
                event.getId(), partition, offset);

        try {
            alertProcessingService.processTransaction(event);
        } catch (Exception e) {
            log.error("Error processing transaction event: {}", event.getId(), e);
            // In production: implement dead letter queue or retry logic
        }
    }
}