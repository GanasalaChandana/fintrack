package com.fintrack.notifications.dto;

import com.fintrack.notifications.entity.NotificationType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record NotificationRequest(
        @NotBlank String userId,
        @NotBlank String title,
        @NotBlank String message,
        @NotNull NotificationType type) {
}
