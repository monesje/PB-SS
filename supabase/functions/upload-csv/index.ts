import { createClient } from 'npm:@supabase/supabase-js@2'
import Papa from 'npm:papaparse@5'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface CSVRow {
  [key: string]: string
}

interface SurveyResponse {
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
  created_at?: string
  updated_at?: string
}

// Updated column mapping based on your actual CSV headers
const COLUMN_MAPPING = {
  // Organization details
  'What area of the Not for Profit sector would be the most appropriate to describe your organisation?': 'sector',
  'If selected Multidisciplinary or Other, please specify the sectors your organisation covers.': 'specialisation',
  'What is your organisation\'s total operating budget for this financial year?': 'operating_budget',
  'How many employees (full time equivalent) are in your organisation?': 'organisation_size_fte',
  'What geographical area does your organisation cover?': 'geographic_reach',
  'What is the location of your organisation or the National head office?': 'state_territory',
  
  // Personal details
  'What is your gender?': 'gender',
  'What is your age group?': 'age_group',
  
  // Role and salary
  'Are you a': 'role',
  'Position Title (please make your selection based on the level of seniority for your position)': 'role',
  'Base Salary and allowances before tax (excluding overtime, superannuation and incentives). Please provide Full Time Equivalent amount per annum (To calculate FTE amount: Step 1: divide the actual salary by the number of days that you work per week. Step 2: multiply the number calculated in Step 1 by 5 (the number of days per week for a full-time workload).': 'base_salary',
  
  // Workplace satisfaction
  'Limited mental health support or wellbeing initiatives': 'mental_health_support',
  'I feel my organisation develops me to do my job.': 'workplace_development',
  'How often do you consider leaving this organisation to work somewhere else?': 'likelihood_to_leave',
  'How likely are you to leave your present employment in 2025?': 'likelihood_to_leave_2025',
  'How likely are you to recommend this organisation to a friend seeking employment?': 'likelihood_to_recommend',
  
  // Other
  'Survey Comments': 'respondent_id'
}

function cleanValue(value: string, targetField?: string): string | number | null {
  if (!value || value.trim() === '' || value.toLowerCase() === 'n/a' || value.toLowerCase() === 'na') {
    return null
  }

  const trimmed = value.trim()

  // For numeric fields, be extra strict about validation
  const numericFields = ['base_salary', 'total_package', 'mental_health_support', 'workplace_development', 'likelihood_to_recommend']
  const isNumericField = targetField && numericFields.includes(targetField)

  if (isNumericField) {
    // For salary fields - handle currency formatting
    if (targetField === 'base_salary' || targetField === 'total_package') {
      if (trimmed.match(/^\$?[\d,]+\.?\d*$/)) {
        const numValue = parseFloat(trimmed.replace(/[$,]/g, ''))
        return numValue > 0 && numValue < 2000000 ? numValue : null // Reasonable salary range
      }
      return null // Reject non-numeric salary values
    }

    // For rating fields (1-5 scale typically)
    if (trimmed.match(/^\d+$/)) {
      const numValue = parseInt(trimmed, 10)
      return numValue >= 1 && numValue <= 10 ? numValue : null // Accept 1-10 range for flexibility
    }

    // Handle specific response values that should be converted to numbers
    const responseMap: { [key: string]: number } = {
      'strongly disagree': 1,
      'disagree': 2,
      'neither agree nor disagree': 3,
      'neutral': 3,
      'agree': 4,
      'strongly agree': 5,
      'never': 1,
      'rarely': 2,
      'sometimes': 3,
      'often': 4,
      'always': 5,
      'very unlikely': 1,
      'unlikely': 2,
      'slightly unlikely': 2,
      'neutral': 3,
      'slightly likely': 4,
      'likely': 4,
      'very likely': 5
    }

    const lowerValue = trimmed.toLowerCase()
    if (responseMap[lowerValue] !== undefined) {
      return responseMap[lowerValue]
    }

    // If it's supposed to be numeric but we can't parse it, return null
    return null
  }

  // For non-numeric fields, handle salary parsing if it looks like money
  if (trimmed.match(/^\$?[\d,]+\.?\d*$/)) {
    return parseFloat(trimmed.replace(/[$,]/g, ''))
  }

  // Handle integer values
  if (trimmed.match(/^\d+$/)) {
    return parseInt(trimmed, 10)
  }

  // Return as string for text fields
  return trimmed
}

