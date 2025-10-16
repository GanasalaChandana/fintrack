package com.fintrack.alerts.service;

import com.fintrack.alerts.entity.AlertHistory;
import com.fintrack.alerts.entity.NotificationLog;
import com.fintrack.alerts.repository.NotificationLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {
    
    private final JavaMailSender mailSender;
    private final NotificationLogRepository notificationLogRepository;
    
    @Async
    public void sendNotification(AlertHistory alert) {
        log.info("Sending notification for alert {}", alert.getId());
        
        // Send email notification
        sendEmailNotification(alert);
        
        // Could add SMS, push notifications here
    }
    
    private void sendEmailNotification(AlertHistory alert) {
        NotificationLog log = new NotificationLog();
        log.setAlertId(alert.getId());
        log.setChannel(NotificationLog.Channel.EMAIL);
        log.setStatus(NotificationLog.Status.PENDING);
        
        try {
            // In production, fetch user email from user service
            String recipientEmail = "user@example.com";  // Placeholder
            log.setRecipient(recipientEmail);
            
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(recipientEmail);
            message.setSubject("FinTrack Alert: " + alert.getAlertType());
            message.setText(buildEmailBody(alert));
            
            mailSender.send(message);
            
            log.setStatus(NotificationLog.Status.SENT);
            log.setSentAt(LocalDateTime.now());
            this.log.info("Email sent successfully for alert {}", alert.getId());
            
        } catch (Exception e) {
            log.setStatus(NotificationLog.Status.FAILED);
            log.setErrorMessage(e.getMessage());
            this.log.error("Failed to send email for alert {}", alert.getId(), e);
        } finally {
            notificationLogRepository.save(log);
        }
    }
    
    private String buildEmailBody(AlertHistory alert) {
        return String.format("""
            Hi,
            
            You have a new %s alert from FinTrack:
            
            %s
            
            Severity: %s
            Time: %s
            
            Log in to FinTrack to view details.
            
            Best regards,
            FinTrack Team
            """,
            alert.getAlertType(),
            alert.getMessage(),
            alert.getSeverity(),
            alert.getCreatedAt()
        );
    }
}