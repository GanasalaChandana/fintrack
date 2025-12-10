package com.fintrack.budgets_service.service;

import com.fintrack.budgets_service.dto.GoalDTO;
import com.fintrack.budgets_service.entity.Goal;
import com.fintrack.budgets_service.exception.ResourceNotFoundException;
import com.fintrack.budgets_service.repository.GoalRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class GoalService {

    private final GoalRepository goalRepository;

    /**
     * Get all goals for a specific user
     */
    public List<GoalDTO> getAllGoalsByUserId(String userId) {
        log.info("Fetching all goals for user: {}", userId);

        if (userId == null || userId.trim().isEmpty()) {
            throw new IllegalArgumentException("User ID cannot be null or empty");
        }

        List<Goal> goals = goalRepository.findByUserId(userId);
        log.info("Found {} goals for user {}", goals.size(), userId);

        return goals.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get a specific goal by ID for a user
     */
    public GoalDTO getGoalById(String id, String userId) {
        log.info("Fetching goal {} for user {}", id, userId);

        if (id == null || id.trim().isEmpty()) {
            throw new IllegalArgumentException("Goal ID cannot be null or empty");
        }
        if (userId == null || userId.trim().isEmpty()) {
            throw new IllegalArgumentException("User ID cannot be null or empty");
        }

        Goal goal = goalRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Goal with ID " + id + " not found for user " + userId));

        return convertToDTO(goal);
    }

    /**
     * Create a new goal
     */
    @Transactional
    public GoalDTO createGoal(GoalDTO goalDTO) {
        log.info("Creating goal: {} for user: {}", goalDTO.getName(), goalDTO.getUserId());

        // Validation
        if (goalDTO.getUserId() == null || goalDTO.getUserId().trim().isEmpty()) {
            throw new IllegalArgumentException("User ID is required");
        }
        if (goalDTO.getName() == null || goalDTO.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Goal name is required");
        }
        if (goalDTO.getTargetAmount() == null || goalDTO.getTargetAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Target amount must be greater than zero");
        }

        Goal goal = Goal.builder()
                .userId(goalDTO.getUserId())
                .name(goalDTO.getName())
                .targetAmount(goalDTO.getTargetAmount())
                .currentAmount(goalDTO.getCurrentAmount() != null
                        ? goalDTO.getCurrentAmount()
                        : BigDecimal.ZERO)
                .deadline(goalDTO.getDeadline())
                .category(goalDTO.getCategory() != null
                        ? goalDTO.getCategory()
                        : "Other")
                .icon(goalDTO.getIcon() != null
                        ? goalDTO.getIcon()
                        : "🎯")
                .color(goalDTO.getColor() != null
                        ? goalDTO.getColor()
                        : "#10b981")
                .monthlyContribution(goalDTO.getMonthlyContribution() != null
                        ? goalDTO.getMonthlyContribution()
                        : BigDecimal.ZERO)
                .achieved(false)
                .build();

        Goal savedGoal = goalRepository.save(goal);
        log.info("Goal created successfully with ID: {}", savedGoal.getId());

        return convertToDTO(savedGoal);
    }

    /**
     * Update an existing goal
     */
    @Transactional
    public GoalDTO updateGoal(String id, GoalDTO goalDTO, String userId) {
        log.info("Updating goal {} for user {}", id, userId);

        Goal goal = goalRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Goal with ID " + id + " not found for user " + userId));

        // Update only provided fields
        if (goalDTO.getName() != null && !goalDTO.getName().trim().isEmpty()) {
            goal.setName(goalDTO.getName());
        }
        if (goalDTO.getTargetAmount() != null && goalDTO.getTargetAmount().compareTo(BigDecimal.ZERO) > 0) {
            goal.setTargetAmount(goalDTO.getTargetAmount());
        }
        if (goalDTO.getCurrentAmount() != null) {
            goal.setCurrentAmount(goalDTO.getCurrentAmount());

            // Check if goal is now achieved
            if (goal.getCurrentAmount().compareTo(goal.getTargetAmount()) >= 0) {
                goal.setAchieved(true);
                log.info("Goal {} has been achieved!", id);
            }
        }
        if (goalDTO.getDeadline() != null) {
            goal.setDeadline(goalDTO.getDeadline());
        }
        if (goalDTO.getCategory() != null && !goalDTO.getCategory().trim().isEmpty()) {
            goal.setCategory(goalDTO.getCategory());
        }
        if (goalDTO.getIcon() != null && !goalDTO.getIcon().trim().isEmpty()) {
            goal.setIcon(goalDTO.getIcon());
        }
        if (goalDTO.getColor() != null && !goalDTO.getColor().trim().isEmpty()) {
            goal.setColor(goalDTO.getColor());
        }
        if (goalDTO.getMonthlyContribution() != null) {
            goal.setMonthlyContribution(goalDTO.getMonthlyContribution());
        }

        Goal updatedGoal = goalRepository.save(goal);
        log.info("Goal {} updated successfully", id);

        return convertToDTO(updatedGoal);
    }

    /**
     * Contribute an amount to a goal
     */
    @Transactional
    public GoalDTO contributeToGoal(String id, BigDecimal amount, String userId) {
        log.info("Contributing {} to goal {} for user {}", amount, id, userId);

        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Contribution amount must be greater than zero");
        }

        Goal goal = goalRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Goal with ID " + id + " not found for user " + userId));

        // Add contribution
        BigDecimal newAmount = goal.getCurrentAmount().add(amount);
        goal.setCurrentAmount(newAmount);

        // Check if goal is achieved
        if (newAmount.compareTo(goal.getTargetAmount()) >= 0) {
            goal.setAchieved(true);
            log.info("🎉 Goal {} has been achieved with contribution of {}!", id, amount);
        }

        Goal updatedGoal = goalRepository.save(goal);
        log.info("Contribution successful. New amount: {}", newAmount);

        return convertToDTO(updatedGoal);
    }

    /**
     * Delete a goal
     */
    @Transactional
    public void deleteGoal(String id, String userId) {
        log.info("Deleting goal {} for user {}", id, userId);

        Goal goal = goalRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Goal with ID " + id + " not found for user " + userId));

        goalRepository.delete(goal);
        log.info("Goal {} deleted successfully", id);
    }

    /**
     * Get summary of all goals for a user
     */
    public Map<String, Object> getGoalsSummary(String userId) {
        log.info("Fetching goals summary for user: {}", userId);

        if (userId == null || userId.trim().isEmpty()) {
            throw new IllegalArgumentException("User ID cannot be null or empty");
        }

        List<Goal> goals = goalRepository.findByUserId(userId);

        long totalGoals = goals.size();
        long achievedGoals = goals.stream().filter(Goal::getAchieved).count();

        BigDecimal totalTarget = goals.stream()
                .map(Goal::getTargetAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalSaved = goals.stream()
                .map(Goal::getCurrentAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Calculate overall progress percentage
        BigDecimal overallProgress = BigDecimal.ZERO;
        if (totalTarget.compareTo(BigDecimal.ZERO) > 0) {
            overallProgress = totalSaved
                    .multiply(BigDecimal.valueOf(100))
                    .divide(totalTarget, 2, RoundingMode.HALF_UP);
        }

        Map<String, Object> summary = new HashMap<>();
        summary.put("totalGoals", totalGoals);
        summary.put("achievedGoals", achievedGoals);
        summary.put("activeGoals", totalGoals - achievedGoals);
        summary.put("totalTarget", totalTarget);
        summary.put("totalSaved", totalSaved);
        summary.put("overallProgress", overallProgress);
        summary.put("remainingAmount", totalTarget.subtract(totalSaved));

        log.info("Goals summary: {} total, {} achieved, {}% progress",
                totalGoals, achievedGoals, overallProgress);

        return summary;
    }

    /**
     * Convert Goal entity to GoalDTO
     */
    private GoalDTO convertToDTO(Goal goal) {
        if (goal == null) {
            return null;
        }

        // Calculate progress percentage
        BigDecimal progress = BigDecimal.ZERO;
        if (goal.getTargetAmount() != null && goal.getTargetAmount().compareTo(BigDecimal.ZERO) > 0) {
            progress = goal.getCurrentAmount()
                    .multiply(BigDecimal.valueOf(100))
                    .divide(goal.getTargetAmount(), 2, RoundingMode.HALF_UP);

            // Cap at 100%
            if (progress.compareTo(BigDecimal.valueOf(100)) > 0) {
                progress = BigDecimal.valueOf(100);
            }
        }

        return GoalDTO.builder()
                .id(goal.getId())
                .userId(goal.getUserId())
                .name(goal.getName())
                .targetAmount(goal.getTargetAmount())
                .currentAmount(goal.getCurrentAmount())
                .deadline(goal.getDeadline())
                .category(goal.getCategory())
                .icon(goal.getIcon())
                .color(goal.getColor())
                .monthlyContribution(goal.getMonthlyContribution())
                .progress(progress)
                .achieved(goal.getAchieved() != null ? goal.getAchieved() : false)
                .build();
    }
}