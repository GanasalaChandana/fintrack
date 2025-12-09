package com.backend.alerts.repository;

import com.backend.alerts.entity.AlertHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface AlertHistoryRepository extends JpaRepository<AlertHistory, UUID> {

       List<AlertHistory> findByUserId(UUID userId);

       Page<AlertHistory> findByUserId(UUID userId, Pageable pageable);

       List<AlertHistory> findByUserIdAndIsReadFalse(UUID userId);

       List<AlertHistory> findByUserIdAndAlertType(UUID userId, AlertHistory.AlertType alertType);

       List<AlertHistory> findByUserIdAndCreatedAtBetween(UUID userId, LocalDateTime start, LocalDateTime end);

       long countByUserIdAndIsReadFalse(UUID userId);
}