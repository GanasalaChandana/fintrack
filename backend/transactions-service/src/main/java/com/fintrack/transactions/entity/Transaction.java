package com.fintrack.transactions.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Transaction {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "user_id", nullable = false, columnDefinition = "VARCHAR(255)")
    @JdbcTypeCode(SqlTypes.VARCHAR)
    private String userId;
    
    @Column(nullable = false, columnDefinition = "VARCHAR(500)")
    @JdbcTypeCode(SqlTypes.VARCHAR)
    private String description;
    
    @Column(nullable = false)
    private BigDecimal amount;
    
    @Column(columnDefinition = "VARCHAR(255)")
    @JdbcTypeCode(SqlTypes.VARCHAR)
    private String merchant;
    
    @Column(columnDefinition = "VARCHAR(100)")
    @JdbcTypeCode(SqlTypes.VARCHAR)
    private String category;
    
    @Column(nullable = false, columnDefinition = "VARCHAR(20)")
    @JdbcTypeCode(SqlTypes.VARCHAR)
    private String type; // INCOME or EXPENSE
    
    @Column(nullable = false)
    private LocalDate date;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}