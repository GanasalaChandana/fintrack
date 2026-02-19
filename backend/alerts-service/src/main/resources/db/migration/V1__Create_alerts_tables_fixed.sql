-- V2__Create_alerts_tables_fixed.sql
-- Drop existing tables if they exist (from failed migration)
DROP TABLE IF EXISTS alerts.alert_history CASCADE;
DROP TABLE IF EXISTS alerts.alert_rules CASCADE;

-- Create alerts schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS alerts;

-- ==================== ALERT HISTORY TABLE ====================
CREATE TABLE alerts.alert_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    alert_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    severity VARCHAR(20) NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    action_url VARCHAR(255),
    
    -- Optional metadata
    budget_id UUID,
    goal_id UUID,
    transaction_id UUID,
    amount DECIMAL(15, 2),
    category VARCHAR(100),
    threshold_value DECIMAL(15, 2),
    current_value DECIMAL(15, 2),
    
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    
    CONSTRAINT chk_alert_type CHECK (alert_type IN (
        'BUDGET_EXCEEDED', 
        'BUDGET_WARNING', 
        'GOAL_MILESTONE', 
        'GOAL_ACHIEVED',
        'UNUSUAL_SPENDING', 
        'BILL_REMINDER', 
        'LOW_BALANCE', 
        'ACHIEVEMENT',
        'SAVINGS_OPPORTUNITY'
    )),
    CONSTRAINT chk_severity CHECK (severity IN ('INFO', 'WARNING', 'ERROR', 'SUCCESS'))
);

-- ==================== ALERT RULES TABLE ====================
CREATE TABLE alerts.alert_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    rule_type VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(500),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    
    -- Rule conditions
    category VARCHAR(100),
    threshold_value DECIMAL(15, 2),
    threshold_percentage DECIMAL(5, 2),
    condition_type VARCHAR(20) NOT NULL,
    
    -- Notification preferences
    notify_email BOOLEAN NOT NULL DEFAULT FALSE,
    notify_push BOOLEAN NOT NULL DEFAULT TRUE,
    notify_in_app BOOLEAN NOT NULL DEFAULT TRUE,
    
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    
    CONSTRAINT chk_rule_type CHECK (rule_type IN (
        'BUDGET_THRESHOLD',
        'SPENDING_SPIKE',
        'GOAL_PROGRESS',
        'BILL_REMINDER',
        'BALANCE_LOW',
        'RECURRING_TRANSACTION'
    )),
    CONSTRAINT chk_condition_type CHECK (condition_type IN (
        'GREATER_THAN',
        'LESS_THAN',
        'EQUALS',
        'PERCENTAGE_OF'
    ))
);

-- ==================== INDEXES FOR ALERT HISTORY ====================
CREATE INDEX IF NOT EXISTS idx_alert_history_user_id ON alerts.alert_history(user_id);
CREATE INDEX IF NOT EXISTS idx_alert_history_user_read ON alerts.alert_history(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_alert_history_created_at ON alerts.alert_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alert_history_user_created ON alerts.alert_history(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alert_history_type ON alerts.alert_history(alert_type);
CREATE INDEX IF NOT EXISTS idx_alert_history_severity ON alerts.alert_history(severity);

-- ==================== INDEXES FOR ALERT RULES ====================
CREATE INDEX IF NOT EXISTS idx_alert_rules_user_id ON alerts.alert_rules(user_id);
CREATE INDEX IF NOT EXISTS idx_alert_rules_user_active ON alerts.alert_rules(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_alert_rules_type ON alerts.alert_rules(rule_type);
CREATE INDEX IF NOT EXISTS idx_alert_rules_active ON alerts.alert_rules(is_active);

-- ==================== COMMENTS ====================
COMMENT ON TABLE alerts.alert_history IS 'Stores user alerts and notifications history';
COMMENT ON TABLE alerts.alert_rules IS 'Stores user-defined alert rules and conditions';

ALTER TABLE alert ADD COLUMN title VARCHAR(255);
ALTER TABLE alert ADD COLUMN severity VARCHAR(50);
ALTER TABLE alert ADD COLUMN category VARCHAR(100);
ALTER TABLE alert ADD COLUMN read BOOLEAN DEFAULT FALSE;
ALTER TABLE alert ADD COLUMN acknowledged BOOLEAN DEFAULT FALSE;