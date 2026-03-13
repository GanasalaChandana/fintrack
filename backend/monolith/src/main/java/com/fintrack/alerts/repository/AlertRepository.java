package com.fintrack.alerts.repository;

import com.fintrack.alerts.entity.Alert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AlertRepository extends JpaRepository<Alert, Long> {

    List<Alert> findByUserId(String userId);

    List<Alert> findByStatus(String status);

    List<Alert> findByUserIdAndStatus(String userId, String status);

    List<Alert> findByType(String type);

    List<Alert> findByReadFalse();

    List<Alert> findByUserIdAndReadFalse(String userId);

    boolean existsByUserIdAndCategoryAndTypeAndCreatedAtAfter(
            String userId, String category, String type, LocalDateTime date);
}
