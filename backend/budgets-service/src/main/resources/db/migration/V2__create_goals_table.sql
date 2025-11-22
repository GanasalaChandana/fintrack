-- Create goals table
CREATE TABLE IF NOT EXISTS goals (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    target_amount DECIMAL(15, 2) NOT NULL,
    current_amount DECIMAL(15, 2) DEFAULT 0,
    deadline DATE,
    category VARCHAR(100),
    icon VARCHAR(50),
    color VARCHAR(50),
    monthly_contribution DECIMAL(15, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries by user_id
CREATE INDEX idx_goals_user_id ON goals(user_id);

-- Create index for deadline queries
CREATE INDEX idx_goals_deadline ON goals(deadline);