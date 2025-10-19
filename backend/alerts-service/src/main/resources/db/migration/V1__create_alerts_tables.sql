-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE SCHEMA IF NOT EXISTS alerts;

-- Alert Rules Table
CREATE TABLE alerts.alert_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    rule_type VARCHAR(50) NOT NULL,
    threshold_amount DECIMAL(12, 2),
    category VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Alert History Table
CREATE TABLE alerts.alert_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    rule_id UUID REFERENCES alerts.alert_rules(id),
    alert_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    metadata JSONB,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Notification Log Table
CREATE TABLE alerts.notification_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    alert_id UUID REFERENCES alerts.alert_history(id),
    channel VARCHAR(20) NOT NULL,  -- EMAIL, SMS, PUSH
    status VARCHAR(20) NOT NULL,   -- SENT, FAILED, PENDING
    recipient VARCHAR(255),
    sent_at TIMESTAMP,
    error_message TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_alert_rules_user_id ON alerts.alert_rules(user_id);
CREATE INDEX idx_alert_rules_active ON alerts.alert_rules(is_active);
CREATE INDEX idx_alert_history_user_id ON alerts.alert_history(user_id);
CREATE INDEX idx_alert_history_created_at ON alerts.alert_history(created_at DESC);
CREATE INDEX idx_notification_log_alert_id ON alerts.notification_log(alert_id);