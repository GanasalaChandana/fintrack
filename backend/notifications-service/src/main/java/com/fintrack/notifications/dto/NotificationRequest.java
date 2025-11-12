package com.fintrack.notifications.dto;

import com.fintrack.notifications.entity.NotificationType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import com.fintrack.notifications.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import com.fintrack.notifications.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class NotificationRequest {

        @NotBlank(message = "User ID is required")
        private String userId;

        @NotBlank(message = "Title is required")
        private String title;

        @NotBlank(message = "Message is required")
        private String message;

        @NotNull(message = "Type is required")
        private NotificationType type;

        // Constructors
        public NotificationRequest() {
        }

        public NotificationRequest(String userId, String title, String message, NotificationType type) {
                this.userId = userId;
                this.title = title;
                this.message = message;
                this.type = type;
        }

        // Getters
        public String getUserId() {
                return userId;
        }

        public String getTitle() {
                return title;
        }

        public String getMessage() {
                return message;
        }

        public NotificationType getType() {
                return type;
        }

        // Setters
        public void setUserId(String userId) {
                this.userId = userId;
        }

        public void setTitle(String title) {
                this.title = title;
        }

        public void setMessage(String message) {
                this.message = message;
        }

        public void setType(NotificationType type) {
                this.type = type;
        }
}