function isHeaderRow(row: CSVRow): boolean {
  // Check if this row contains header-like text instead of actual data
  const values = Object.values(row).filter(v => v && v.trim() !== '')
  
  // If most values look like column headers or questions, skip this row
  const headerIndicators = [
    'What area of the Not for Profit',
    'Position Title',
    'Base Salary',
    'Response',
    'Are you a',
    'How many employees',
    'What is your',
    'survey',
    'question',
    'please'
  ]
  
  let headerLikeCount = 0
  for (const value of values.slice(0, 10)) { // Check first 10 values
    const lowerValue = value.toLowerCase()
    if (headerIndicators.some(indicator => lowerValue.includes(indicator.toLowerCase()))) {
      headerLikeCount++
    }
  }
  
  // If more than 30% of values look like headers, consider this a header row
  return headerLikeCount > Math.max(1, values.length * 0.3)
}

function isValidRole(role: string): boolean {
  if (!role || role.trim() === '') return false
  
  // Check if the role looks like a real role vs a header
  const lowerRole = role.toLowerCase()
  
  // Invalid if it looks like a question or header
  const invalidIndicators = [
    'response',
    'are you a',
    'position title',
    'what is',
    'how many',
    'please',
    'grade 8',
    'grade',
    'level'
  ]
  
  if (invalidIndicators.some(indicator => lowerRole.includes(indicator))) {
    return false
  }
  
  // Valid if it contains role-like keywords
  const roleKeywords = [
    'manager', 'director', 'officer', 'coordinator', 'specialist', 
    'assistant', 'lead', 'head', 'chief', 'executive', 'ceo', 'cfo', 
    'coo', 'tier', 'report'
  ]
  
  return roleKeywords.some(keyword => lowerRole.includes(keyword))
}

