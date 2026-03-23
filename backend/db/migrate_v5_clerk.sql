-- Migration Phase 5: Clerk Authentication Integration
-- Add Clerk specific columns to users table

ALTER TABLE users ADD COLUMN IF NOT EXISTS clerk_id VARCHAR(255) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_image_url TEXT;

-- We keep email and full_name as they are already in the schema
-- Password can eventually be removed, but we keep it for now to avoid breaking legacy code
