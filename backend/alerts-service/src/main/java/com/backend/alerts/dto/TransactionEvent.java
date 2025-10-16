package com.fintrack.alerts.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class TransactionEvent {
    private UUID id;
    private UUID userId;
    
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate date;
    
    private String description;
    private BigDecimal amount;
    private String category;
    private String type;  // DEBIT, CREDIT
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private String createdAt;
}