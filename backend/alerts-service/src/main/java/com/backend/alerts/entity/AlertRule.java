package com.backend.alerts.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "alert_rules")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AlertRule {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(nullable = false)
    private UUID userId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RuleType ruleType;

    @Column(nullable = false)
    private BigDecimal thresholdAmount;

    private String category;

    @Builder.Default
    @Column(nullable = false)
    private Boolean isActive = true;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

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

    public enum RuleType {
        BUDGET_EXCEEDED,
        BUDGET_WARNING,
        HIGH_AMOUNT, // ← ADD THIS LINE
        UNUSUAL_SPENDING,
        GOAL_MILESTONE,
        GOAL_ACHIEVED,
        RECURRING_PAYMENT_DUE,
        DAILY_LIMIT
    }
}