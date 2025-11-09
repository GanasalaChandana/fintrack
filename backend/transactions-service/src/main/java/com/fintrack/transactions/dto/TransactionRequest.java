package com.fintrack.transactions.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TransactionRequest {
    private String description;
    private BigDecimal amount;
    private String merchant;
    private String category;
    private String type;
    private LocalDate date;
}