package com.fintrack.reports_service.repository;

import com.fintrack.reports_service.entity.ReportHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ReportHistoryRepository extends JpaRepository<ReportHistory, UUID> {
    
    List<ReportHistory> findByUserId(UUID userId);  // Changed from String to UUID
    
    @Query("SELECT r FROM ReportHistory r WHERE r.userId = :userId AND r.status = :status")
    List<ReportHistory> findByUserIdAndStatus(
        @Param("userId") UUID userId,  // Changed from String to UUID
        @Param("status") ReportHistory.ReportStatus status
    );
}
