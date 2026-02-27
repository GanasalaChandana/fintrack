package com.fintrack.reports_service.service;

import com.fintrack.reports_service.entity.ScheduledReport;
import com.fintrack.reports_service.repository.ScheduledReportRepository;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReportSchedulerService {

    private final ScheduledReportRepository scheduledReportRepository;
    private final JavaMailSender mailSender;

    @Value("${app.mail.from:noreply@fintrack.app}")
    private String fromEmail;

    @Value("${app.mail.from-name:FinTrack Reports}")
    private String fromName;

    /**
     * Run every day at 8 AM to send out scheduled reports.
     */
    @Scheduled(cron = "0 0 8 * * *")
    public void processScheduledReports() {
        log.info("⏰ Processing scheduled reports...");
        List<ScheduledReport> dueReports = scheduledReportRepository.findDueReports(LocalDateTime.now());
        log.info("Found {} scheduled reports due", dueReports.size());

        for (ScheduledReport report : dueReports) {
            try {
                sendScheduledReport(report);
                updateNextRun(report);
            } catch (Exception e) {
                log.error("❌ Failed to process scheduled report {} for user {}: {}",
                        report.getId(), report.getUserId(), e.getMessage());
            }
        }
    }

    public ScheduledReport createSchedule(ScheduledReport report) {
        report.setActive(true);
        report.setNextRun(calculateNextRun(report.getFrequency(), LocalDateTime.now()));
        return scheduledReportRepository.save(report);
    }

    public List<ScheduledReport> getSchedulesForUser(UUID userId) {
        return scheduledReportRepository.findByUserId(userId);
    }

    public void deleteSchedule(UUID scheduleId, UUID userId) {
        scheduledReportRepository.findById(scheduleId).ifPresent(report -> {
            if (userId.equals(report.getUserId())) {
                report.setActive(false);
                scheduledReportRepository.save(report);
            }
        });
    }

    private void sendScheduledReport(ScheduledReport report) throws Exception {
        String email = report.getDeliveryEmail();
        if (email == null || email.isBlank()) {
            log.warn("No delivery email for scheduled report {}, skipping", report.getId());
            return;
        }

        log.info("📧 Sending scheduled {} report to: {}", report.getFrequency(), email);

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setFrom(fromEmail, fromName);
        helper.setTo(email);
        helper.setSubject("Your FinTrack " + report.getFrequency() + " Financial Report");
        helper.setText(buildEmailBody(report), true);

        mailSender.send(message);
        log.info("✅ Report email sent to: {}", email);
    }

    private String buildEmailBody(ScheduledReport report) {
        return """
                <!DOCTYPE html>
                <html>
                <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #6366f1 0%%, #8b5cf6 100%%); padding: 30px; border-radius: 10px 10px 0 0;">
                        <h1 style="color: white; margin: 0;">📊 Your Financial Report</h1>
                        <p style="color: #e0e7ff; margin: 5px 0 0 0;">%s Report — %s</p>
                    </div>
                    <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
                        <p>Hi there,</p>
                        <p>Your scheduled <strong>%s</strong> financial report is ready. Log in to view your full analytics.</p>
                        <a href="https://fintrack-liart.vercel.app/reports"
                           style="display:inline-block;background:#6366f1;color:white;padding:12px 24px;
                                  border-radius:6px;text-decoration:none;margin:20px 0;">
                            View Full Report →
                        </a>
                        <p style="color:#6b7280;font-size:12px;margin-top:30px;">
                            You're receiving this because you scheduled a report in FinTrack.
                            <a href="https://fintrack-liart.vercel.app/settings">Manage preferences</a>
                        </p>
                    </div>
                </body>
                </html>
                """.formatted(
                report.getFrequency(),
                LocalDateTime.now().toLocalDate(),
                report.getFrequency()
        );
    }

    private void updateNextRun(ScheduledReport report) {
        report.setLastRun(LocalDateTime.now());
        report.setNextRun(calculateNextRun(report.getFrequency(), LocalDateTime.now()));
        scheduledReportRepository.save(report);
    }

    private LocalDateTime calculateNextRun(String frequency, LocalDateTime from) {
        if (frequency == null) return from.plusMonths(1);
        return switch (frequency.toUpperCase()) {
            case "DAILY"     -> from.plusDays(1);
            case "WEEKLY"    -> from.plusWeeks(1);
            case "MONTHLY"   -> from.plusMonths(1);
            case "QUARTERLY" -> from.plusMonths(3);
            default          -> from.plusMonths(1);
        };
    }
}
