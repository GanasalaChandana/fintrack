-- Add Google OAuth and additional user fields
ALTER TABLE users.users ADD COLUMN IF NOT EXISTS username VARCHAR(100);
ALTER TABLE users.users ADD COLUMN IF NOT EXISTS first_name VARCHAR(100);
ALTER TABLE users.users ADD COLUMN IF NOT EXISTS last_name VARCHAR(100);
ALTER TABLE users.users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255);
ALTER TABLE users.users ADD COLUMN IF NOT EXISTS profile_picture VARCHAR(500);

-- Make password_hash nullable to support OAuth users
ALTER TABLE users.users ALTER COLUMN password_hash DROP NOT NULL;

-- Add unique constraints
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users.users(username) WHERE username IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_google_id ON users.users(google_id) WHERE google_id IS NOT NULL;

-- Add constraint to ensure either password or Google ID exists
ALTER TABLE users.users DROP CONSTRAINT IF EXISTS check_auth_method;
ALTER TABLE users.users ADD CONSTRAINT check_auth_method 
    CHECK (password_hash IS NOT NULL OR google_id IS NOT NULL);

-- Update the trigger function to handle all timestamp updates
DROP TRIGGER IF EXISTS update_users_updated_at ON users.users;
DROP FUNCTION IF EXISTS users.update_updated_at_column();

CREATE OR REPLACE FUNCTION users.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users.users
    FOR EACH ROW 
    EXECUTE FUNCTION users.update_updated_at_column();