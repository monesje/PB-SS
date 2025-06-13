/*
  # Create survey_responses table

  1. New Tables
    - `survey_responses`
      - `id` (uuid, primary key)
      - `year` (integer, not null)
      - `role` (text, not null)
      - `base_salary` (numeric)
      - `total_package` (numeric)
      - `sector` (text)
      - `specialisation` (text)
      - `operating_budget` (text)
      - `organisation_size_fte` (text)
      - `geographic_reach` (text)
      - `state_territory` (text)
      - `gender` (text)
      - `age_group` (text)
      - `mental_health_support` (integer)
      - `workplace_development` (integer)
      - `likelihood_to_leave` (text)
      - `likelihood_to_leave_2025` (text)
      - `likelihood_to_recommend` (integer)
      - `respondent_id` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `survey_responses` table
    - Add policy for authenticated users to read data
    - Add policies for service role to manage data

  3. Performance
    - Add indexes on commonly queried fields
    - Add trigger for automatic timestamp updates
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
-- Allow all authenticated users to read survey data
CREATE POLICY "Allow authenticated users to read survey responses"
  ON survey_responses
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow service role to manage all data (for admin operations)
CREATE POLICY "Allow service role full access"
  ON survey_responses
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

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