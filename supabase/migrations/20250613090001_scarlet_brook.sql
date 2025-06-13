/*
  # Create survey_responses table

  1. New Tables
    - `survey_responses`
      - `id` (uuid, primary key)
      - `year` (integer, required)
      - `role` (text, required)
      - `base_salary` (numeric, nullable)
      - `total_package` (numeric, nullable)
      - `sector` (text, nullable)
      - `specialisation` (text, nullable)
      - `operating_budget` (text, nullable)
      - `organisation_size_fte` (text, nullable)
      - `geographic_reach` (text, nullable)
      - `state_territory` (text, nullable)
      - `gender` (text, nullable)
      - `age_group` (text, nullable)
      - `mental_health_support` (integer, nullable)
      - `workplace_development` (integer, nullable)
      - `likelihood_to_leave` (text, nullable)
      - `likelihood_to_leave_2025` (text, nullable)
      - `likelihood_to_recommend` (integer, nullable)
      - `respondent_id` (text, nullable)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `survey_responses` table
    - Add policy for authenticated users to read survey data
    - Add policy for admins to insert/update/delete survey data

  3. Indexes
    - Add indexes for commonly queried fields (role, year, sector, state_territory)
*/

CREATE TABLE IF NOT EXISTS survey_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  year integer NOT NULL,
  role text NOT NULL,
  base_salary numeric,
  total_package numeric,
  sector text,
  specialisation text,
  operating_budget text,
  organisation_size_fte text,
  geographic_reach text,
  state_territory text,
  gender text,
  age_group text,
  mental_health_support integer,
  workplace_development integer,
  likelihood_to_leave text,
  likelihood_to_leave_2025 text,
  likelihood_to_recommend integer,
  respondent_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;

-- Create policies for data access
CREATE POLICY "Allow authenticated users to read survey responses"
  ON survey_responses
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow admins to insert survey responses"
  ON survey_responses
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Allow admins to update survey responses"
  ON survey_responses
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Allow admins to delete survey responses"
  ON survey_responses
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_survey_responses_role ON survey_responses(role);
CREATE INDEX IF NOT EXISTS idx_survey_responses_year ON survey_responses(year);
CREATE INDEX IF NOT EXISTS idx_survey_responses_sector ON survey_responses(sector);
CREATE INDEX IF NOT EXISTS idx_survey_responses_state_territory ON survey_responses(state_territory);
CREATE INDEX IF NOT EXISTS idx_survey_responses_role_year ON survey_responses(role, year);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_survey_responses_updated_at
  BEFORE UPDATE ON survey_responses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();