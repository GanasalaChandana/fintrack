package com.fintrack.budgets_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "budgets")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Budget {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String userId;

    @Column(nullable = false)
    private String category;

    @Column(nullable = false)
    private Double budget;

    @Column(nullable = false)
    private Double spent = 0.0;

    @Column(nullable = false)
    private String icon = "💰";

    @Column(nullable = false)
    private String color = "#3b82f6";

    @Column(nullable = false)
    private String month; // Format: "2025-11"

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}