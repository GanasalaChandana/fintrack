package com.fintrack.reports_service.controller;

import com.fintrack.reports_service.dto.request.GenerateReportRequest;
import com.fintrack.reports_service.dto.response.SpendingSummaryResponse;
import com.fintrack.reports_service.entity.ReportHistory;
import com.fintrack.reports_service.repository.ReportHistoryRepository;
import com.fintrack.reports_service.service.ReportsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportsService reportsService;
    private final ReportHistoryRepository historyRepository;

    @PostMapping("/spending-summary")
    public ResponseEntity<SpendingSummaryResponse> generateSpendingSummary(
            @Valid @RequestBody GenerateReportRequest request) {
        
        if (request.getUserId() == null) {
            return ResponseEntity.badRequest().build();
        }
        
        SpendingSummaryResponse response = reportsService.generateSpendingSummary(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/history/{userId}")
    public ResponseEntity<List<ReportHistory>> getReportHistory(
            @PathVariable UUID userId) {
        List<ReportHistory> history = historyRepository.findByUserId(userId);
        return ResponseEntity.ok(history);
    }
}
