package com.fintrack.budgets_service.repository;

import com.fintrack.budgets_service.entity.Budget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, String> {
    
    List<Budget> findByUserId(String userId);
    
    List<Budget> findByUserIdAndIsActiveTrue(String userId);
    
    List<Budget> findByUserIdAndCategory(String userId, String category);
    
    @Query("SELECT b FROM Budget b WHERE b.userId = :userId AND b.startDate <= :date AND b.endDate >= :date")
    List<Budget> findActiveBudgetsByUserIdAndDate(String userId, LocalDateTime date);
}
