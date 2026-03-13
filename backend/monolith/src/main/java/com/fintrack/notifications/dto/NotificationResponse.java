package com.fintrack.notifications.dto;

import com.fintrack.notifications.entity.NotificationType;

import java.time.Instant;
import java.util.UUID;

public record NotificationResponse(
        UUID id,
        String userId,
        String title,
        String message,
        NotificationType type,
        boolean read,
        Instant createdAt,
        Instant updatedAt) {
}
