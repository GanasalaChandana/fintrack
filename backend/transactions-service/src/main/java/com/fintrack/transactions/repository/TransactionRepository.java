package com.fintrack.transactions.repository;

import com.fintrack.transactions.entity.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    Page<Transaction> findByUserId(String userId, Pageable pageable);

    Optional<Transaction> findByIdAndUserId(Long id, String userId);

    void deleteByIdAndUserId(Long id, String userId);

    @Query(value = "SELECT t.* FROM public.transactions t WHERE t.user_id = :userId " +
            "AND (:type IS NULL OR t.type = :type) " +
            "AND (:category IS NULL OR t.category = :category) " +
            "AND (:startDate IS NULL OR t.date >= :startDate) " +
            "AND (:endDate IS NULL OR t.date <= :endDate) " +
            "AND (:search IS NULL OR LOWER(CAST(t.description AS TEXT)) LIKE LOWER(CONCAT('%', :search, '%')) " +
            "     OR LOWER(CAST(t.merchant AS TEXT)) LIKE LOWER(CONCAT('%', :search, '%')))" +
            "ORDER BY t.date DESC", countQuery = "SELECT COUNT(*) FROM public.transactions t WHERE t.user_id = :userId "
                    +
                    "AND (:type IS NULL OR t.type = :type) " +
                    "AND (:category IS NULL OR t.category = :category) " +
                    "AND (:startDate IS NULL OR t.date >= :startDate) " +
                    "AND (:endDate IS NULL OR t.date <= :endDate) " +
                    "AND (:search IS NULL OR LOWER(CAST(t.description AS TEXT)) LIKE LOWER(CONCAT('%', :search, '%')) "
                    +
                    "     OR LOWER(CAST(t.merchant AS TEXT)) LIKE LOWER(CONCAT('%', :search, '%')))", nativeQuery = true)
    Page<Transaction> findByFilters(
            @Param("userId") String userId,
            @Param("type") String type,
            @Param("category") String category,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("search") String search,
            Pageable pageable);
}