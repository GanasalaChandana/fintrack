-- Add achieved column to goals table
ALTER TABLE budgets.goals 
ADD COLUMN achieved BOOLEAN NOT NULL DEFAULT false;

-- Update existing goals: mark as achieved if current >= target
UPDATE budgets.goals 
SET achieved = true 
WHERE current_amount >= target_amount;

-- Create index for better query performance
CREATE INDEX idx_goals_user_achieved ON budgets.goals(user_id, achieved);