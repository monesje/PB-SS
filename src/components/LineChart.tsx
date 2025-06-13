import React from 'react'
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { SurveyResponse, FilterOptions } from '../types'

interface LineChartProps {
  title: string
  data: SurveyResponse[]
  filters: FilterOptions
}

export default function LineChart({ title, data, filters }: LineChartProps) {
  // Apply filters to data (excluding year filter for trend analysis)
  let filteredData = data

  if (filters.sector?.length) {
    filteredData = filteredData.filter(r => filters.sector!.includes(r.sector || ''))
  }
  if (filters.operating_budget?.length) {
    filteredData = filteredData.filter(r => filters.operating_budget!.includes(r.operating_budget || ''))
  }
  if (filters.organisation_size_fte?.length) {
    filteredData = filteredData.filter(r => filters.organisation_size_fte!.includes(r.organisation_size_fte || ''))
  }
  if (filters.state_territory?.length) {
    filteredData = filteredData.filter(r => filters.state_territory!.includes(r.state_territory || ''))
  }

  // Group by year and calculate averages
  const yearlyData = filteredData.reduce((acc, response) => {
    if (!response.base_salary) return acc

    if (!acc[response.year]) {
      acc[response.year] = { salaries: [], count: 0 }
    }
    
    acc[response.year].salaries.push(response.base_salary)
    acc[response.year].count++
    
    return acc
  }, {} as Record<number, { salaries: number[], count: number }>)

  // Convert to chart data format
  const chartData = Object.entries(yearlyData)
    .map(([year, value]) => ({
      year: parseInt(year),
      salary: Math.round(value.salaries.reduce((sum, s) => sum + s, 0) / value.salaries.length),
      count: value.count
    }))
    .sort((a, b) => a.year - b.year)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{label}</p>
          <p className="text-blue-600">
            Average: {formatCurrency(payload[0].value)}
          </p>
          <p className="text-gray-600 text-sm">
            Sample size: {payload[0].payload.count}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      
      {chartData.length > 0 ? (
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsLineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis tickFormatter={formatCurrency} />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="salary" 
                stroke="#3B82F6" 
                strokeWidth={2}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
              />
            </RechartsLineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-80 flex items-center justify-center text-gray-500">
          No data available for the selected filters
        </div>
      )}
    </div>
  )
}