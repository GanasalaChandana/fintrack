package com.fintrack.budgets_service.repository;

import com.fintrack.budgets_service.entity.Budget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, String> {
    List<Budget> findByUserId(String userId);

    List<Budget> findByUserIdAndMonth(String userId, String month);
}