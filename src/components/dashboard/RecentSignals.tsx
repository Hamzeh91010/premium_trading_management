import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowUp, ArrowDown } from 'lucide-react'
import { useSignals } from '@/hooks/useSignals'
import { formatCurrency } from '@/lib/utils'

export function RecentSignals() {
  const { signals } = useSignals()
  const recentSignals = signals.slice(0, 10)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'won':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'lost':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'active':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'expired':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Signals</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 font-medium text-gray-600 dark:text-gray-400">Pair</th>
                <th className="text-left py-2 font-medium text-gray-600 dark:text-gray-400">Direction</th>
                <th className="text-left py-2 font-medium text-gray-600 dark:text-gray-400">Time</th>
                <th className="text-left py-2 font-medium text-gray-600 dark:text-gray-400">Source</th>
                <th className="text-left py-2 font-medium text-gray-600 dark:text-gray-400">Status</th>
                <th className="text-right py-2 font-medium text-gray-600 dark:text-gray-400">Profit</th>
              </tr>
            </thead>
            <tbody>
              {recentSignals.map((signal) => (
                <tr key={signal.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="py-3 font-medium">{signal.pair}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-1">
                      {signal.direction === 'call' ? (
                        <ArrowUp className="w-4 h-4 text-green-600" />
                      ) : (
                        <ArrowDown className="w-4 h-4 text-red-600" />
                      )}
                      <span className="capitalize">{signal.direction}</span>
                    </div>
                  </td>
                  <td className="py-3 text-sm text-gray-600 dark:text-gray-400">
                    {signal.timeframe}
                  </td>
                  <td className="py-3 text-sm">{signal.source}</td>
                  <td className="py-3">
                    <Badge className={getStatusColor(signal.status)}>
                      {signal.status}
                    </Badge>
                  </td>
                  <td className="py-3 text-right">
                    {signal.profit !== undefined ? (
                      <span className={signal.profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {formatCurrency(signal.profit)}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}