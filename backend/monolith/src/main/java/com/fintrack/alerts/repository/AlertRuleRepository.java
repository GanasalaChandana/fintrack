package com.fintrack.alerts.repository;

import com.fintrack.alerts.entity.AlertRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AlertRuleRepository extends JpaRepository<AlertRule, UUID> {

    List<AlertRule> findByUserIdAndIsActiveTrue(UUID userId);

    List<AlertRule> findByUserId(UUID userId);

    List<AlertRule> findByUserIdAndRuleType(UUID userId, AlertRule.RuleType ruleType);
}
