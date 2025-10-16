package com.fintrack.reports_service.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
public class GenerateReportRequest {
    
    @NotNull(message = "User ID is required")
    private UUID userId;
    
    @NotBlank(message = "Report type is required")
    private String reportType; // SPENDING_SUMMARY, CATEGORY_BREAKDOWN, MONTHLY_COMPARISON, INCOME_VS_EXPENSE
    
    @NotNull(message = "Start date is required")
    private LocalDate startDate;
    
    @NotNull(message = "End date is required")
    private LocalDate endDate;
    
    private List<String> categories; // Optional filter
    
    private String format; // PDF, EXCEL, JSON (default: JSON)
    
    private String groupBy; // DAY, WEEK, MONTH (for trends)
}
