package com.fintrack.reports_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ReportGenerationResponse {
    
    private UUID reportId;
    
    private String reportType;
    
    private String format;
    
    private String status;
    
    private String downloadUrl;
    
    private Long fileSizeBytes;
    
    private LocalDateTime generatedAt;
    
    private String message;
}

