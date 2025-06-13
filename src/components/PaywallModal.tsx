import React from 'react'
import { X, Check } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'

interface PaywallModalProps {
  isOpen: boolean
  onClose: () => void
  roleId?: string
}

export default function PaywallModal({ isOpen, onClose, roleId }: PaywallModalProps) {
  const { getThemeColors } = useTheme()
  const colors = getThemeColors()

  if (!isOpen) return null

  const pricingTiers = [
    {
      name: 'Small Organisation',
      price: 359,
      employees: '1-50 employees',
      color: 'teal',
      features: [
        'Full access to all 41 roles',
        'Complete filtering capabilities',
        'Export functionality',
        'Custom benchmark creation',
        'Year-on-year comparisons'
      ]
    },
    {
      name: 'Medium Organisation',
      price: 489,
      employees: '51-100 employees',
      color: 'purple',
      features: [
        'Full access to all 41 roles',
        'Complete filtering capabilities',
        'Export functionality',
        'Custom benchmark creation',
        'Year-on-year comparisons',
        'Priority support'
      ]
    },
    {
      name: 'Large Organisation',
      price: 689,
      employees: '100+ employees',
      color: 'gold',
      features: [
        'Full access to all 41 roles',
        'Complete filtering capabilities',
        'Export functionality',
        'Custom benchmark creation',
        'Year-on-year comparisons',
        'Priority support',
        'Custom reporting'
      ]
    }
  ]

  const handlePurchase = (tier: typeof pricingTiers[0]) => {
    // This would integrate with Stripe
    console.log('Purchasing:', tier)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            Unlock Full Access
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-gray-600 mb-8 text-center">
            Get complete access to salary benchmarking data with advanced filtering, 
            comparisons, and export capabilities.
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {pricingTiers.map((tier, index) => (
              <div
                key={index}
                className={`border-2 border-${tier.color}-200 rounded-lg p-6 relative ${
                  index === 1 ? 'ring-2 ring-purple-500' : ''
                }`}
              >
                {index === 1 && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-purple-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {tier.name}
                  </h3>
                  <div className={`text-3xl font-bold text-${tier.color}-600 mb-1`}>
                    ${tier.price}
                  </div>
                  <p className="text-sm text-gray-600">{tier.employees}</p>
                </div>

                <ul className="space-y-3 mb-6">
                  {tier.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <Check className={`h-5 w-5 text-${tier.color}-500 mr-2 mt-0.5 flex-shrink-0`} />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handlePurchase(tier)}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                    index === 1
                      ? `bg-${tier.color}-600 text-white hover:bg-${tier.color}-700`
                      : `border-2 border-${tier.color}-600 text-${tier.color}-600 hover:bg-${tier.color}-50`
                  }`}
                >
                  Get Started
                </button>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Individual Role Access
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Current Year Role</h4>
                <p className="text-2xl font-bold text-blue-600 mb-2">$150</p>
                <p className="text-sm text-gray-600 mb-4">
                  Access to one specific role for the current year
                </p>
                <button
                  onClick={() => handlePurchase({ name: 'Individual Role', price: 150, employees: 'Per role', color: 'blue', features: [] })}
                  className="w-full py-2 px-4 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  Purchase This Role
                </button>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Historical Role</h4>
                <p className="text-2xl font-bold text-green-600 mb-2">$75</p>
                <p className="text-sm text-gray-600 mb-4">
                  Access to one specific role for previous years
                </p>
                <button
                  onClick={() => handlePurchase({ name: 'Historical Role', price: 75, employees: 'Per role', color: 'green', features: [] })}
                  className="w-full py-2 px-4 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors"
                >
                  Purchase Historical
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>All purchases are one-time payments with permanent access.</p>
            <p>Secure payment processing powered by Stripe.</p>
          </div>
        </div>
      </div>
    </div>
  )
}