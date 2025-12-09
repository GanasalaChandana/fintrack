package com.fintrack.budgets_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "budgets", schema = "budgets")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Budget {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(nullable = false)
    private String category;

    @Column(nullable = false)
    private Double budget;

    @Column(nullable = false)
    private Double spent = 0.0;

    @Column(name = "spent_amount")
    private Double spentAmount; // Maps to spent_amount in DB

    @Column(nullable = false)
    private String icon = "💰";

    @Column(nullable = false)
    private String color = "#3b82f6";

    @Column(name = "period", nullable = false)
    private String month; // Maps to 'period' column, format: "2025-12"

    @Column(name = "start_date")
    private LocalDateTime startDate;

    @Column(name = "end_date")
    private LocalDateTime endDate;

    @Column(name = "alert_threshold")
    private Integer alertThreshold;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}