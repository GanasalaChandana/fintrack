package com.fintrack.notifications.dto;

import com.fintrack.notifications.entity.NotificationType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class NotificationRequest {
        private String userId;

        public String getUserId() { // Add this
                return userId;
        }

        public void setUserId(String userId) {
                this.userId = userId;
        }
}