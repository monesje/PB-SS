import React, { useState, useEffect } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { supabase } from '../lib/supabase'
import { parseAndIngestCSV } from '../../scripts/parse-csv'
import { Upload, Download, Users, BarChart3, Settings } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminPage() {
  const { getThemeColors } = useTheme()
  const colors = getThemeColors()

  const [activeTab, setActiveTab] = useState('upload')
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalResponses: 0,
    customRoles: 0,
    activeAccess: 0
  })

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const [usersResult, responsesResult, rolesResult, accessResult] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase.from('survey_responses').select('id', { count: 'exact' }),
        supabase.from('custom_roles').select('id', { count: 'exact' }),
        supabase.from('user_access').select('id', { count: 'exact' })
      ])

      setStats({
        totalUsers: usersResult.count || 0,
        totalResponses: responsesResult.count || 0,
        customRoles: rolesResult.count || 0,
        activeAccess: accessResult.count || 0
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast.error('Please select a CSV file')
      return
    }
    setUploading(true)
    setUploadProgress(0)
    
    try {
      // Read file content
      const csvContent = await file.text()
      
      // Parse and ingest CSV
      const result = await parseAndIngestCSV(
        csvContent, 
        selectedYear,
        (progress) => setUploadProgress(progress)
      )
      
      if (result.success) {
        toast.success(result.message)
        if (result.stats) {
          console.log('Upload statistics:', result.stats)
        }
        // Reload stats after successful upload
        await loadStats()
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error(`Error uploading file: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setUploading(false)
      setUploadProgress(0)
      // Clear the file input
      event.target.value = ''
    }
  }

  const tabs = [
    { id: 'upload', label: 'Data Upload', icon: Upload },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings }
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Manage data, users, and system settings
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
            </div>
            <Users className={`h-8 w-8 text-${colors.primary}`} />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Survey Responses</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalResponses}</p>
            </div>
            <BarChart3 className={`h-8 w-8 text-${colors.primary}`} />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Custom Roles</p>
              <p className="text-2xl font-bold text-gray-900">{stats.customRoles}</p>
            </div>
            <Settings className={`h-8 w-8 text-${colors.primary}`} />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Access</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeAccess}</p>
            </div>
            <Download className={`h-8 w-8 text-${colors.primary}`} />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? `border-${colors.primary} text-${colors.primary}`
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-5 w-5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="card">
        {activeTab === 'upload' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Upload Survey Data</h2>
            
            <div className="mb-4">
              <label htmlFor="year-select" className="block text-sm font-medium text-gray-700 mb-2">
                Survey Year
              </label>
              <select
                id="year-select"
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="input max-w-xs"
                disabled={uploading}
              >
                {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <span className={`mt-2 block text-sm font-medium text-${colors.primary}`}>
                      Upload CSV file
                    </span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      accept=".csv"
                      className="sr-only"
                      onChange={handleFileUpload}
                      disabled={uploading}
                    />
                  </label>
                  <p className="mt-2 text-sm text-gray-500">
                    CSV files up to 10MB
                  </p>
                  {uploading && (
                    <div className="mt-4">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`bg-${colors.primary} h-2 rounded-full transition-all duration-300`}
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <p className="text-sm text-gray-600 mt-2">
                        Processing: {Math.round(uploadProgress)}%
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {uploading && uploadProgress === 0 && (
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-600">Reading file...</p>
              </div>
            )}
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-800 mb-2">Upload Instructions</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Select the survey year before uploading</li>
                <li>• CSV file should contain survey response data</li>
                <li>• Existing data for the selected year will be replaced</li>
                <li>• File will be validated before processing</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
            <p className="text-gray-600">User management interface will be implemented here.</p>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Analytics</h2>
            <p className="text-gray-600">Analytics dashboard will be implemented here.</p>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">System Settings</h2>
            <p className="text-gray-600">System settings will be implemented here.</p>
          </div>
        )}
      </div>
    </div>
  )
}