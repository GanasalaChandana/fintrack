package com.fintrack.alerts.dto;

import com.fintrack.alerts.entity.AlertRule;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CreateAlertRuleRequest {
    @NotNull
    private AlertRule.RuleType ruleType;
    
    private BigDecimal thresholdAmount;
    private String category;
}