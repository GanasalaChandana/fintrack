package com.fintrack.notifications.dto;

public record NotificationSettingsDto(
        String userId,
        boolean emailEnabled,
        boolean pushEnabled,
        boolean budgetAlertsEnabled,
        boolean transactionAlertsEnabled,
        boolean systemNotificationsEnabled) {
}
