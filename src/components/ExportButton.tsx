import React, { useState } from 'react'
import { Download, FileImage, FileText } from 'lucide-react'
import type { SurveyResponse, FilterOptions } from '../types'

interface ExportButtonProps {
  data: SurveyResponse[]
  filters: FilterOptions
}

export default function ExportButton({ data, filters }: ExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  const exportToPDF = async () => {
    // This would implement PDF export functionality
    console.log('Exporting to PDF...', { data, filters })
    setIsOpen(false)
  }

  const exportToImage = async () => {
    // This would implement image export functionality using html2canvas
    console.log('Exporting to image...', { data, filters })
    setIsOpen(false)
  }

  const exportToCSV = () => {
    // Apply filters to data
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
    if (filters.year?.length) {
      filteredData = filteredData.filter(r => filters.year!.includes(r.year))
    }

    // Convert to CSV
    const headers = ['Role', 'Base Salary', 'Total Package', 'Sector', 'Operating Budget', 'Organisation Size', 'State/Territory', 'Year']
    const csvContent = [
      headers.join(','),
      ...filteredData.map(row => [
        row.role,
        row.base_salary || '',
        row.total_package || '',
        row.sector || '',
        row.operating_budget || '',
        row.organisation_size_fte || '',
        row.state_territory || '',
        row.year
      ].join(','))
    ].join('\n')

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `salary-data-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <Download className="h-4 w-4" />
        <span>Export</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
          <div className="py-1">
            <button
              onClick={exportToCSV}
              className="flex items-center space-x-2 w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100"
            >
              <FileText className="h-4 w-4" />
              <span>Export as CSV</span>
            </button>
            
            <button
              onClick={exportToPDF}
              className="flex items-center space-x-2 w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100"
            >
              <FileText className="h-4 w-4" />
              <span>Export as PDF</span>
            </button>
            
            <button
              onClick={exportToImage}
              className="flex items-center space-x-2 w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100"
            >
              <FileImage className="h-4 w-4" />
              <span>Export as Image</span>
            </button>
          </div>
        </div>
      )}

      {isOpen && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}