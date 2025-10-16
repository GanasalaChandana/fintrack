package com.fintrack.transactions.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "transactions", schema = "transactions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Transaction {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @NotNull
    @Column(nullable = false)
    private UUID userId;
    
    @NotNull
    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;
    
    @Column(length = 500)
    private String description;
    
    @NotNull
    @Column(nullable = false)
    private LocalDate transactionDate;
    
    @Column(length = 100)
    private String category;
    
    @Column(length = 255)
    private String merchant;
    
    @Column(length = 50)
    private String paymentMethod;
    
    @Column(columnDefinition = "TEXT")
    private String notes;
    
    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;
}