function mapCSVRow(row: CSVRow, year: number): SurveyResponse | null {
  // Skip header rows
  if (isHeaderRow(row)) {
    return null
  }

  const mapped: any = {
    year,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  // Map CSV columns to database fields using exact header matching
  for (const [csvHeader, dbField] of Object.entries(COLUMN_MAPPING)) {
    if (row[csvHeader] !== undefined) {
      const cleanedValue = cleanValue(row[csvHeader], dbField)
      if (cleanedValue !== null) {
        mapped[dbField] = cleanedValue
      }
    }
  }

  // Enhanced role detection with better validation
  if (!mapped.role) {
    // Try all possible role column variations
    const roleColumns = [
      'Are you a',
      'Position Title (please make your selection based on the level of seniority for your position)',
      '', // Empty string for unnamed columns
      'Role',
      'Position Title',
      'Job Title',
      'Position',
      '_1', '_2', '_3', '_4', '_5' // Sometimes CSV parsers create numbered columns
    ]
    
    for (const col of roleColumns) {
      if (row[col]) {
        const cleanedRole = cleanValue(row[col])
        if (cleanedRole && typeof cleanedRole === 'string' && isValidRole(cleanedRole)) {
          mapped.role = cleanedRole
          break
        }
      }
    }
  } else {
    // Validate the role we found via COLUMN_MAPPING
    if (!isValidRole(mapped.role)) {
      mapped.role = null
    }
  }

  // If still no role, try looking at all non-empty values in the row
  if (!mapped.role) {
    const allValues = Object.entries(row)
      .filter(([key, value]) => value && value.trim() !== '')
      .slice(0, 15) // Check first 15 values to avoid noise
    
    // Look for values that might be roles (contain common role words)
    for (const [key, value] of allValues) {
      if (isValidRole(value)) {
        mapped.role = value.trim()
        break
      }
    }
  }

  // Enhanced salary detection with better validation
  if (!mapped.base_salary) {
    const salaryColumns = [
      'Base Salary and allowances before tax (excluding overtime, superannuation and incentives). Please provide Full Time Equivalent amount per annum (To calculate FTE amount: Step 1: divide the actual salary by the number of days that you work per week. Step 2: multiply the number calculated in Step 1 by 5 (the number of days per week for a full-time workload).',
      'Base Salary before tax $ (Full Time Equivalent amount per annum)',
      'Base Salary',
      'Salary',
      'Annual Salary'
    ]
    
    for (const col of salaryColumns) {
      if (row[col]) {
        const cleanedSalary = cleanValue(row[col], 'base_salary')
        if (cleanedSalary && typeof cleanedSalary === 'number' && cleanedSalary > 0 && cleanedSalary < 2000000) {
          mapped.base_salary = cleanedSalary
          break
        }
      }
    }
  }

  // Validate that we have a role (required field)
  if (!mapped.role) {
    return null
  }

  return mapped as SurveyResponse
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { csvContent, year } = await req.json()

    if (!csvContent || !year) {
      return new Response(
        JSON.stringify({ success: false, message: 'CSV content and year are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Parse CSV using Papa Parse
    const parseResult = Papa.parse<CSVRow>(csvContent, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim()
    })

    if (parseResult.errors.length > 0) {
      console.error('CSV parsing errors:', parseResult.errors)
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: `CSV parsing errors: ${parseResult.errors.map(e => e.message).join(', ')}` 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const data = parseResult.data
    console.log(`Parsed ${data.length} rows from CSV`)

    // Delete existing data for the year
    const { error: deleteError } = await supabaseClient
      .from('survey_responses')
      .delete()
      .eq('year', year)

    if (deleteError) {
      console.error('Error deleting existing data:', deleteError)
      return new Response(
        JSON.stringify({ success: false, message: 'Failed to clear existing data' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Transform data
    const surveyResponses: SurveyResponse[] = []
    const errors: string[] = []

    for (let i = 0; i < data.length; i++) {
      try {
        const response = mapCSVRow(data[i], year)
        if (response) {
          surveyResponses.push(response)
        }
      } catch (error) {
        const errorMsg = `Row ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`
        errors.push(errorMsg)
      }
    }

    console.log(`Successfully mapped ${surveyResponses.length} valid survey responses`)
    
    // Log sample for debugging
    if (surveyResponses.length > 0) {
      console.log('Sample mapped response:', surveyResponses[0])
    }

    // Insert data if we have valid responses
    let totalInserted = 0
    
    if (surveyResponses.length > 0) {
      try {
        // Try bulk insert first
        const { data: insertedData, error: bulkInsertError } = await supabaseClient
          .from('survey_responses')
          .insert(surveyResponses)
          .select()

        if (bulkInsertError) {
          console.error('Bulk insert failed:', bulkInsertError)
          
          // Fall back to individual insertions
          console.log('Trying individual record insertion...')
          for (let i = 0; i < surveyResponses.length; i++) {
            try {
              const { error: singleError } = await supabaseClient
                .from('survey_responses')
                .insert([surveyResponses[i]])
              
              if (singleError) {
                console.error(`Record ${i + 1} failed:`, singleError.message)
                errors.push(`Record ${i + 1}: ${singleError.message}`)
              } else {
                totalInserted++
              }
            } catch (singleRecordError) {
              console.error(`Record ${i + 1} exception:`, singleRecordError)
              errors.push(`Record ${i + 1}: ${singleRecordError instanceof Error ? singleRecordError.message : 'Unknown error'}`)
            }
          }
        } else {
          // Bulk insert succeeded
          totalInserted = insertedData?.length || 0
          console.log(`Bulk insert succeeded: ${totalInserted} records`)
        }
      } catch (insertException) {
        console.error('Insert exception:', insertException)
        errors.push(`Insert failed: ${insertException instanceof Error ? insertException.message : 'Unknown error'}`)
      }
    }

    // Calculate statistics
    const stats = {
      totalRows: data.length,
      validRows: surveyResponses.length,
      inserted: totalInserted,
      errors: errors.length,
      uniqueRoles: new Set(surveyResponses.map(r => r.role).filter(Boolean)).size,
      sectors: new Set(surveyResponses.map(r => r.sector).filter(Boolean)).size,
      avgSalary: surveyResponses.length > 0 ? 
        Math.round(surveyResponses
          .filter(r => r.base_salary)
          .reduce((sum, r) => sum + (r.base_salary || 0), 0) / 
          surveyResponses.filter(r => r.base_salary).length) : 0
    }

    const success = totalInserted > 0
    const message = success
      ? `Successfully uploaded ${totalInserted} survey responses for ${year}`
      : `Upload processed ${surveyResponses.length} valid records but insertion failed. Check errors for details.`

    return new Response(
      JSON.stringify({ 
        success, 
        message, 
        stats,
        errors: errors.slice(0, 10) // Return first 10 errors for debugging
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Upload error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: `Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})