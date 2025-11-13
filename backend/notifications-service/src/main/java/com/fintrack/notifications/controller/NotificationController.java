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
 * All endpoints are under /api/notifications/**.
 * Gateway injects X-User-Id in dev; in prod you'll read it from the JWT.
 */
@Slf4j
@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:3001" })
public class NotificationController {

    private final NotificationService notifications;
    private final NotificationSettingsService settings;

    // ---------- Notifications ----------

    @PostMapping
    public ResponseEntity<NotificationResponse> create(@Valid @RequestBody NotificationRequest req) {
        log.info("Creating notification for user: {}", req.userId());
        return ResponseEntity.ok(notifications.create(req));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<NotificationResponse>> list(@PathVariable String userId) {
        log.info("Fetching all notifications for user: {}", userId);
        return ResponseEntity.ok(notifications.list(userId));
    }

    @GetMapping("/user/{userId}/unread")
    public ResponseEntity<List<NotificationResponse>> listUnread(@PathVariable String userId) {
        log.info("Fetching unread notifications for user: {}", userId);
        return ResponseEntity.ok(notifications.listUnread(userId));
    }

    @GetMapping("/user/{userId}/type/{type}")
    public ResponseEntity<List<NotificationResponse>> listByType(
            @PathVariable String userId,
            @PathVariable NotificationType type) {
        log.info("Fetching notifications of type {} for user: {}", type, userId);
        return ResponseEntity.ok(notifications.listByType(userId, type));
    }

    @GetMapping("/user/{userId}/count/unread")
    public ResponseEntity<Long> unreadCount(@PathVariable String userId) {
        log.info("Fetching unread count for user: {}", userId);
        return ResponseEntity.ok(notifications.unreadCount(userId));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<NotificationResponse> markRead(
            @PathVariable UUID id,
            @RequestParam String userId) {
        log.info("Marking notification {} as read for user: {}", id, userId);
        return ResponseEntity.ok(notifications.markRead(id, userId));
    }

    @PatchMapping("/user/{userId}/read-all")
    public ResponseEntity<Void> markAllRead(@PathVariable String userId) {
        log.info("Marking all notifications as read for user: {}", userId);
        notifications.markAllRead(userId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable UUID id,
            @RequestParam String userId) {
        log.info("Deleting notification {} for user: {}", id, userId);
        notifications.delete(id, userId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/user/{userId}")
    public ResponseEntity<Void> deleteAll(@PathVariable String userId) {
        log.info("Deleting all notifications for user: {}", userId);
        notifications.deleteAll(userId);
        return ResponseEntity.noContent().build();
    }

    // ---------- Settings ----------

    @GetMapping("/settings/{userId}")
    public ResponseEntity<NotificationSettingsDto> getSettings(@PathVariable String userId) {
        log.info("Fetching notification settings for user: {}", userId);
        return ResponseEntity.ok(settings.get(userId));
    }

    @PutMapping("/settings/{userId}")
    public ResponseEntity<NotificationSettingsDto> updateSettings(
            @PathVariable String userId,
            @Valid @RequestBody NotificationSettingsDto dto) {
        log.info("Updating notification settings for user: {}", userId);
        return ResponseEntity.ok(settings.update(userId, dto));
    }

    @PostMapping("/settings/{userId}/reset")
    public ResponseEntity<NotificationSettingsDto> resetSettings(@PathVariable String userId) {
        log.info("Resetting notification settings for user: {}", userId);
        return ResponseEntity.ok(settings.reset(userId));
    }

    // ---------- Health Check ----------

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Notification service is running");
    }
}