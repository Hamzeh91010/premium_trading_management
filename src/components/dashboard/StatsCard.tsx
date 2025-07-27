import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, formatPercentage } from '@/lib/utils'

interface StatsCardProps {
  title: string
  value: string | number
  change?: number
  icon: React.ReactNode
  type?: 'currency' | 'percentage' | 'number'
}

export function StatsCard({ title, value, change, icon, type = 'number' }: StatsCardProps) {
  const formatValue = (val: string | number) => {
    if (typeof val === 'string') return val
    
    switch (type) {
      case 'currency':
        return formatCurrency(val)
      case 'percentage':
        return formatPercentage(val)
      default:
        return val.toLocaleString()
    }
  }

  const getChangeColor = (change: number) => {
    return change >= 0 ? 'text-green-600' : 'text-red-600'
  }

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {title}
        </CardTitle>
        <div className="text-blue-600 dark:text-blue-400">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900 dark:text-white">
          {formatValue(value)}
        </div>
        {change !== undefined && (
          <p className={`text-xs mt-1 ${getChangeColor(change)}`}>
            {change >= 0 ? '+' : ''}{formatPercentage(change)} from yesterday
          </p>
        )}
      </CardContent>
    </Card>
  )
}