package com.fintrack.reports_service.repository;

import com.fintrack.reports_service.entity.ReportHistory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
class ReportHistoryRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private ReportHistoryRepository repository;

    private UUID userId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
    }

    @Test
    void testSaveAndFindReportHistory() {
        // Arrange
        ReportHistory report = new ReportHistory();
        report.setUserId(userId);
        report.setReportType("SPENDING_SUMMARY");
        report.setStatus(ReportHistory.ReportStatus.COMPLETED);
        report.setGeneratedAt(LocalDateTime.now());

        // Act
        ReportHistory saved = repository.save(report);
        entityManager.flush();

        // Assert
        assertNotNull(saved.getId());
        assertEquals(userId, saved.getUserId());
        assertEquals("SPENDING_SUMMARY", saved.getReportType());
    }

    @Test
    void testFindByUserId() {
        // Arrange
        ReportHistory report1 = createReport(userId, "SPENDING_SUMMARY");
        ReportHistory report2 = createReport(userId, "CATEGORY_BREAKDOWN");
        ReportHistory report3 = createReport(UUID.randomUUID(), "OTHER");

        entityManager.persist(report1);
        entityManager.persist(report2);
        entityManager.persist(report3);
        entityManager.flush();

        // Act
        List<ReportHistory> results = repository.findByUserId(userId);

        // Assert
        assertEquals(2, results.size());
        assertTrue(results.stream().allMatch(r -> r.getUserId().equals(userId)));
    }

    @Test
    void testFindByUserIdAndStatus() {
        // Arrange
        ReportHistory completed = createReport(userId, "TEST");
        completed.setStatus(ReportHistory.ReportStatus.COMPLETED);

        ReportHistory pending = createReport(userId, "TEST2");
        pending.setStatus(ReportHistory.ReportStatus.PENDING);

        entityManager.persist(completed);
        entityManager.persist(pending);
        entityManager.flush();

        // Act
        List<ReportHistory> results = repository.findByUserIdAndStatus(
            userId, 
            ReportHistory.ReportStatus.COMPLETED
        );

        // Assert
        assertEquals(1, results.size());
        assertEquals(ReportHistory.ReportStatus.COMPLETED, results.get(0).getStatus());
    }

    private ReportHistory createReport(UUID userId, String type) {
        ReportHistory report = new ReportHistory();
        report.setUserId(userId);
        report.setReportType(type);
        report.setStatus(ReportHistory.ReportStatus.COMPLETED);
        report.setGeneratedAt(LocalDateTime.now());
        return report;
    }
}
