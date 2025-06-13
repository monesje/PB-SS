export interface SurveyResponse {
  id: string
  year: number
  role: string
  base_salary?: number
  total_package?: number
  sector?: string
  specialisation?: string
  operating_budget?: string
  organisation_size_fte?: string
  geographic_reach?: string
  state_territory?: string
  gender?: string
  age_group?: string
  mental_health_support?: number
  workplace_development?: number
  likelihood_to_leave?: string
  likelihood_to_leave_2025?: string
  likelihood_to_recommend?: number
  respondent_id?: string
  created_at: string
  updated_at: string
}

export interface CustomRole {
  id: string
  user_id: string
  base_role: string
  custom_label: string
  filters: Record<string, any>
  created_at: string
  updated_at: string
}

export interface UserProfile {
  id: string
  email: string
  full_name?: string
  is_admin: boolean
  organisation_size?: string
  created_at: string
  updated_at: string
}

export interface UserAccess {
  id: string
  user_id: string
  access_type: 'full_report' | 'individual_role'
  role?: string
  year?: number
  expires_at?: string
  created_at: string
}

export interface PricingTier {
  id: string
  name: string
  employee_range: string
  price: number
  stripe_price_id?: string
  created_at: string
  updated_at: string
}

export interface FilterOptions {
  sector?: string[]
  operating_budget?: string[]
  organisation_size_fte?: string[]
  state_territory?: string[]
  year?: number[]
  gender?: string[]
  age_group?: string[]
}

export interface SalaryStats {
  percentile_25: number
  percentile_50: number
  percentile_75: number
  mean: number
  count: number
}

export interface ChartData {
  name: string
  value: number
  count?: number
}

export type ThemeTier = 'small' | 'medium' | 'large' | 'commercial' | 'public'