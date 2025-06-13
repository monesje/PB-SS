import React from 'react'
import { DivideIcon as LucideIcon } from 'lucide-react'

interface KpiCardProps {
  title: string
  value: string
  icon: LucideIcon
  color: string
  subtitle?: string
}

export default function KpiCard({ title, value, icon: Icon, color, subtitle }: KpiCardProps) {
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 bg-${color.replace('-600', '-100')} rounded-lg`}>
          <Icon className={`h-6 w-6 text-${color}`} />
        </div>
      </div>
    </div>
  )
}