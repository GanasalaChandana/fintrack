package com.fintrack.reports_service.repository;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.TestPropertySource;

import java.time.LocalDate;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@TestPropertySource(properties = {
    "spring.jpa.hibernate.ddl-auto=create-drop",
    "spring.datasource.url=jdbc:h2:mem:testdb"
})
class TransactionAggregateRepositoryTest {

    @Autowired
    private TransactionAggregateRepository repository;

    @Test
    void testRepositoryIsNotNull() {
        assertNotNull(repository);
    }

    @Test
    void testFindByUserIdAndAggregationDateBetween() {
        // This test would require actual transaction data in H2
        // For now, we verify the repository exists and can be called
        UUID userId = UUID.randomUUID();
        LocalDate startDate = LocalDate.now().minusMonths(1);
        LocalDate endDate = LocalDate.now();

        var result = repository.findByUserIdAndAggregationDateBetween(
            userId, startDate, endDate
        );

        assertNotNull(result);
        assertTrue(result.isEmpty()); // No data in test DB
    }
}
