package com.fintrack.notifications.entity;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "notification_settings")
public class NotificationSettings {

    @Id
    @Column(length = 128)
    private String userId;

    private boolean emailEnabled = true;
    private boolean pushEnabled = true;
    private boolean budgetAlertsEnabled = true;
    private boolean transactionAlertsEnabled = true;
    private boolean systemNotificationsEnabled = true;
}
