package com.fintrack.notifications.service;

import com.fintrack.notifications.dto.NotificationSettingsDto;
import com.fintrack.notifications.entity.NotificationSettings;
import com.fintrack.notifications.repository.NotificationSettingsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class NotificationSettingsService {

    private final NotificationSettingsRepository repo;

    @Transactional(readOnly = true)
    public NotificationSettingsDto get(String userId) {
        return toDto(repo.findById(userId)
                .orElseGet(() -> repo.save(NotificationSettings.builder()
                        .userId(userId)
                        .emailEnabled(true)
                        .pushEnabled(true)
                        .budgetAlertsEnabled(true)
                        .transactionAlertsEnabled(true)
                        .systemNotificationsEnabled(true)
                        .build())));
    }

    public NotificationSettingsDto update(String userId, NotificationSettingsDto dto) {
        NotificationSettings s = repo.findById(userId).orElseGet(() -> {
            NotificationSettings ns = new NotificationSettings();
            ns.setUserId(userId);
            return ns;
        });
        s.setEmailEnabled(dto.emailEnabled());
        s.setPushEnabled(dto.pushEnabled());
        s.setBudgetAlertsEnabled(dto.budgetAlertsEnabled());
        s.setTransactionAlertsEnabled(dto.transactionAlertsEnabled());
        s.setSystemNotificationsEnabled(dto.systemNotificationsEnabled());
        return toDto(repo.save(s));
    }

    public NotificationSettingsDto reset(String userId) {
        NotificationSettings s = NotificationSettings.builder()
                .userId(userId)
                .emailEnabled(true)
                .pushEnabled(true)
                .budgetAlertsEnabled(true)
                .transactionAlertsEnabled(true)
                .systemNotificationsEnabled(true)
                .build();
        return toDto(repo.save(s));
    }

    private NotificationSettingsDto toDto(NotificationSettings s) {
        return new NotificationSettingsDto(
                s.getUserId(),
                s.isEmailEnabled(),
                s.isPushEnabled(),
                s.isBudgetAlertsEnabled(),
                s.isTransactionAlertsEnabled(),
                s.isSystemNotificationsEnabled());
    }
}
