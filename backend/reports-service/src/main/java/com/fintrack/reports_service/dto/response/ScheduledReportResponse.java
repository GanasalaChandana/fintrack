package com.fintrack.reports_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ScheduledReportResponse {
    
    private UUID id;
    
    private UUID userId;
    
    private String reportType;
    
    private String frequency;
    
    private LocalDate startDate;
    
    private LocalDate endDate;
    
    private String format;
    
    private List<String> categories;
    
    private String deliveryMethod;
    
    private String deliveryEmail;
    
    private Boolean active;
    
    private LocalDateTime lastRun;
    
    private LocalDateTime nextRun;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
}

