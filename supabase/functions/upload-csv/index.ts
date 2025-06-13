import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
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
}

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  
  result.push(current.trim())
  return result
}

function parseCSV(csvContent: string): string[][] {
  const lines = csvContent.split(/\r?\n/).filter(line => line.trim())
  return lines.map(line => parseCSVLine(line))
}

function mapRowToSurveyResponse(row: string[], headers: string[], year: number): SurveyResponse | null {
  if (row.length === 0 || row.every(cell => !cell.trim())) {
    return null
  }

  const getValue = (headerName: string): string => {
    const index = headers.findIndex(h => 
      h.toLowerCase().replace(/[^a-z0-9]/g, '') === headerName.toLowerCase().replace(/[^a-z0-9]/g, '')
    )
    return index >= 0 ? (row[index] || '').trim() : ''
  }

  const getNumericValue = (headerName: string): number | undefined => {
    const value = getValue(headerName)
    if (!value) return undefined
    const parsed = parseFloat(value.replace(/[,$]/g, ''))
    return isNaN(parsed) ? undefined : parsed
  }

  const role = getValue('role') || getValue('jobtitle') || getValue('position')
  if (!role) {
    return null
  }

  return {
    year,
    role,
    base_salary: getNumericValue('basesalary') || getNumericValue('salary'),
    total_package: getNumericValue('totalpackage') || getNumericValue('totalcompensation'),
    sector: getValue('sector') || getValue('industry'),
    specialisation: getValue('specialisation') || getValue('specialization'),
    operating_budget: getValue('operatingbudget') || getValue('budget'),
    organisation_size_fte: getValue('organisationsizefte') || getValue('organizationsize'),
    geographic_reach: getValue('geographicreach') || getValue('location'),
    state_territory: getValue('stateterritory') || getValue('state'),
    gender: getValue('gender'),
    age_group: getValue('agegroup') || getValue('age'),
    mental_health_support: getNumericValue('mentalhealthsupport'),
    workplace_development: getNumericValue('workplacedevelopment'),
    likelihood_to_leave: getValue('likelihoodtoleave'),
    likelihood_to_leave_2025: getValue('likelihoodtoleave2025'),
    likelihood_to_recommend: getNumericValue('likelihoodtorecommend'),
    respondent_id: getValue('respondentid') || getValue('id')
  }
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

    // Parse CSV
    const rows = parseCSV(csvContent)
    if (rows.length < 2) {
      return new Response(
        JSON.stringify({ success: false, message: 'CSV must contain headers and at least one data row' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const headers = rows[0].map(h => h.toLowerCase().trim())
    const dataRows = rows.slice(1)

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

    // Process rows in batches
    const batchSize = 100
    let totalProcessed = 0
    let totalInserted = 0
    const errors: string[] = []

    for (let i = 0; i < dataRows.length; i += batchSize) {
      const batch = dataRows.slice(i, i + batchSize)
      const surveyResponses: SurveyResponse[] = []

      for (const row of batch) {
        try {
          const response = mapRowToSurveyResponse(row, headers, year)
          if (response) {
            surveyResponses.push(response)
          }
        } catch (error) {
          errors.push(`Row ${i + totalProcessed + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
        totalProcessed++
      }

      if (surveyResponses.length > 0) {
        const { error: insertError, count } = await supabaseClient
          .from('survey_responses')
          .insert(surveyResponses)
          .select('*', { count: 'exact' })

        if (insertError) {
          console.error('Batch insert error:', insertError)
          errors.push(`Batch ${Math.floor(i / batchSize) + 1}: ${insertError.message}`)
        } else {
          totalInserted += count || 0
        }
      }
    }

    const stats = {
      totalRows: dataRows.length,
      processed: totalProcessed,
      inserted: totalInserted,
      errors: errors.length
    }

    const message = errors.length > 0
      ? `Upload completed with ${errors.length} errors. ${totalInserted} records inserted.`
      : `Successfully uploaded ${totalInserted} survey responses for ${year}`

    return new Response(
      JSON.stringify({ 
        success: true, 
        message, 
        stats,
        errors: errors.slice(0, 10) // Return first 10 errors
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