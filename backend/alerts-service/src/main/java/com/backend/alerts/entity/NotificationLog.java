package com.fintrack.alerts.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "notification_log", schema = "alerts")
@Data
public class NotificationLog {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(name = "alert_id")
    private UUID alertId;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Channel channel;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status;
    
    private String recipient;
    
    @Column(name = "sent_at")
    private LocalDateTime sentAt;
    
    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;
    
    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    public enum Channel {
        EMAIL,
        SMS,
        PUSH,
        IN_APP
    }
    
    public enum Status {
        PENDING,
        SENT,
        FAILED
    }
}