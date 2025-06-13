import React from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'
import { BarChart3, TrendingUp, Users, Shield } from 'lucide-react'

export default function HomePage() {
  const { getThemeColors } = useTheme()
  const colors = getThemeColors()

  const features = [
    {
      icon: BarChart3,
      title: 'Comprehensive Data',
      description: 'Access salary benchmarking data across 41 roles in the Australian not-for-profit sector'
    },
    {
      icon: TrendingUp,
      title: 'Interactive Analytics',
      description: 'Filter and compare data by sector, budget, organisation size, and more'
    },
    {
      icon: Users,
      title: 'Custom Benchmarks',
      description: 'Create and save custom role comparisons for ongoing analysis'
    },
    {
      icon: Shield,
      title: 'Secure Access',
      description: 'Professional-grade security with role-based access control'
    }
  ]

  const sampleRoles = [
    'Chief Executive Officer',
    'Chief Financial Officer',
    'Head of Marketing',
    'Program Manager',
    'Development Manager',
    'Operations Manager'
  ]

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <div className="text-center space-y-8">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900">
          PBA Salary Survey
          <span className={`block text-${colors.primary}`}>Portal</span>
        </h1>
        
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          The definitive salary benchmarking platform for HR professionals in the Australian not-for-profit sector. 
          Access comprehensive data, create custom comparisons, and make informed compensation decisions.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/compare/ceo"
            className={`px-8 py-3 bg-${colors.primary} text-white rounded-lg font-semibold hover:bg-${colors.primary}/90 transition-colors`}
          >
            Explore Sample Data
          </Link>
          <Link
            to="/login"
            className={`px-8 py-3 border-2 border-${colors.primary} text-${colors.primary} rounded-lg font-semibold hover:bg-${colors.secondary} transition-colors`}
          >
            Get Full Access
          </Link>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        {features.map((feature, index) => (
          <div key={index} className="card text-center space-y-4">
            <div className={`w-12 h-12 bg-${colors.secondary} rounded-lg flex items-center justify-center mx-auto`}>
              <feature.icon className={`h-6 w-6 text-${colors.primary}`} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{feature.title}</h3>
            <p className="text-gray-600">{feature.description}</p>
          </div>
        ))}
      </div>

      {/* Sample Roles */}
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Roles</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sampleRoles.map((role, index) => (
            <Link
              key={index}
              to={`/compare/${role.toLowerCase().replace(/\s+/g, '-')}`}
              className={`p-4 border border-gray-200 rounded-lg hover:border-${colors.primary} hover:bg-${colors.background} transition-colors`}
            >
              <span className="font-medium text-gray-900">{role}</span>
            </Link>
          ))}
        </div>
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            And 35 more roles available with full access
          </p>
        </div>
      </div>

      {/* Pricing Preview */}
      <div className="card text-center space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Flexible Pricing</h2>
        <p className="text-gray-600">
          Choose the access level that fits your organisation's needs
        </p>
        
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="border border-gray-200 rounded-lg p-6 space-y-4">
            <h3 className="text-lg font-semibold">Small Organisations</h3>
            <p className="text-2xl font-bold text-teal-600">$359</p>
            <p className="text-sm text-gray-600">1-50 employees</p>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-6 space-y-4">
            <h3 className="text-lg font-semibold">Medium Organisations</h3>
            <p className="text-2xl font-bold text-purple-600">$489</p>
            <p className="text-sm text-gray-600">51-100 employees</p>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-6 space-y-4">
            <h3 className="text-lg font-semibold">Large Organisations</h3>
            <p className="text-2xl font-bold text-gold-600">$689</p>
            <p className="text-sm text-gray-600">100+ employees</p>
          </div>
        </div>
        
        <p className="text-sm text-gray-500">
          Individual role access available from $150/role
        </p>
      </div>
    </div>
  )
}