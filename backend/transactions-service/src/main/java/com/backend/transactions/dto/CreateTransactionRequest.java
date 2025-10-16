package com.fintrack.transactions.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class CreateTransactionRequest {
    
    @NotNull(message = "User ID is required")
    private UUID userId;
    
    @NotNull(message = "Amount is required")
    private BigDecimal amount;
    
    private String description;
    
    @NotNull(message = "Transaction date is required")
    private LocalDate transactionDate;
    
    private String category;
    private String merchant;
    private String paymentMethod;
    private String notes;
}