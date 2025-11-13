package com.fintrack.notifications.dto;

import com.fintrack.notifications.entity.NotificationType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record NotificationRequest(
                @NotBlank(message = "User ID is required") String userId,

                @NotBlank(message = "Title is required") String title,

                @NotBlank(message = "Message is required") String message,

                @NotNull(message = "Type is required") NotificationType type) {
}