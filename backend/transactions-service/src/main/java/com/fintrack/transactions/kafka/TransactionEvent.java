package com.fintrack.transactions.kafka;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionEvent {
    private String transactionId;
    private String userId;
    private String description;
    private BigDecimal amount;
    private String category;
    private String type; // INCOME or EXPENSE
    private LocalDate date;
    private String eventType; // CREATED, UPDATED, DELETED
}
