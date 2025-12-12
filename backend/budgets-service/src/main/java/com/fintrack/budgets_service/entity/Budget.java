package com.fintrack.budgets_service.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "budgets")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Budget {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    @NotBlank(message = "User ID is required")
    private String userId;

    @Column(nullable = false)
    @NotBlank(message = "Category is required")
    private String category;

    @Column(nullable = false)
    @NotNull(message = "Budget amount is required")
    @Min(value = 0, message = "Budget must be non-negative")
    private Double budget;

    @Builder.Default
    @Column(nullable = false)
    @Min(value = 0, message = "Spent amount must be non-negative")
    private Double spent = 0.0;

    @Column(nullable = false)
    @NotBlank(message = "Month is required")
    private String month; // Format: YYYY-MM

    @Builder.Default
    @Column(length = 10)
    private String icon = "💰";

    @Builder.Default
    @Column(length = 20)
    private String color = "#3b82f6";

    @Builder.Default
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "start_date")
    private LocalDateTime startDate;

    @Column(name = "end_date")
    private LocalDateTime endDate;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();
}