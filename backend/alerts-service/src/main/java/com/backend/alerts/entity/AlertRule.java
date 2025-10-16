package com.fintrack.alerts.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "alert_rules", schema = "alerts")
@Data
public class AlertRule {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(name = "user_id", nullable = false)
    private UUID userId;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "rule_type", nullable = false)
    private RuleType ruleType;
    
    @Column(name = "threshold_amount")
    private BigDecimal thresholdAmount;
    
    private String category;
    
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
    
    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    public enum RuleType {
        HIGH_AMOUNT,           // Single transaction exceeds threshold
        DAILY_LIMIT_EXCEEDED,  // Daily spending exceeds limit
        UNUSUAL_CATEGORY,      // Spending in unusual category
        DUPLICATE_TRANSACTION, // Potential duplicate
        BUDGET_WARNING         // Approaching budget limit
    }
}