package com.backend.alerts.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TransactionEvent {
    private UUID id;
    private UUID userId;
    private BigDecimal amount;
    private String type; // INCOME, EXPENSE
    private String category;
    private String description;
    private LocalDateTime transactionDate;
    private LocalDateTime createdAt;
}