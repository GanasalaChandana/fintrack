package com.fintrack.alerts.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "alert_history", schema = "alerts")
@Data
public class AlertHistory {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(name = "user_id", nullable = false)
    private UUID userId;
    
    @Column(name = "rule_id")
    private UUID ruleId;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "alert_type", nullable = false)
    private AlertType alertType;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Severity severity;
    
    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;
    
    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, Object> metadata;
    
    @Column(name = "is_read", nullable = false)
    private Boolean isRead = false;
    
    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    public enum AlertType {
        HIGH_AMOUNT,
        DAILY_LIMIT,
        UNUSUAL_ACTIVITY,
        DUPLICATE,
        BUDGET
    }
    
    public enum Severity {
        INFO,
        WARNING,
        CRITICAL
    }
}