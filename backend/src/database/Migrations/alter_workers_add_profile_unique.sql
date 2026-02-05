ALTER TABLE workers
ADD CONSTRAINT workers_user_profile_unique
UNIQUE (user_id, profile_name);