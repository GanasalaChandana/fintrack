package com.fintrack.reports_service.service;

import com.fintrack.reports_service.dto.request.GenerateReportRequest;
import com.fintrack.reports_service.dto.response.*;
import com.fintrack.reports_service.entity.TransactionAggregate;
import com.fintrack.reports_service.repository.TransactionAggregateRepository;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.Timer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReportsService {

    private final TransactionAggregateRepository aggregateRepository;
    private final Counter reportGeneratedCounter;
    private final Timer reportGenerationTimer;
    private final Counter cacheHitCounter;
    private final Counter cacheMissCounter;

    @Cacheable(value = "spendingSummary", key = "#request.userId + '_' + #request.startDate + '_' + #request.endDate")
    public SpendingSummaryResponse generateSpendingSummary(GenerateReportRequest request) {
        return reportGenerationTimer.record(() -> {
            log.info("Generating spending summary for user: {}", request.getUserId());
            
            // Increment cache miss counter (cache hit is tracked in aspect)
            cacheMissCounter.increment();

            List<TransactionAggregate> aggregates = aggregateRepository
                .findByUserIdAndAggregationDateBetween(
                    request.getUserId(),
                    request.getStartDate(),
                    request.getEndDate()
                );

            if (aggregates.isEmpty()) {
                reportGeneratedCounter.increment();
                return createEmptySummary(request);
            }

            BigDecimal totalSpending = BigDecimal.ZERO;
            BigDecimal totalIncome = BigDecimal.ZERO;
            int transactionCount = 0;
            Map<String, CategoryData> categoryMap = new HashMap<>();

            for (TransactionAggregate agg : aggregates) {
                BigDecimal amount = agg.getTotalAmount();
                transactionCount += agg.getTransactionCount();

                if (amount.compareTo(BigDecimal.ZERO) < 0) {
                    totalSpending = totalSpending.add(amount.abs());
                } else {
                    totalIncome = totalIncome.add(amount);
                }

                String category = agg.getCategory() != null ? agg.getCategory() : "Uncategorized";
                categoryMap.computeIfAbsent(category, k -> new CategoryData())
                    .add(amount, agg.getTransactionCount());
            }

            long daysBetween = request.getEndDate().toEpochDay() - request.getStartDate().toEpochDay() + 1;
            BigDecimal avgDailySpending = totalSpending.divide(
                BigDecimal.valueOf(daysBetween), 2, RoundingMode.HALF_UP
            );

            Map.Entry<String, CategoryData> topCategoryEntry = categoryMap.entrySet().stream()
                .max(Comparator.comparing((Map.Entry<String, CategoryData> e) -> e.getValue().getAbsoluteAmount()))
                .orElse(null);

            // Make an effectively-final copy for use inside the lambda
            final BigDecimal totalSpendingForPct = totalSpending;

            List<SpendingSummaryResponse.CategorySummary> categorySummaries = categoryMap.entrySet().stream()
                .map(entry -> {
                    BigDecimal catAmount = entry.getValue().getAbsoluteAmount();
                    double percentage = totalSpendingForPct.compareTo(BigDecimal.ZERO) > 0
                        ? catAmount.divide(totalSpendingForPct, 4, RoundingMode.HALF_UP)
                            .multiply(BigDecimal.valueOf(100)).doubleValue()
                        : 0.0;

                    return new SpendingSummaryResponse.CategorySummary(
                        entry.getKey(),
                        catAmount,
                        entry.getValue().getCount(),
                        percentage
                    );
                })
                .sorted(Comparator.comparing(SpendingSummaryResponse.CategorySummary::getAmount).reversed())
                .collect(Collectors.toList());

            SpendingSummaryResponse response = new SpendingSummaryResponse();
            response.setUserId(request.getUserId());
            response.setStartDate(request.getStartDate());
            response.setEndDate(request.getEndDate());
            response.setTotalSpending(totalSpending);
            response.setTotalIncome(totalIncome);
            response.setNetBalance(totalIncome.subtract(totalSpending));
            response.setTransactionCount(transactionCount);
            response.setAverageDailySpending(avgDailySpending);
            response.setTopCategory(topCategoryEntry != null ? topCategoryEntry.getKey() : "None");
            response.setTopCategoryAmount(topCategoryEntry != null ? topCategoryEntry.getValue().getAbsoluteAmount() : BigDecimal.ZERO);
            response.setCategorySummaries(categorySummaries);

            // Increment report generated counter
            reportGeneratedCounter.increment();
            
            log.info("Spending summary generated successfully for user: {}", request.getUserId());
            return response;
        });
    }

    public CategoryBreakdownResponse generateCategoryBreakdown(GenerateReportRequest request) {
        return reportGenerationTimer.record(() -> {
            log.info("Generating category breakdown for user: {}", request.getUserId());

            List<Object[]> categoryTotals = aggregateRepository.findCategoryTotals(
                request.getUserId(),
                request.getStartDate(),
                request.getEndDate()
            );

            BigDecimal totalAmount = BigDecimal.ZERO;
            List<CategoryBreakdownResponse.CategoryDetail> categories = new ArrayList<>();

            for (Object[] row : categoryTotals) {
                String category = (String) row[0];
                BigDecimal amount = (BigDecimal) row[1];
                Long count = (Long) row[2];

                totalAmount = totalAmount.add(amount.abs());

                CategoryBreakdownResponse.CategoryDetail detail = new CategoryBreakdownResponse.CategoryDetail();
                detail.setCategoryName(category);
                detail.setAmount(amount.abs());
                detail.setTransactionCount(count.intValue());
                detail.setAverageTransactionAmount(
                    count > 0 ? amount.abs().divide(BigDecimal.valueOf(count), 2, RoundingMode.HALF_UP) : BigDecimal.ZERO
                );

                categories.add(detail);
            }

            for (CategoryBreakdownResponse.CategoryDetail detail : categories) {
                double percentage = totalAmount.compareTo(BigDecimal.ZERO) > 0
                    ? detail.getAmount().divide(totalAmount, 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100)).doubleValue()
                    : 0.0;
                detail.setPercentageOfTotal(percentage);
            }

            CategoryBreakdownResponse response = new CategoryBreakdownResponse();
            response.setStartDate(request.getStartDate());
            response.setEndDate(request.getEndDate());
            response.setCategories(categories);
            response.setTotalAmount(totalAmount);

            // Increment report generated counter
            reportGeneratedCounter.increment();
            
            log.info("Category breakdown generated successfully for user: {}", request.getUserId());
            return response;
        });
    }

    private SpendingSummaryResponse createEmptySummary(GenerateReportRequest request) {
        SpendingSummaryResponse response = new SpendingSummaryResponse();
        response.setUserId(request.getUserId());
        response.setStartDate(request.getStartDate());
        response.setEndDate(request.getEndDate());
        response.setTotalSpending(BigDecimal.ZERO);
        response.setTotalIncome(BigDecimal.ZERO);
        response.setNetBalance(BigDecimal.ZERO);
        response.setTransactionCount(0);
        response.setAverageDailySpending(BigDecimal.ZERO);
        response.setTopCategory("None");
        response.setTopCategoryAmount(BigDecimal.ZERO);
        response.setCategorySummaries(new ArrayList<>());
        return response;
    }

    // Accumulates per-category spending (expenses only)
    private static final class CategoryData {
        private BigDecimal spending = BigDecimal.ZERO;
        private int count = 0;

        void add(BigDecimal amount, int txCount) {
            if (amount == null) return;
            if (amount.compareTo(BigDecimal.ZERO) < 0) {
                // Only track expenses toward spending totals
                spending = spending.add(amount.abs());
                count += txCount;
            }
        }

        BigDecimal getAbsoluteAmount() {
            return spending;
        }

        int getCount() {
            return count;
        }
    }
}