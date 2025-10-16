package com.fintrack.reports_service.dto.request;

import lombok.Data;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
public class ReportFilterRequest {
    
    private UUID userId;
    
    private String reportType;
    
    private LocalDate startDate;
    
    private LocalDate endDate;
    
    private List<String> categories;
    
    private String status; // COMPLETED, FAILED, PENDING
    
    private Integer page = 0;
    
    private Integer size = 20;
}

