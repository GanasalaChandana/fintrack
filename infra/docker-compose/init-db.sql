-- Database initialization script for FinTrack
-- This script creates separate schemas for each microservice

-- Create schemas for each service
CREATE SCHEMA IF NOT EXISTS users;
CREATE SCHEMA IF NOT EXISTS transactions;
CREATE SCHEMA IF NOT EXISTS alerts;
CREATE SCHEMA IF NOT EXISTS reports;
CREATE SCHEMA IF NOT EXISTS budgets;
CREATE SCHEMA IF NOT EXISTS notifications;

-- Grant all privileges to fintrack_user on each schema
GRANT ALL PRIVILEGES ON SCHEMA users TO fintrack_user;
GRANT ALL PRIVILEGES ON SCHEMA transactions TO fintrack_user;
GRANT ALL PRIVILEGES ON SCHEMA alerts TO fintrack_user;
GRANT ALL PRIVILEGES ON SCHEMA reports TO fintrack_user;
GRANT ALL PRIVILEGES ON SCHEMA budgets TO fintrack_user;
GRANT ALL PRIVILEGES ON SCHEMA notifications TO fintrack_user;

-- Grant usage on all schemas
GRANT USAGE ON SCHEMA users TO fintrack_user;
GRANT USAGE ON SCHEMA transactions TO fintrack_user;
GRANT USAGE ON SCHEMA alerts TO fintrack_user;
GRANT USAGE ON SCHEMA reports TO fintrack_user;
GRANT USAGE ON SCHEMA budgets TO fintrack_user;
GRANT USAGE ON SCHEMA notifications TO fintrack_user;

-- Grant privileges on all tables in schemas (for future tables)
ALTER DEFAULT PRIVILEGES IN SCHEMA users GRANT ALL ON TABLES TO fintrack_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA transactions GRANT ALL ON TABLES TO fintrack_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA alerts GRANT ALL ON TABLES TO fintrack_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA reports GRANT ALL ON TABLES TO fintrack_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA budgets GRANT ALL ON TABLES TO fintrack_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA notifications GRANT ALL ON TABLES TO fintrack_user;

-- Grant privileges on all sequences in schemas (for auto-increment)
ALTER DEFAULT PRIVILEGES IN SCHEMA users GRANT ALL ON SEQUENCES TO fintrack_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA transactions GRANT ALL ON SEQUENCES TO fintrack_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA alerts GRANT ALL ON SEQUENCES TO fintrack_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA reports GRANT ALL ON SEQUENCES TO fintrack_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA budgets GRANT ALL ON SEQUENCES TO fintrack_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA notifications GRANT ALL ON SEQUENCES TO fintrack_user;

-- Set search path for fintrack_user
ALTER USER fintrack_user SET search_path TO users, transactions, alerts, reports, budgets, notifications, public;

-- Log completion
DO $$
BEGIN
    RAISE NOTICE 'Database schemas created successfully for FinTrack microservices';
END $$;