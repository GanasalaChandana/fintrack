package com.fintrack.budgets_service.service;

import com.fintrack.budgets_service.dto.GoalDTO;
import com.fintrack.budgets_service.entity.Goal;
import com.fintrack.budgets_service.exception.ResourceNotFoundException;
import com.fintrack.budgets_service.exception.UnauthorizedException;
import com.fintrack.budgets_service.repository.GoalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class GoalService {

    private final GoalRepository goalRepository;

    public List<Goal> getAllGoalsByUserId(Long userId) {
        return goalRepository.findByUserId(userId);
    }

    public Goal getGoalById(Long id, Long userId) {
        Goal goal = goalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found"));

        if (!goal.getUserId().equals(userId)) {
            throw new UnauthorizedException("You don't have permission to access this goal");
        }

        return goal;
    }

    @Transactional
    public Goal createGoal(GoalDTO goalDTO) {
        Goal goal = Goal.builder()
                .userId(goalDTO.getUserId())
                .name(goalDTO.getName())
                .targetAmount(goalDTO.getTargetAmount())
                .currentAmount(goalDTO.getCurrentAmount() != null ? goalDTO.getCurrentAmount() : BigDecimal.ZERO)
                .deadline(goalDTO.getDeadline())
                .category(goalDTO.getCategory())
                .icon(goalDTO.getIcon())
                .color(goalDTO.getColor())
                .monthlyContribution(
                        goalDTO.getMonthlyContribution() != null ? goalDTO.getMonthlyContribution() : BigDecimal.ZERO)
                .build();

        return goalRepository.save(goal);
    }

    @Transactional
    public Goal updateGoal(Long id, GoalDTO goalDTO, Long userId) {
        Goal goal = getGoalById(id, userId);

        if (goalDTO.getName() != null) {
            goal.setName(goalDTO.getName());
        }
        if (goalDTO.getTargetAmount() != null) {
            goal.setTargetAmount(goalDTO.getTargetAmount());
        }
        if (goalDTO.getCurrentAmount() != null) {
            goal.setCurrentAmount(goalDTO.getCurrentAmount());
        }
        if (goalDTO.getDeadline() != null) {
            goal.setDeadline(goalDTO.getDeadline());
        }
        if (goalDTO.getCategory() != null) {
            goal.setCategory(goalDTO.getCategory());
        }
        if (goalDTO.getIcon() != null) {
            goal.setIcon(goalDTO.getIcon());
        }
        if (goalDTO.getColor() != null) {
            goal.setColor(goalDTO.getColor());
        }
        if (goalDTO.getMonthlyContribution() != null) {
            goal.setMonthlyContribution(goalDTO.getMonthlyContribution());
        }

        return goalRepository.save(goal);
    }

    @Transactional
    public Goal updateGoalProgress(Long id, BigDecimal currentAmount, Long userId) {
        Goal goal = getGoalById(id, userId);
        goal.setCurrentAmount(currentAmount);
        return goalRepository.save(goal);
    }

    @Transactional
    public void deleteGoal(Long id, Long userId) {
        Goal goal = getGoalById(id, userId);
        goalRepository.delete(goal);
    }
}