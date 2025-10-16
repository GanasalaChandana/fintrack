package com.fintrack.reports_service.dto.request;

import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class UpdateScheduledReportRequest {
    
    private String frequency; // DAILY, WEEKLY, MONTHLY
    
    private LocalDate endDate;
    
    private String format;
    
    private List<String> categories;
    
    private String deliveryMethod;
    
    private String deliveryEmail;
    
    private Boolean active;
}
