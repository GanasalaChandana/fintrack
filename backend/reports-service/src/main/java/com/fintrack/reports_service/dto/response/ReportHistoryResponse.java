package com.fintrack.reports_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ReportHistoryResponse {
    
    private List<ReportRecord> reports;
    
    private Integer totalRecords;
    
    private Integer currentPage;
    
    private Integer totalPages;
    
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ReportRecord {
        private UUID reportId;
        private String reportType;
        private String format;
        private String status;
        private LocalDateTime generatedAt;
        private String downloadUrl;
        private Long fileSizeBytes;
    }
}
