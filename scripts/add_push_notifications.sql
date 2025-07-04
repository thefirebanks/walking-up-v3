-- Add push_token column to profiles table for notifications
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS push_token TEXT;

-- Add index for faster push token lookups
CREATE INDEX IF NOT EXISTS idx_profiles_push_token ON profiles(push_token) WHERE push_token IS NOT NULL;
