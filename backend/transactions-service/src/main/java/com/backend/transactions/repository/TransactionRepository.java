package com.fintrack.transactions.repository;

import com.fintrack.transactions.entity.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, UUID> {
    
    Page<Transaction> findByUserId(UUID userId, Pageable pageable);
    
    Page<Transaction> findByUserIdAndCategory(UUID userId, String category, Pageable pageable);
    
    @Query("SELECT t FROM Transaction t WHERE t.userId = :userId " +
           "AND t.transactionDate BETWEEN :startDate AND :endDate")
    Page<Transaction> findByUserIdAndDateRange(
        @Param("userId") UUID userId,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate,
        Pageable pageable
    );
    
    List<Transaction> findByUserIdAndCategoryIsNull(UUID userId);
}