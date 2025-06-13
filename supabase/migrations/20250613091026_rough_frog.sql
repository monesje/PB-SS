/*
  # Create user_access table for tracking purchased access

  1. New Tables
    - `user_access`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `access_type` (text, 'full_report' or 'individual_role')
      - `role` (text, nullable, specific role name for individual access)
      - `year` (integer, nullable, specific year for individual access)
      - `expires_at` (timestamptz, nullable, for future subscription support)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `user_access` table
    - Add policy for users to read their own access records
    - Add policy for service role to manage all access records

  3. Indexes
    - Index on user_id for fast user access lookups
    - Index on access_type for filtering
    - Composite index on user_id, access_type for common queries
    - Index on role and year for individual role access checks
*/

-- Create user_access table
CREATE TABLE IF NOT EXISTS user_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  access_type text NOT NULL CHECK (access_type IN ('full_report', 'individual_role')),
  role text,
  year integer,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE user_access ENABLE ROW LEVEL SECURITY;

-- Create policies for user access control
-- Users can read their own access records
CREATE POLICY "Users can read own access records"
  ON user_access
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Service role has full access for admin operations and Stripe webhooks
CREATE POLICY "Service role has full access to user_access"
  ON user_access
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create indexes for optimal query performance
CREATE INDEX IF NOT EXISTS idx_user_access_user_id ON user_access(user_id);
CREATE INDEX IF NOT EXISTS idx_user_access_type ON user_access(access_type);
CREATE INDEX IF NOT EXISTS idx_user_access_user_type ON user_access(user_id, access_type);
CREATE INDEX IF NOT EXISTS idx_user_access_role ON user_access(role);
CREATE INDEX IF NOT EXISTS idx_user_access_year ON user_access(year);
CREATE INDEX IF NOT EXISTS idx_user_access_role_year ON user_access(role, year);

-- Add constraint to ensure role is provided for individual_role access
ALTER TABLE user_access ADD CONSTRAINT check_individual_role_has_role 
  CHECK (
    (access_type = 'full_report') OR 
    (access_type = 'individual_role' AND role IS NOT NULL)
  );

-- Add constraint to ensure year is provided for individual_role access
ALTER TABLE user_access ADD CONSTRAINT check_individual_role_has_year 
  CHECK (
    (access_type = 'full_report') OR 
    (access_type = 'individual_role' AND year IS NOT NULL)
  );