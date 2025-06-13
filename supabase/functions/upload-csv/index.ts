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

// Column mapping from CSV headers to database fields - using exact headers from your CSV
const COLUMN_MAPPING = {
  'What area of the Not for Profit sector would be the most appropriate to describe your organisation?': 'sector',
  'If selected Multidisciplinary or Other, please specify:': 'specialisation',
  'What is your organisation\'s total operating budget for this financial year?': 'operating_budget',
  'How many employees (full time equivalent) are in your organisation?': 'organisation_size_fte',
  'What geographical area does your organisation cover?': 'geographic_reach',
  'What is the location of your organisation or the National head office?': 'state_territory',
  'What is your gender?': 'gender',
  'What is your age group?': 'age_group',
  'Limited mental health support or wellbeing initiatives': 'mental_health_support',
  'I feel my organisation develops me to do my job.': 'workplace_development',
  'How often do you consider leaving this organisation to work somewhere else?': 'likelihood_to_leave',
  'How likely are you to leave your present employment in 2025?': 'likelihood_to_leave_2025',
  'How likely are you to recommend this organisation to a friend seeking employment?': 'likelihood_to_recommend',
  'Position Title (please make your selection based on the level of seniority for your position)': 'role',
  'Base Salary before tax $ (Full Time Equivalent amount per annum)': 'base_salary',
  'Your organisation Income tax exemption status (if you know this information)?': 'total_package',
  'Survey Comments': 'respondent_id'
}

function cleanValue(value: string): string | number | null {
  if (!value || value.trim() === '' || value.toLowerCase() === 'n/a') {
    return null
  }

  const trimmed = value.trim()

  // Try to parse as number for salary fields
  if (trimmed.match(/^\$?[\d,]+\.?\d*$/)) {
    return parseFloat(trimmed.replace(/[$,]/g, ''))
  }

  // Try to parse as integer for rating fields
  if (trimmed.match(/^\d+$/)) {
    return parseInt(trimmed, 10)
  }

  return trimmed
}

function mapCSVRow(row: CSVRow, year: number): SurveyResponse | null {
  const mapped: any = {
    year,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  // Map CSV columns to database fields
  for (const [csvHeader, dbField] of Object.entries(COLUMN_MAPPING)) {
    if (row[csvHeader] !== undefined) {
      mapped[dbField] = cleanValue(row[csvHeader])
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
        } else {
          errors.push(`Row ${i + 1}: Missing required role field`)
        }
      } catch (error) {
        errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    console.log(`Mapped ${surveyResponses.length} valid survey responses`)

    // Insert data in batches
    const batchSize = 100
    let totalInserted = 0

    for (let i = 0; i < surveyResponses.length; i += batchSize) {
      const batch = surveyResponses.slice(i, i + batchSize)
      
      const { error: insertError, count } = await supabaseClient
        .from('survey_responses')
        .insert(batch)
        .select('*', { count: 'exact' })

      if (insertError) {
        console.error('Batch insert error:', insertError)
        errors.push(`Batch ${Math.floor(i / batchSize) + 1}: ${insertError.message}`)
      } else {
        totalInserted += count || 0
      }
    }

    // Calculate statistics
    const stats = {
      totalRows: data.length,
      validRows: surveyResponses.length,
      inserted: totalInserted,
      errors: errors.length,
      uniqueRoles: new Set(surveyResponses.map(r => r.role).filter(Boolean)).size,
      sectors: new Set(surveyResponses.map(r => r.sector).filter(Boolean)).size
    }

    const message = errors.length > 0
      ? `Upload completed with ${errors.length} errors. ${totalInserted} records inserted out of ${data.length} total rows.`
      : `Successfully uploaded ${totalInserted} survey responses for ${year}`

    return new Response(
      JSON.stringify({ 
        success: true, 
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