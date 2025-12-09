package com.backend.alerts.dto;

import com.backend.alerts.entity.AlertRule;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CreateAlertRuleRequest {

    @NotBlank(message = "Name is required")
    private String name;

    private String description;

    @NotNull(message = "Rule type is required")
    private AlertRule.RuleType ruleType;

    private BigDecimal thresholdAmount;

    private String category;

    private Boolean isActive = true;
}