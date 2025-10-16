-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create scheduled_reports table
CREATE TABLE reports.scheduled_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    report_type VARCHAR(50) NOT NULL,
    frequency VARCHAR(20) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    format VARCHAR(20),
    categories TEXT,
    delivery_method VARCHAR(20),
    delivery_email VARCHAR(255),
    active BOOLEAN NOT NULL DEFAULT true,
    last_run TIMESTAMP,
    next_run TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create report_history table
CREATE TABLE reports.report_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    report_type VARCHAR(50) NOT NULL,
    format VARCHAR(20),
    status VARCHAR(20) NOT NULL,
    file_path VARCHAR(500),
    file_size_bytes BIGINT,
    error_message TEXT,
    generated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    scheduled_report_id UUID
);

-- Create transaction_aggregates table
CREATE TABLE reports.transaction_aggregates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    aggregation_date DATE NOT NULL,
    aggregation_type VARCHAR(20) NOT NULL,
    category VARCHAR(100),
    total_amount DECIMAL(15, 2) NOT NULL,
    transaction_count INTEGER NOT NULL,
    avg_amount DECIMAL(15, 2),
    max_amount DECIMAL(15, 2),
    min_amount DECIMAL(15, 2),
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_scheduled_reports_user_id ON reports.scheduled_reports(user_id);
CREATE INDEX idx_report_history_user_id ON reports.report_history(user_id);
CREATE INDEX idx_agg_user_date ON reports.transaction_aggregates(user_id, aggregation_date);
CREATE INDEX idx_agg_category ON reports.transaction_aggregates(category);

-- Verify tables created
\dt reports.*