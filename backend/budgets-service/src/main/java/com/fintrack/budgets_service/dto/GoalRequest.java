package com.fintrack.budgets_service.dto;

import lombok.Data;

@Data
public class GoalRequest {
    private String name;
    private Double target;
    private Double current;
    private String deadline;
    private String icon;
    private String color;
    private String category;
    private Double monthlyContribution;
}