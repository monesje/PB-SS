import React from 'react'
import { Filter, X } from 'lucide-react'
import type { FilterOptions, SurveyResponse } from '../types'

interface FilterPanelProps {
  filters: FilterOptions
  onFiltersChange: (filters: FilterOptions) => void
  responses: SurveyResponse[]
}

export default function FilterPanel({ filters, onFiltersChange, responses }: FilterPanelProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  // Extract unique values for filter options
  const getUniqueValues = (field: keyof SurveyResponse) => {
    return Array.from(new Set(
      responses
        .map(r => r[field])
        .filter(value => value !== null && value !== undefined && value !== '')
    )).sort()
  }

  const sectorOptions = getUniqueValues('sector') as string[]
  const budgetOptions = getUniqueValues('operating_budget') as string[]
  const sizeOptions = getUniqueValues('organisation_size_fte') as string[]
  const stateOptions = getUniqueValues('state_territory') as string[]
  const yearOptions = getUniqueValues('year') as number[]

  const handleFilterChange = (filterType: keyof FilterOptions, value: string | number, checked: boolean) => {
    const currentValues = filters[filterType] || []
    
    let newValues: (string | number)[]
    if (checked) {
      newValues = [...currentValues, value]
    } else {
      newValues = currentValues.filter(v => v !== value)
    }

    onFiltersChange({
      ...filters,
      [filterType]: newValues.length > 0 ? newValues : undefined
    })
  }

  const clearAllFilters = () => {
    onFiltersChange({})
  }

  const activeFilterCount = Object.values(filters).filter(f => f && f.length > 0).length

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
        >
          <Filter className="h-5 w-5" />
          <span className="font-medium">Filters</span>
          {activeFilterCount > 0 && (
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
              {activeFilterCount}
            </span>
          )}
        </button>

        {activeFilterCount > 0 && (
          <button
            onClick={clearAllFilters}
            className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700"
          >
            <X className="h-4 w-4" />
            <span>Clear all</span>
          </button>
        )}
      </div>

      {isOpen && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 pt-4 border-t border-gray-200">
          {/* Sector Filter */}
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Sector</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {sectorOptions.map(option => (
                <label key={option} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.sector?.includes(option) || false}
                    onChange={(e) => handleFilterChange('sector', option, e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Operating Budget Filter */}
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Operating Budget</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {budgetOptions.map(option => (
                <label key={option} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.operating_budget?.includes(option) || false}
                    onChange={(e) => handleFilterChange('operating_budget', option, e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Organisation Size Filter */}
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Organisation Size</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {sizeOptions.map(option => (
                <label key={option} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.organisation_size_fte?.includes(option) || false}
                    onChange={(e) => handleFilterChange('organisation_size_fte', option, e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>

          {/* State/Territory Filter */}
          <div>
            <h3 className="font-medium text-gray-900 mb-3">State/Territory</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {stateOptions.map(option => (
                <label key={option} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.state_territory?.includes(option) || false}
                    onChange={(e) => handleFilterChange('state_territory', option, e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Year Filter */}
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Year</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {yearOptions.map(option => (
                <label key={option} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.year?.includes(option) || false}
                    onChange={(e) => handleFilterChange('year', option, e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}