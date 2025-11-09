-- Create budgets schema
CREATE SCHEMA IF NOT EXISTS budgets;

-- Create budgets table
CREATE TABLE budgets.budgets (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    spent_amount DECIMAL(15, 2) DEFAULT 0,
    period VARCHAR(20) NOT NULL,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    alert_threshold INTEGER DEFAULT 80,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

-- Create indexes
CREATE INDEX idx_budgets_user_id ON budgets.budgets(user_id);
CREATE INDEX idx_budgets_category ON budgets.budgets(category);
CREATE INDEX idx_budgets_dates ON budgets.budgets(start_date, end_date);
CREATE INDEX idx_budgets_active ON budgets.budgets(is_active);
