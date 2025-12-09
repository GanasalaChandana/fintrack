package com.backend.alerts.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "alert_history")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AlertHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(nullable = false)
    private UUID userId;

    private UUID ruleId; // Add this field

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AlertType alertType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Severity severity;

    @Column(nullable = false, length = 1000)
    private String message;

    @Column(columnDefinition = "TEXT")
    private String metadata;

    @Builder.Default // Add this annotation
    @Column(nullable = false)
    private Boolean isRead = false;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public enum AlertType {
        BUDGET_EXCEEDED,
        BUDGET_WARNING,
        HIGH_AMOUNT,
        UNUSUAL_SPENDING,
        GOAL_MILESTONE,
        GOAL_ACHIEVED,
        RECURRING_PAYMENT,
        SYSTEM
    }

    public enum Severity {
        INFO,
        WARNING,
        HIGH,
        CRITICAL
    }
}