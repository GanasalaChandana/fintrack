-- V1__Create_notifications_tables.sql
-- Notifications Service Database Schema

-- Drop existing tables if they exist (for clean migration)
DROP TABLE IF EXISTS notification_preferences CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;

-- Create notifications schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS notifications;

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE notifications.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('budget_alert', 'bill_reminder', 'payment_confirmation', 'system', 'custom')),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    severity VARCHAR(20) DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'error', 'success')),
    related_entity_type VARCHAR(50), -- 'budget', 'bill', 'transaction', etc.
    related_entity_id UUID,
    is_read BOOLEAN DEFAULT FALSE,
    is_archived BOOLEAN DEFAULT FALSE,
    sent_via VARCHAR(50)[] DEFAULT ARRAY['in_app'], -- ['in_app', 'email', 'sms', 'push']
    metadata JSONB, -- Additional flexible data
    created_at TIMESTAMP DEFAULT NOW(),
    read_at TIMESTAMP,
    archived_at TIMESTAMP
);

CREATE INDEX idx_notifications_user_id ON notifications.notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications.notifications(type);
CREATE INDEX idx_notifications_is_read ON notifications.notifications(user_id, is_read);
CREATE INDEX idx_notifications_created_at ON notifications.notifications(created_at DESC);
CREATE INDEX idx_notifications_related_entity ON notifications.notifications(related_entity_type, related_entity_id);

-- ============================================
-- NOTIFICATION PREFERENCES TABLE
-- ============================================
CREATE TABLE notifications.notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    
    -- Budget Alert Preferences
    budget_alert_enabled BOOLEAN DEFAULT TRUE,
    budget_alert_threshold DECIMAL(5, 2) DEFAULT 80.00, -- Alert at 80% by default
    budget_alert_channels VARCHAR(50)[] DEFAULT ARRAY['in_app', 'email'],
    
    -- Bill Reminder Preferences
    bill_reminder_enabled BOOLEAN DEFAULT TRUE,
    bill_reminder_days_before INTEGER DEFAULT 3, -- Remind 3 days before due
    bill_reminder_channels VARCHAR(50)[] DEFAULT ARRAY['in_app', 'email'],
    
    -- Payment Confirmation Preferences
    payment_confirmation_enabled BOOLEAN DEFAULT TRUE,
    payment_confirmation_channels VARCHAR(50)[] DEFAULT ARRAY['in_app'],
    
    -- System Notification Preferences
    system_notifications_enabled BOOLEAN DEFAULT TRUE,
    system_notification_channels VARCHAR(50)[] DEFAULT ARRAY['in_app'],
    
    -- General Settings
    quiet_hours_enabled BOOLEAN DEFAULT FALSE,
    quiet_hours_start TIME, -- e.g., '22:00:00'
    quiet_hours_end TIME, -- e.g., '08:00:00'
    timezone VARCHAR(50) DEFAULT 'UTC',
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notification_preferences_user_id ON notifications.notification_preferences(user_id);

-- ============================================
-- NOTIFICATION DELIVERY LOG (Optional - for tracking)
-- ============================================
CREATE TABLE notifications.notification_delivery_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notification_id UUID NOT NULL REFERENCES notifications.notifications(id) ON DELETE CASCADE,
    channel VARCHAR(50) NOT NULL, -- 'email', 'sms', 'push', 'in_app'
    status VARCHAR(50) NOT NULL CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'bounced')),
    error_message TEXT,
    provider_response JSONB, -- Response from email/SMS provider
    sent_at TIMESTAMP,
    delivered_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_delivery_log_notification_id ON notifications.notification_delivery_log(notification_id);
CREATE INDEX idx_delivery_log_status ON notifications.notification_delivery_log(status);
CREATE INDEX idx_delivery_log_channel ON notifications.notification_delivery_log(channel);

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================
CREATE OR REPLACE FUNCTION notifications.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_notification_preferences_updated_at 
    BEFORE UPDATE ON notifications.notification_preferences
    FOR EACH ROW 
    EXECUTE FUNCTION notifications.update_updated_at_column();

-- ============================================
-- FUNCTION TO MARK NOTIFICATION AS READ
-- ============================================
CREATE OR REPLACE FUNCTION notifications.mark_notification_read(notification_id_param UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE notifications.notifications
    SET is_read = TRUE, read_at = NOW()
    WHERE id = notification_id_param AND is_read = FALSE;
END;
$$ language 'plpgsql';

-- ============================================
-- FUNCTION TO ARCHIVE NOTIFICATION
-- ============================================
CREATE OR REPLACE FUNCTION notifications.archive_notification(notification_id_param UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE notifications.notifications
    SET is_archived = TRUE, archived_at = NOW()
    WHERE id = notification_id_param AND is_archived = FALSE;
END;
$$ language 'plpgsql';

-- ============================================
-- FUNCTION TO GET UNREAD COUNT
-- ============================================
CREATE OR REPLACE FUNCTION notifications.get_unread_count(user_id_param UUID)
RETURNS INTEGER AS $$
DECLARE
    unread_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO unread_count
    FROM notifications.notifications
    WHERE user_id = user_id_param 
      AND is_read = FALSE 
      AND is_archived = FALSE;
    
    RETURN unread_count;
END;
$$ language 'plpgsql';

-- ============================================
-- SAMPLE DATA (Optional - remove in production)
-- ============================================
-- Example: Create default preferences for a user
-- INSERT INTO notifications.notification_preferences (user_id)
-- VALUES ('00000000-0000-0000-0000-000000000000')
-- ON CONFLICT (user_id) DO NOTHING;

COMMENT ON TABLE notifications.notifications IS 'Stores all user notifications across the application';
COMMENT ON TABLE notifications.notification_preferences IS 'User-specific notification settings and preferences';
COMMENT ON TABLE notifications.notification_delivery_log IS 'Tracks delivery status of notifications through various channels';