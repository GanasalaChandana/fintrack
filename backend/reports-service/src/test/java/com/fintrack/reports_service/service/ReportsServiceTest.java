package com.fintrack.reports_service.service;

import com.fintrack.reports_service.dto.request.GenerateReportRequest;
import com.fintrack.reports_service.dto.response.CategoryBreakdownResponse;
import com.fintrack.reports_service.dto.response.SpendingSummaryResponse;
import com.fintrack.reports_service.entity.TransactionAggregate;
import com.fintrack.reports_service.repository.TransactionAggregateRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReportsServiceTest { 

    @Mock
    private TransactionAggregateRepository aggregateRepository;

    @InjectMocks
    private ReportsService reportsService;  // ✅ Changed type

    private UUID testUserId;
    private LocalDate startDate;
    private LocalDate endDate;
    private List<TransactionAggregate> mockAggregates;

    @BeforeEach
    void setUp() {
        testUserId = UUID.randomUUID();
        startDate = LocalDate.of(2025, 10, 1);
        endDate = LocalDate.of(2025, 10, 5);

        // Create mock transaction aggregates
        TransactionAggregate agg1 = new TransactionAggregate();
        agg1.setId(UUID.randomUUID());
        agg1.setUserId(testUserId);
        agg1.setAggregationDate(LocalDate.of(2025, 10, 1));
        agg1.setAggregationType("DAILY");
        agg1.setCategory("Food");
        agg1.setTotalAmount(new BigDecimal("-150.50"));
        agg1.setTransactionCount(5);
        agg1.setAvgAmount(new BigDecimal("-30.10"));

        TransactionAggregate agg2 = new TransactionAggregate();
        agg2.setId(UUID.randomUUID());
        agg2.setUserId(testUserId);
        agg2.setAggregationDate(LocalDate.of(2025, 10, 2));
        agg2.setAggregationType("DAILY");
        agg2.setCategory("Transport");
        agg2.setTotalAmount(new BigDecimal("-50.00"));
        agg2.setTransactionCount(2);
        agg2.setAvgAmount(new BigDecimal("-25.00"));

        TransactionAggregate agg3 = new TransactionAggregate();
        agg3.setId(UUID.randomUUID());
        agg3.setUserId(testUserId);
        agg3.setAggregationDate(LocalDate.of(2025, 10, 3));
        agg3.setAggregationType("DAILY");
        agg3.setCategory("Income");
        agg3.setTotalAmount(new BigDecimal("1000.00"));
        agg3.setTransactionCount(1);
        agg3.setAvgAmount(new BigDecimal("1000.00"));

        mockAggregates = Arrays.asList(agg1, agg2, agg3);
    }

    @Test
    void testGenerateSpendingSummary_Success() {
        // Arrange
        GenerateReportRequest request = new GenerateReportRequest();
        request.setUserId(testUserId);
        request.setReportType("SPENDING_SUMMARY");
        request.setStartDate(startDate);
        request.setEndDate(endDate);

        when(aggregateRepository.findByUserIdAndAggregationDateBetween(
                any(UUID.class), any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(mockAggregates);

        // Act
        SpendingSummaryResponse response = reportsService.generateSpendingSummary(request);

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.getUserId()).isEqualTo(testUserId);
        assertThat(response.getTotalSpending()).isEqualByComparingTo(new BigDecimal("200.50"));
        assertThat(response.getTotalIncome()).isEqualByComparingTo(new BigDecimal("1000.00"));
        assertThat(response.getNetBalance()).isEqualByComparingTo(new BigDecimal("799.50"));
        assertThat(response.getTransactionCount()).isEqualTo(8);
        assertThat(response.getCategorySummaries()).hasSize(3);

        verify(aggregateRepository, times(1))
                .findByUserIdAndAggregationDateBetween(any(UUID.class), any(LocalDate.class), any(LocalDate.class));
    }

    @Test
    void testGenerateSpendingSummary_EmptyData() {
        // Arrange
        GenerateReportRequest request = new GenerateReportRequest();
        request.setUserId(testUserId);
        request.setReportType("SPENDING_SUMMARY");
        request.setStartDate(startDate);
        request.setEndDate(endDate);

        when(aggregateRepository.findByUserIdAndAggregationDateBetween(
                any(UUID.class), any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(Arrays.asList());

        // Act
        SpendingSummaryResponse response = reportsService.generateSpendingSummary(request);

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.getTotalSpending()).isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(response.getTotalIncome()).isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(response.getTransactionCount()).isEqualTo(0);
        assertThat(response.getCategorySummaries()).isEmpty();
    }

    @Test
    void testGenerateCategoryBreakdown_Success() {
        // Arrange
        GenerateReportRequest request = new GenerateReportRequest();
        request.setUserId(testUserId);
        request.setReportType("CATEGORY_BREAKDOWN");
        request.setStartDate(startDate);
        request.setEndDate(endDate);

        Object[] row1 = {"Food", new BigDecimal("150.50"), 5L};
        Object[] row2 = {"Transport", new BigDecimal("50.00"), 2L};
        List<Object[]> mockCategoryTotals = Arrays.asList(row1, row2);

        when(aggregateRepository.findCategoryTotals(
                any(UUID.class), any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(mockCategoryTotals);

        // Act
        CategoryBreakdownResponse response = reportsService.generateCategoryBreakdown(request);

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.getCategories()).hasSize(2);
        assertThat(response.getTotalAmount()).isEqualByComparingTo(new BigDecimal("200.50"));
        
        assertThat(response.getCategories().get(0).getCategoryName()).isEqualTo("Food");
        assertThat(response.getCategories().get(0).getAmount()).isEqualByComparingTo(new BigDecimal("150.50"));
        assertThat(response.getCategories().get(0).getTransactionCount()).isEqualTo(5);

        verify(aggregateRepository, times(1))
                .findCategoryTotals(any(UUID.class), any(LocalDate.class), any(LocalDate.class));
    }

    @Test
    void testCalculateAverageDailySpending() {
        // Arrange
        GenerateReportRequest request = new GenerateReportRequest();
        request.setUserId(testUserId);
        request.setStartDate(startDate);
        request.setEndDate(endDate);

        when(aggregateRepository.findByUserIdAndAggregationDateBetween(
                any(UUID.class), any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(mockAggregates);

        // Act
        SpendingSummaryResponse response = reportsService.generateSpendingSummary(request);

        // Assert
        // Total spending: 200.50, Days: 5, Average: 200.50/5 = 40.10
        assertThat(response.getAverageDailySpending())
                .isEqualByComparingTo(new BigDecimal("40.10"));
    }

    @Test
    void testTopCategory() {
        // Arrange
        GenerateReportRequest request = new GenerateReportRequest();
        request.setUserId(testUserId);
        request.setStartDate(startDate);
        request.setEndDate(endDate);

        when(aggregateRepository.findByUserIdAndAggregationDateBetween(
                any(UUID.class), any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(mockAggregates);

        // Act
        SpendingSummaryResponse response = reportsService.generateSpendingSummary(request);

        // Assert
        assertThat(response.getTopCategory()).isEqualTo("Food");
        assertThat(response.getTopCategoryAmount()).isEqualByComparingTo(new BigDecimal("150.50"));
    }
}
