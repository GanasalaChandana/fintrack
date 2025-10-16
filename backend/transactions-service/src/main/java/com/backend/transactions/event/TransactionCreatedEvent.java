package com.fintrack.transactions.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionCreatedEvent {
    private UUID transactionId;
    private UUID userId;
    private BigDecimal amount;
    private String description;
    private LocalDate transactionDate;
    private String merchant;
    private String paymentMethod;
}