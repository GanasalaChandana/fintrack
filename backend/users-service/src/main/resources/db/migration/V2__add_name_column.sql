-- Add name column to users table
ALTER TABLE users.users ADD COLUMN IF NOT EXISTS name VARCHAR(255);