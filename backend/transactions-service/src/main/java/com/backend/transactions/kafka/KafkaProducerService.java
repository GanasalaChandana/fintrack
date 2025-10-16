package com.fintrack.transactions.kafka;

import com.fintrack.transactions.event.TransactionCreatedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class KafkaProducerService {
    
    private final KafkaTemplate<String, TransactionCreatedEvent> kafkaTemplate;
    
    @Value("${kafka.topics.transaction-created}")
    private String transactionCreatedTopic;
    
    public void publishTransactionCreated(TransactionCreatedEvent event) {
        log.info("Publishing transaction created event: {}", event.getTransactionId());
        kafkaTemplate.send(transactionCreatedTopic, event.getTransactionId().toString(), event);
    }
}