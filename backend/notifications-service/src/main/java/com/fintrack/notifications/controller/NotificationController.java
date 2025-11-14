package com.fintrack.notifications.controller;

import com.fintrack.notifications.dto.NotificationRequest;
import com.fintrack.notifications.dto.NotificationResponse;
import com.fintrack.notifications.dto.NotificationSettingsDto;
import com.fintrack.notifications.entity.NotificationType;
import com.fintrack.notifications.service.NotificationService;
import com.fintrack.notifications.service.NotificationSettingsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * REST Controller for notification management.
 * All endpoints are under /api/notifications/** and are accessible through the
 * API Gateway.
 * 
 * The gateway handles authentication and injects X-User-Id header in dev mode.
 * In production, user ID should be extracted from JWT token.
 */
@Slf4j
@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notifications;
    private final NotificationSettingsService settings;

    // ---------- Notifications CRUD ----------

    /**
     * Create a new notification
     * POST /api/notifications
     */
    @PostMapping
    public ResponseEntity<NotificationResponse> create(@Valid @RequestBody NotificationRequest req) {
        log.info("POST /api/notifications - Creating notification for user: {}", req.userId());
        NotificationResponse response = notifications.create(req);
        log.info("Notification created successfully with ID: {}", response.id());
        return ResponseEntity.ok(response);
    }

    /**
     * Get all notifications for a user
     * GET /api/notifications/user/{userId}
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<NotificationResponse>> list(@PathVariable String userId) {
        log.info("GET /api/notifications/user/{} - Fetching all notifications", userId);
        List<NotificationResponse> response = notifications.list(userId);
        log.info("Found {} notifications for user: {}", response.size(), userId);
        return ResponseEntity.ok(response);
    }

    /**
     * Get unread notifications for a user
     * GET /api/notifications/user/{userId}/unread
     */
    @GetMapping("/user/{userId}/unread")
    public ResponseEntity<List<NotificationResponse>> listUnread(@PathVariable String userId) {
        log.info("GET /api/notifications/user/{}/unread - Fetching unread notifications", userId);
        List<NotificationResponse> response = notifications.listUnread(userId);
        log.info("Found {} unread notifications for user: {}", response.size(), userId);
        return ResponseEntity.ok(response);
    }

    /**
     * Get notifications by type for a user
     * GET /api/notifications/user/{userId}/type/{type}
     */
    @GetMapping("/user/{userId}/type/{type}")
    public ResponseEntity<List<NotificationResponse>> listByType(
            @PathVariable String userId,
            @PathVariable NotificationType type) {
        log.info("GET /api/notifications/user/{}/type/{} - Fetching notifications by type", userId, type);
        List<NotificationResponse> response = notifications.listByType(userId, type);
        log.info("Found {} notifications of type {} for user: {}", response.size(), type, userId);
        return ResponseEntity.ok(response);
    }

    /**
     * Get count of unread notifications
     * GET /api/notifications/user/{userId}/count/unread
     */
    @GetMapping("/user/{userId}/count/unread")
    public ResponseEntity<Long> unreadCount(@PathVariable String userId) {
        log.info("GET /api/notifications/user/{}/count/unread - Fetching unread count", userId);
        Long count = notifications.unreadCount(userId);
        log.info("Unread count for user {}: {}", userId, count);
        return ResponseEntity.ok(count);
    }

    /**
     * Mark a notification as read
     * PATCH /api/notifications/{id}/read?userId={userId}
     */
    @PatchMapping("/{id}/read")
    public ResponseEntity<NotificationResponse> markRead(
            @PathVariable UUID id,
            @RequestParam String userId) {
        log.info("PATCH /api/notifications/{}/read - Marking as read for user: {}", id, userId);
        NotificationResponse response = notifications.markRead(id, userId);
        log.info("Notification {} marked as read", id);
        return ResponseEntity.ok(response);
    }

    /**
     * Mark all notifications as read for a user
     * PATCH /api/notifications/user/{userId}/read-all
     */
    @PatchMapping("/user/{userId}/read-all")
    public ResponseEntity<Void> markAllRead(@PathVariable String userId) {
        log.info("PATCH /api/notifications/user/{}/read-all - Marking all as read", userId);
        notifications.markAllRead(userId);
        log.info("All notifications marked as read for user: {}", userId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Delete a specific notification
     * DELETE /api/notifications/{id}?userId={userId}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable UUID id,
            @RequestParam String userId) {
        log.info("DELETE /api/notifications/{} - Deleting for user: {}", id, userId);
        notifications.delete(id, userId);
        log.info("Notification {} deleted successfully", id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Delete all notifications for a user
     * DELETE /api/notifications/user/{userId}
     */
    @DeleteMapping("/user/{userId}")
    public ResponseEntity<Void> deleteAll(@PathVariable String userId) {
        log.info("DELETE /api/notifications/user/{} - Deleting all notifications", userId);
        notifications.deleteAll(userId);
        log.info("All notifications deleted for user: {}", userId);
        return ResponseEntity.noContent().build();
    }

    // ---------- Notification Settings ----------

    /**
     * Get notification settings for a user
     * GET /api/notifications/settings/{userId}
     */
    @GetMapping("/settings/{userId}")
    public ResponseEntity<NotificationSettingsDto> getSettings(@PathVariable String userId) {
        log.info("GET /api/notifications/settings/{} - Fetching settings", userId);
        NotificationSettingsDto response = settings.get(userId);
        log.info("Settings retrieved for user: {}", userId);
        return ResponseEntity.ok(response);
    }

    /**
     * Update notification settings for a user
     * PUT /api/notifications/settings/{userId}
     */
    @PutMapping("/settings/{userId}")
    public ResponseEntity<NotificationSettingsDto> updateSettings(
            @PathVariable String userId,
            @Valid @RequestBody NotificationSettingsDto dto) {
        log.info("PUT /api/notifications/settings/{} - Updating settings", userId);
        NotificationSettingsDto response = settings.update(userId, dto);
        log.info("Settings updated for user: {}", userId);
        return ResponseEntity.ok(response);
    }

    /**
     * Reset notification settings to defaults
     * POST /api/notifications/settings/{userId}/reset
     */
    @PostMapping("/settings/{userId}/reset")
    public ResponseEntity<NotificationSettingsDto> resetSettings(@PathVariable String userId) {
        log.info("POST /api/notifications/settings/{}/reset - Resetting to defaults", userId);
        NotificationSettingsDto response = settings.reset(userId);
        log.info("Settings reset to defaults for user: {}", userId);
        return ResponseEntity.ok(response);
    }

    // ---------- Health Check ----------

    /**
     * Simple health check endpoint
     * GET /api/notifications/health
     */
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        log.debug("GET /api/notifications/health - Health check requested");
        return ResponseEntity.ok("Notification service is running");
    }
}