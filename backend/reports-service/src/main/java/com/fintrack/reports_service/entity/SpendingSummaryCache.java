package com.fintrack.reports_service.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Data
@Table(schema = "reports", name = "spending_summary_cache")
public class SpendingSummaryCache {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Enumerated(EnumType.STRING)
    @Column(name = "period_type", nullable = false, length = 20)
    private PeriodType periodType;

    @Column(name = "period_start", nullable = false)
    private LocalDate periodStart;

    @Column(name = "period_end", nullable = false)
    private LocalDate periodEnd;

    // Optional aggregate; matches V2 SQL (can keep or remove if not needed)
    @Column(name = "total_amount", precision = 19, scale = 2)
    private BigDecimal totalAmount;

    // Store JSON; mapping as String. TEXT works for both H2 and PostgreSQL
    @Column(name = "data", columnDefinition = "TEXT")
    private String data;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public enum PeriodType {
        DAILY, WEEKLY, MONTHLY, QUARTERLY, YEARLY, CUSTOM
    }

    @PrePersist
    void onCreate() {
        var now = LocalDateTime.now();
        if (createdAt == null) createdAt = now;
        if (updatedAt == null) updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}