package com.fintrack.budgets_service.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GoalDTO {

    private Long id;

    private Long userId;

    @NotBlank(message = "Goal name is required")
    private String name;

    @NotNull(message = "Target amount is required")
    @Positive(message = "Target amount must be positive")
    @JsonProperty("target")
    private BigDecimal targetAmount;

    @JsonProperty("current")
    private BigDecimal currentAmount;

    private LocalDate deadline;

    @NotBlank(message = "Category is required")
    private String category;

    private String icon;

    private String color;

    @JsonProperty("monthlyContribution")
    private BigDecimal monthlyContribution;
}