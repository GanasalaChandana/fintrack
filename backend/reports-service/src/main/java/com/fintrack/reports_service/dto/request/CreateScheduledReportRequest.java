package com.fintrack.reports_service.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
public class CreateScheduledReportRequest {
    
    @NotNull(message = "User ID is required")
    private UUID userId;
    
    @NotBlank(message = "Report type is required")
    private String reportType;
    
    @NotBlank(message = "Frequency is required")
    private String frequency; // DAILY, WEEKLY, MONTHLY
    
    @NotNull(message = "Start date is required")
    private LocalDate startDate;
    
    private LocalDate endDate; // Optional, null = no end
    
    private String format; // PDF, EXCEL, JSON
    
    private List<String> categories;
    
    private String deliveryMethod; // EMAIL, DOWNLOAD
    
    private String deliveryEmail;
}
