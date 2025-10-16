package com.fintrack.reports_service.repository;

import com.fintrack.reports_service.entity.ScheduledReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface ScheduledReportRepository extends JpaRepository<ScheduledReport, UUID> {
    
    List<ScheduledReport> findByUserId(UUID userId);
    
    @Query("SELECT sr FROM ScheduledReport sr WHERE sr.active = true AND sr.nextRun <= :now")
    List<ScheduledReport> findDueReports(@Param("now") LocalDateTime now);
    
    List<ScheduledReport> findByUserIdAndActive(UUID userId, Boolean active);
}
