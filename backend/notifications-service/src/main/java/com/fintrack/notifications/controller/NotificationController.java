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

@Slf4j
@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notifications;
    private final NotificationSettingsService settings;

    @PostMapping
    public ResponseEntity<NotificationResponse> createNotification(@Valid @RequestBody NotificationRequest req) {
        log.info("POST /api/notifications - Creating notification for user: {}", req.userId());
        NotificationResponse response = notifications.create(req);
        log.info("Notification created successfully with ID: {}", response.id());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<NotificationResponse>> getAllNotifications(@PathVariable String userId) {
        log.info("GET /api/notifications/user/{} - Fetching all notifications", userId);
        List<NotificationResponse> response = notifications.list(userId);
        log.info("Found {} notifications for user: {}", response.size(), userId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/user/{userId}/unread")
    public ResponseEntity<List<NotificationResponse>> getUnreadNotifications(@PathVariable String userId) {
        log.info("GET /api/notifications/user/{}/unread - Fetching unread notifications", userId);
        List<NotificationResponse> response = notifications.listUnread(userId);
        log.info("Found {} unread notifications for user: {}", response.size(), userId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/user/{userId}/type/{type}")
    public ResponseEntity<List<NotificationResponse>> getNotificationsByType(
            @PathVariable String userId,
            @PathVariable NotificationType type) {
        log.info("GET /api/notifications/user/{}/type/{} - Fetching notifications by type", userId, type);
        List<NotificationResponse> response = notifications.listByType(userId, type);
        log.info("Found {} notifications of type {} for user: {}", response.size(), type, userId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/user/{userId}/count/unread")
    public ResponseEntity<Long> getUnreadCount(@PathVariable String userId) {
        log.info("GET /api/notifications/user/{}/count/unread - Fetching unread count", userId);
        Long count = notifications.unreadCount(userId);
        log.info("Unread count for user {}: {}", userId, count);
        return ResponseEntity.ok(count);
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<NotificationResponse> markAsRead(
            @PathVariable UUID id,
            @RequestParam String userId) {
        log.info("PATCH /api/notifications/{}/read - Marking as read for user: {}", id, userId);
        NotificationResponse response = notifications.markRead(id, userId);
        log.info("Notification {} marked as read", id);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/user/{userId}/read-all")
    public ResponseEntity<Void> markAllAsRead(@PathVariable String userId) {
        log.info("PATCH /api/notifications/user/{}/read-all - Marking all as read", userId);
        notifications.markAllRead(userId);
        log.info("All notifications marked as read for user: {}", userId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotification(
            @PathVariable UUID id,
            @RequestParam String userId) {
        log.info("DELETE /api/notifications/{} - Deleting for user: {}", id, userId);
        notifications.delete(id, userId);
        log.info("Notification {} deleted successfully", id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/user/{userId}")
    public ResponseEntity<Void> deleteAllNotifications(@PathVariable String userId) {
        log.info("DELETE /api/notifications/user/{} - Deleting all notifications", userId);
        notifications.deleteAll(userId);
        log.info("All notifications deleted for user: {}", userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/settings/{userId}")
    public ResponseEntity<NotificationSettingsDto> getNotificationSettings(@PathVariable String userId) {
        log.info("GET /api/notifications/settings/{} - Fetching settings", userId);
        NotificationSettingsDto response = settings.get(userId);
        log.info("Settings retrieved for user: {}", userId);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/settings/{userId}")
    public ResponseEntity<NotificationSettingsDto> updateNotificationSettings(
            @PathVariable String userId,
            @Valid @RequestBody NotificationSettingsDto dto) {
        log.info("PUT /api/notifications/settings/{} - Updating settings", userId);
        NotificationSettingsDto response = settings.update(userId, dto);
        log.info("Settings updated for user: {}", userId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/settings/{userId}/reset")
    public ResponseEntity<NotificationSettingsDto> resetNotificationSettings(@PathVariable String userId) {
        log.info("POST /api/notifications/settings/{}/reset - Resetting to defaults", userId);
        NotificationSettingsDto response = settings.reset(userId);
        log.info("Settings reset to defaults for user: {}", userId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        log.debug("GET /api/notifications/health - Health check requested");
        return ResponseEntity.ok("Notification service is running");
    }

    // Temporary catch-all for debugging - remove after fixing frontend
    @GetMapping
    public ResponseEntity<?> handleRootGet(
            @RequestParam(required = false) String userId,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId) {

        String actualUserId = userId != null ? userId : headerUserId;

        log.warn("GET /api/notifications called without /user/{userId} path!");
        log.warn("Query param userId: {}", userId);
        log.warn("Header X-User-Id: {}", headerUserId);

        if (actualUserId != null && !actualUserId.isEmpty()) {
            log.info("Redirecting to proper endpoint with userId: {}", actualUserId);
            return getAllNotifications(actualUserId);
        }

        log.error("No userId provided in query param or header!");
        return ResponseEntity.badRequest()
                .body("userId is required. Use GET /api/notifications/user/{userId} instead");
    }
}