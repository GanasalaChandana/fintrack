package com.fintrack.reports_service.repository;

import com.fintrack.reports_service.entity.SpendingSummaryCache;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SpendingSummaryCacheRepository extends JpaRepository<SpendingSummaryCache, UUID> {
    
    Optional<SpendingSummaryCache> findByUserIdAndPeriodTypeAndPeriodStartAndPeriodEnd(
        UUID userId,
        SpendingSummaryCache.PeriodType periodType,
        LocalDate periodStart,
        LocalDate periodEnd
    );
    
    @Modifying
    @Query("DELETE FROM SpendingSummaryCache ssc WHERE ssc.expiresAt < :now")
    int deleteExpiredCache(LocalDateTime now);
}

