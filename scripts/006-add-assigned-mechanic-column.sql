-- Add assigned mechanic column for admin assignment persistence
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS assigned_mechanic TEXT;
