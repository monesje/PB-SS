/*
  # Create custom_roles table

  1. New Tables
    - `custom_roles`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `base_role` (text, the original role name)
      - `custom_label` (text, user's custom name for this role)
      - `filters` (jsonb, stored filter configuration)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `custom_roles` table
    - Add policy for users to manage their own custom roles
    - Add policy for service role full access

  3. Indexes
    - Index on user_id for efficient user queries
    - Index on base_role for role-based queries
*/

CREATE TABLE IF NOT EXISTS custom_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  base_role text NOT NULL,
  custom_label text NOT NULL,
  filters jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE custom_roles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage own custom roles"
  ON custom_roles
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role has full access to custom_roles"
  ON custom_roles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_custom_roles_user_id ON custom_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_roles_base_role ON custom_roles(base_role);
CREATE INDEX IF NOT EXISTS idx_custom_roles_user_role ON custom_roles(user_id, base_role);

-- Create trigger for updated_at
CREATE TRIGGER update_custom_roles_updated_at
  BEFORE UPDATE ON custom_roles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();