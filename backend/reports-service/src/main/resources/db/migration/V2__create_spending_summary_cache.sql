CREATE SCHEMA IF NOT EXISTS reports;

CREATE TABLE IF NOT EXISTS reports.spending_summary_cache (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    period_type VARCHAR(50),
    summary_data TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);