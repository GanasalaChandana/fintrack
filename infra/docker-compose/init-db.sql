-- Create schemas
CREATE SCHEMA IF NOT EXISTS users;
CREATE SCHEMA IF NOT EXISTS transactions;
CREATE SCHEMA IF NOT EXISTS alerts;
CREATE SCHEMA IF NOT EXISTS reports;

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create user (optional, if using different user)
-- Note: The postgres user already has all privileges

-- Grant permissions to postgres user on all schemas
GRANT ALL PRIVILEGES ON SCHEMA users TO postgres;
GRANT ALL PRIVILEGES ON SCHEMA transactions TO postgres;
GRANT ALL PRIVILEGES ON SCHEMA alerts TO postgres;
GRANT ALL PRIVILEGES ON SCHEMA reports TO postgres;

-- Grant usage on schemas
GRANT USAGE ON SCHEMA users TO postgres;
GRANT USAGE ON SCHEMA transactions TO postgres;
GRANT USAGE ON SCHEMA alerts TO postgres;
GRANT USAGE ON SCHEMA reports TO postgres;