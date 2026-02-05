-- Add role/specialization name (e.g. Gardener, Bartender)
ALTER TABLE workers
ADD COLUMN IF NOT EXISTS role_name TEXT;

-- Ensure each user cannot have two profiles with same name
ALTER TABLE workers
ADD CONSTRAINT IF NOT EXISTS workers_user_profile_unique
UNIQUE (user_id, profile_name);

-- Ensure only ONE primary profile per user
CREATE UNIQUE INDEX IF NOT EXISTS workers_one_primary_per_user
ON workers (user_id)
WHERE is_primary = true;