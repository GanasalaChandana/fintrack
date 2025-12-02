package com.fintrack.budgets_service.repository;

import com.fintrack.budgets_service.entity.Goal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GoalRepository extends JpaRepository<Goal, Long> {

    /**
     * Find all goals for a specific user
     */
    List<Goal> findByUserId(Long userId);

    /**
     * Find active (not achieved) goals for a user
     */
    List<Goal> findByUserIdAndAchievedFalse(Long userId);

    /**
     * Find achieved goals for a user
     */
    List<Goal> findByUserIdAndAchievedTrue(Long userId);
}