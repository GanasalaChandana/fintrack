package com.backend.alerts.repository;

import com.backend.alerts.model.Alert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AlertRepository extends JpaRepository<Alert, Long> {

    List<Alert> findByUserId(Long userId);

    // Optional: Add additional custom query methods if needed
    List<Alert> findByStatus(String status);

    List<Alert> findByUserIdAndStatus(Long userId, String status);

    List<Alert> findByType(String type);
}