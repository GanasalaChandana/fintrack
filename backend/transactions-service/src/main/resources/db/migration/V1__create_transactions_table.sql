-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    description VARCHAR(500),
    transaction_date DATE NOT NULL,
    category VARCHAR(100),
    merchant VARCHAR(255),
    payment_method VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_transactions_user_id ON transactions.transactions(user_id);
CREATE INDEX idx_transactions_date ON transactions.transactions(transaction_date DESC);
CREATE INDEX idx_transactions_category ON transactions.transactions(category);
CREATE INDEX idx_transactions_user_date ON transactions.transactions(user_id, transaction_date DESC);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION transactions.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_transactions_updated_at 
    BEFORE UPDATE ON transactions.transactions
    FOR EACH ROW 
    EXECUTE FUNCTION transactions.update_updated_at_column();