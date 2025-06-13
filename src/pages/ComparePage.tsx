import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import FilterPanel from '../components/FilterPanel'
import KpiCard from '../components/KpiCard'
import BarChart from '../components/BarChart'
import LineChart from '../components/LineChart'
import ExportButton from '../components/ExportButton'
import PaywallModal from '../components/PaywallModal'
import { supabase } from '../lib/supabase'
import type { SurveyResponse, FilterOptions, SalaryStats } from '../types'
import { DollarSign, TrendingUp, Users, MapPin } from 'lucide-react'

export default function ComparePage() {
  const { roleId } = useParams<{ roleId: string }>()
  const { user } = useAuth()
  const { getThemeColors } = useTheme()
  const colors = getThemeColors()

  const [responses, setResponses] = useState<SurveyResponse[]>([])
  const [filters, setFilters] = useState<FilterOptions>({})
  const [stats, setStats] = useState<SalaryStats | null>(null)
  const [showPaywall, setShowPaywall] = useState(false)
  const [loading, setLoading] = useState(true)
  const [hasAccess, setHasAccess] = useState(false)

  const devOverride = import.meta.env.VITE_DEV_OVERRIDE === 'true'

  useEffect(() => {
    loadData()
    checkAccess()
  }, [roleId, user])

  useEffect(() => {
    calculateStats()
  }, [responses, filters])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Convert roleId back to readable format
      const role = roleId?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || ''
      
      let query = supabase
        .from('survey_responses')
        .select('*')
        .ilike('role', `%${role}%`)

      const { data, error } = await query

      if (error) throw error
      setResponses(data || [])
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkAccess = async () => {
    if (!user) return

    // In dev mode, grant full access
    if (devOverride) {
      setHasAccess(true)
      return
    }

    try {
      const { data, error } = await supabase
        .from('user_access')
        .select('*')
        .eq('user_id', user.id)
        .or(`access_type.eq.full_report,and(access_type.eq.individual_role,role.eq.${roleId})`)

      if (error) throw error
      setHasAccess(data && data.length > 0)
    } catch (error) {
      console.error('Error checking access:', error)
    }
  }

  const calculateStats = () => {
    let filteredData = responses

    // Apply filters
    if (filters.sector?.length) {
      filteredData = filteredData.filter(r => 
        filters.sector!.includes(r.sector || '')
      )
    }

    if (filters.operating_budget?.length) {
      filteredData = filteredData.filter(r => 
        filters.operating_budget!.includes(r.operating_budget || '')
      )
    }

    if (filters.organisation_size_fte?.length) {
      filteredData = filteredData.filter(r => 
        filters.organisation_size_fte!.includes(r.organisation_size_fte || '')
      )
    }

    if (filters.state_territory?.length) {
      filteredData = filteredData.filter(r => 
        filters.state_territory!.includes(r.state_territory || '')
      )
    }

    if (filters.year?.length) {
      filteredData = filteredData.filter(r => 
        filters.year!.includes(r.year)
      )
    }

    // Calculate salary statistics
    const salaries = filteredData
      .map(r => r.base_salary)
      .filter(s => s !== null && s !== undefined)
      .sort((a, b) => a! - b!)

    if (salaries.length === 0) {
      setStats(null)
      return
    }

    const count = salaries.length
    const mean = salaries.reduce((sum, salary) => sum + salary!, 0) / count
    const percentile_25 = salaries[Math.floor(count * 0.25)]!
    const percentile_50 = salaries[Math.floor(count * 0.5)]!
    const percentile_75 = salaries[Math.floor(count * 0.75)]!

    setStats({
      percentile_25,
      percentile_50,
      percentile_75,
      mean,
      count
    })
  }

  const handleFilterChange = (newFilters: FilterOptions) => {
    if (!user || !hasAccess) {
      setShowPaywall(true)
      return
    }
    setFilters(newFilters)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const roleName = roleId?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || ''

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{roleName}</h1>
          <p className="text-gray-600 mt-2">
            Salary benchmarking data for {roleName} positions
          </p>
        </div>
        
        <div className="flex items-center space-x-4 mt-4 lg:mt-0">
          <ExportButton data={responses} filters={filters} />
        </div>
      </div>

      {/* Filters */}
      <FilterPanel 
        filters={filters} 
        onFiltersChange={handleFilterChange}
        responses={responses}
      />

      {/* KPI Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KpiCard
            title="25th Percentile"
            value={formatCurrency(stats.percentile_25)}
            icon={DollarSign}
            color={colors.primary}
          />
          <KpiCard
            title="Median (50th)"
            value={formatCurrency(stats.percentile_50)}
            icon={TrendingUp}
            color={colors.primary}
          />
          <KpiCard
            title="75th Percentile"
            value={formatCurrency(stats.percentile_75)}
            icon={DollarSign}
            color={colors.primary}
          />
          <KpiCard
            title="Sample Size"
            value={stats.count.toString()}
            icon={Users}
            color={colors.primary}
          />
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <BarChart
          title="Salary by Sector"
          data={responses}
          filters={filters}
          groupBy="sector"
        />
        
        <LineChart
          title="Salary Trends"
          data={responses}
          filters={filters}
        />
      </div>

      {/* Low Response Warning */}
      {stats && stats.count < 5 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">
            <strong>Note:</strong> This role has fewer than 5 responses. 
            Results may not be statistically significant.
          </p>
        </div>
      )}

      {/* Paywall Modal */}
      <PaywallModal 
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        roleId={roleId}
      />
    </div>
  )
}