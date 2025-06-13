/*
  # Create custom_roles table

  1. New Tables
    - `custom_roles`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles)
      - `base_role` (text, the original role this custom role is based on)
      - `custom_label` (text, user-defined label for the custom role)
      - `filters` (jsonb, stores filter criteria as JSON)
      - `created_at` (timestamp with timezone)
      - `updated_at` (timestamp with timezone)

  2. Security
    - Enable RLS on `custom_roles` table
    - Add policy for users to read their own custom roles
    - Add policy for users to create their own custom roles
    - Add policy for users to update their own custom roles
    - Add policy for users to delete their own custom roles
    - Add policy for service role to have full access

  3. Indexes
    - Index on user_id for efficient queries
    - Index on base_role for filtering
*/

CREATE TABLE IF NOT EXISTS custom_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  base_role text NOT NULL,
  custom_label text NOT NULL,
  filters jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE custom_roles ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_custom_roles_user_id ON custom_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_roles_base_role ON custom_roles(base_role);

-- RLS Policies
CREATE POLICY "Users can read own custom roles"
  ON custom_roles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own custom roles"
  ON custom_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own custom roles"
  ON custom_roles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own custom roles"
  ON custom_roles
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role has full access to custom_roles"
  ON custom_roles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers
    WHERE trigger_name = 'update_custom_roles_updated_at'
    AND event_object_table = 'custom_roles'
  ) THEN
    CREATE TRIGGER update_custom_roles_updated_at
      BEFORE UPDATE ON custom_roles
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;