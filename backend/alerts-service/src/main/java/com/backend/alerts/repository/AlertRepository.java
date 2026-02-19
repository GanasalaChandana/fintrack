package com.backend.alerts.repository;

import com.backend.alerts.model.Alert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AlertRepository extends JpaRepository<Alert, Long> {

    List<Alert> findByUserId(String userId);

    List<Alert> findByStatus(String status);

    List<Alert> findByUserIdAndStatus(String userId, String status); // ← was Long

    List<Alert> findByType(String type);

    List<Alert> findByReadFalse();

    List<Alert> findByUserIdAndReadFalse(String userId); // ← was Long

    boolean existsByUserIdAndCategoryAndTypeAndCreatedAtAfter(
            String userId, String category, String type, LocalDateTime date);
}