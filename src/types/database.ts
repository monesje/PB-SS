export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          is_admin: boolean
          organisation_size: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          is_admin?: boolean
          organisation_size?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          is_admin?: boolean
          organisation_size?: string | null
          updated_at?: string
        }
      }
      survey_responses: {
        Row: {
          id: string
          year: number
          role: string
          base_salary: number | null
          total_package: number | null
          sector: string | null
          specialisation: string | null
          operating_budget: string | null
          organisation_size_fte: string | null
          geographic_reach: string | null
          state_territory: string | null
          gender: string | null
          age_group: string | null
          mental_health_support: number | null
          workplace_development: number | null
          likelihood_to_leave: string | null
          likelihood_to_leave_2025: string | null
          likelihood_to_recommend: number | null
          respondent_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          year: number
          role: string
          base_salary?: number | null
          total_package?: number | null
          sector?: string | null
          specialisation?: string | null
          operating_budget?: string | null
          organisation_size_fte?: string | null
          geographic_reach?: string | null
          state_territory?: string | null
          gender?: string | null
          age_group?: string | null
          mental_health_support?: number | null
          workplace_development?: number | null
          likelihood_to_leave?: string | null
          likelihood_to_leave_2025?: string | null
          likelihood_to_recommend?: number | null
          respondent_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          year?: number
          role?: string
          base_salary?: number | null
          total_package?: number | null
          sector?: string | null
          specialisation?: string | null
          operating_budget?: string | null
          organisation_size_fte?: string | null
          geographic_reach?: string | null
          state_territory?: string | null
          gender?: string | null
          age_group?: string | null
          mental_health_support?: number | null
          workplace_development?: number | null
          likelihood_to_leave?: string | null
          likelihood_to_leave_2025?: string | null
          likelihood_to_recommend?: number | null
          respondent_id?: string | null
          updated_at?: string
        }
      }
      custom_roles: {
        Row: {
          id: string
          user_id: string
          base_role: string
          custom_label: string
          filters: Record<string, any>
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          base_role: string
          custom_label: string
          filters?: Record<string, any>
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          base_role?: string
          custom_label?: string
          filters?: Record<string, any>
          updated_at?: string
        }
      }
      user_access: {
        Row: {
          id: string
          user_id: string
          access_type: 'full_report' | 'individual_role'
          role: string | null
          year: number | null
          expires_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          access_type: 'full_report' | 'individual_role'
          role?: string | null
          year?: number | null
          expires_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          access_type?: 'full_report' | 'individual_role'
          role?: string | null
          year?: number | null
          expires_at?: string | null
        }
      }
      pricing_tiers: {
        Row: {
          id: string
          name: string
          employee_range: string
          price: number
          stripe_price_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          employee_range: string
          price: number
          stripe_price_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          employee_range?: string
          price?: number
          stripe_price_id?: string | null
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}