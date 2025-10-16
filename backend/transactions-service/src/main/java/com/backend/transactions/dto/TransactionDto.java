package com.fintrack.transactions.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionDto {
    private UUID id;
    private UUID userId;
    private BigDecimal amount;
    private String description;
    private LocalDate transactionDate;
    private String category;
    private String merchant;
    private String paymentMethod;
    private String notes;
    private LocalDateTime createdAt;
}