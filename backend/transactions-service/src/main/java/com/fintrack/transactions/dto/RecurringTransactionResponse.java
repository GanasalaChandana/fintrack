package com.fintrack.transactions.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class RecurringTransactionResponse {
    private Long id;
    private String userId;
    private String description;
    private BigDecimal amount;
    private String merchant;
    private String category;
    private String type;
    private String frequency;
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalDate nextOccurrence;
    private Boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}