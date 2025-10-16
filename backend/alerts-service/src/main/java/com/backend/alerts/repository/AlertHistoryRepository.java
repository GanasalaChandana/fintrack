package com.fintrack.alerts.repository;

import com.fintrack.alerts.entity.AlertHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.UUID;

@Repository
public interface AlertHistoryRepository extends JpaRepository<AlertHistory, UUID> {
    
    Page<AlertHistory> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);
    
    long countByUserIdAndIsReadFalse(UUID userId);
    
    @Query("SELECT COUNT(a) FROM AlertHistory a WHERE a.userId = :userId " +
           "AND a.createdAt BETWEEN :start AND :end")
    long countAlertsInTimeWindow(@Param("userId") UUID userId, 
                                  @Param("start") LocalDateTime start, 
                                  @Param("end") LocalDateTime end);
}