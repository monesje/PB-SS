import Papa from 'papaparse'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '../src/types/database'

// This script handles CSV parsing and data ingestion
// Run with: npx tsx scripts/parse-csv.ts <file-path>

const supabaseUrl = process.env.VITE_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey)

interface CSVRow {
  [key: string]: string
}

// Column mapping from CSV headers to database fields
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
  'Role': 'role',
  'Base Salary': 'base_salary',
  'Total Package': 'total_package',
  'Respondent ID': 'respondent_id'
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

function mapCSVRow(row: CSVRow, year: number): any {
  const mapped: any = {
    year,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  for (const [csvHeader, dbField] of Object.entries(COLUMN_MAPPING)) {
    if (row[csvHeader] !== undefined) {
      mapped[dbField] = cleanValue(row[csvHeader])
    }
  }

  return mapped
}

async function validateCSV(data: CSVRow[]): Promise<{ valid: boolean; errors: string[] }> {
  const errors: string[] = []

  // Check required columns
  const requiredColumns = ['Role', 'Base Salary']
  const headers = Object.keys(data[0] || {})

  for (const required of requiredColumns) {
    if (!headers.includes(required)) {
      errors.push(`Missing required column: ${required}`)
    }
  }

  // Check data quality
  const roles = new Set()
  for (const row of data) {
    if (row.Role) {
      roles.add(row.Role)
    }
  }

  if (roles.size === 0) {
    errors.push('No valid roles found in data')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

export async function parseAndIngestCSV(
  csvContent: string, 
  year: number,
  onProgress?: (progress: number) => void
): Promise<{ success: boolean; message: string; stats?: any }> {
  try {
    // Parse CSV
    const parseResult = Papa.parse<CSVRow>(csvContent, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim()
    })

    if (parseResult.errors.length > 0) {
      return {
        success: false,
        message: `CSV parsing errors: ${parseResult.errors.map(e => e.message).join(', ')}`
      }
    }

    const data = parseResult.data

    // Validate CSV structure
    const validation = await validateCSV(data)
    if (!validation.valid) {
      return {
        success: false,
        message: `Validation errors: ${validation.errors.join(', ')}`
      }
    }

    // Transform data
    const transformedData = data.map(row => mapCSVRow(row, year))

    // Remove existing data for this year
    const { error: deleteError } = await supabase
      .from('survey_responses')
      .delete()
      .eq('year', year)

    if (deleteError) {
      throw deleteError
    }

    // Insert new data in batches
    const batchSize = 100
    let inserted = 0

    for (let i = 0; i < transformedData.length; i += batchSize) {
      const batch = transformedData.slice(i, i + batchSize)
      
      const { error: insertError } = await supabase
        .from('survey_responses')
        .insert(batch)

      if (insertError) {
        throw insertError
      }

      inserted += batch.length
      
      if (onProgress) {
        onProgress((inserted / transformedData.length) * 100)
      }
    }

    // Calculate statistics
    const stats = {
      totalRows: transformedData.length,
      uniqueRoles: new Set(transformedData.map(r => r.role).filter(Boolean)).size,
      yearRange: [year],
      sectors: new Set(transformedData.map(r => r.sector).filter(Boolean)).size
    }

    return {
      success: true,
      message: `Successfully imported ${inserted} records for year ${year}`,
      stats
    }

  } catch (error) {
    console.error('Error parsing CSV:', error)
    return {
      success: false,
      message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

// CLI usage
if (require.main === module) {
  const filePath = process.argv[2]
  const year = parseInt(process.argv[3]) || new Date().getFullYear()

  if (!filePath) {
    console.error('Usage: npx tsx scripts/parse-csv.ts <file-path> [year]')
    process.exit(1)
  }

  const fs = require('fs')
  
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`)
    process.exit(1)
  }

  const csvContent = fs.readFileSync(filePath, 'utf-8')
  
  parseAndIngestCSV(csvContent, year, (progress) => {
    console.log(`Progress: ${progress.toFixed(1)}%`)
  }).then(result => {
    console.log(result.message)
    if (result.stats) {
      console.log('Statistics:', result.stats)
    }
    process.exit(result.success ? 0 : 1)
  })
}