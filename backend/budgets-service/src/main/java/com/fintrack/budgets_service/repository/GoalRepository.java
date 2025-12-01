package com.fintrack.budgets_service.repository;

import com.fintrack.budgets_service.entity.Goal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GoalRepository extends JpaRepository<Goal, Long> {

    // Your existing method...
    List<Goal> findByUserId(Long userId);

    // ========== OPTIONAL: NEW METHOD FOR ACTIVE GOALS ==========

    /**
     * Find active (not achieved) goals for a user
     */
    List<Goal> findByUserIdAndIsAchievedFalse(Long userId);
}