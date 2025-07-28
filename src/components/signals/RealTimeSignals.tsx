import React, { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  Zap
} from 'lucide-react'
import { useRealSignals } from '@/hooks/useRealSignals'
import { formatCurrency, formatPercentage } from '@/lib/utils'

export function RealTimeSignals() {
  const { 
    signals, 
    isLoading, 
    lastUpdated, 
    fetchSignals, 
    getActiveSignals, 
    getCompletedSignals,
    getTodayStats 
  } = useRealSignals()

  useEffect(() => {
    fetchSignals()
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchSignals, 30000)
    return () => clearInterval(interval)
  }, [fetchSignals])

  const activeSignals = getActiveSignals()
  const completedSignals = getCompletedSignals().slice(0, 10) // Show last 10
  const todayStats = getTodayStats()

  const getStatusBadge = (signal: any) => {
    if (!signal.executed && !signal.is_expired) {
      return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Active</Badge>
    }
    if (signal.result === 'win') {
      return <Badge className="bg-green-100 text-green-800 border-green-200">Won</Badge>
    }
    if (signal.result === 'loss') {
      return <Badge className="bg-red-100 text-red-800 border-red-200">Lost</Badge>
    }
    return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Expired</Badge>
  }

  const getResultIcon = (signal: any) => {
    if (!signal.executed && !signal.is_expired) {
      return <Clock className="w-4 h-4 text-blue-500" />
    }
    if (signal.result === 'win') {
      return <CheckCircle className="w-4 h-4 text-green-500" />
    }
    if (signal.result === 'loss') {
      return <XCircle className="w-4 h-4 text-red-500" />
    }
    return <Clock className="w-4 h-4 text-gray-500" />
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffMs = now.getTime() - time.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    
    if (diffMins < 1) return 'now'
    if (diffMins < 60) return `${diffMins}m ago`
    
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays}d ago`
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Real-Time Signals</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Live trading signals from your bots
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-sm text-gray-500">
              Updated {formatTimeAgo(lastUpdated)}
            </span>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchSignals}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Today's Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{todayStats.totalTrades}</div>
            <div className="text-sm text-gray-600">Total Trades</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{todayStats.wins}</div>
            <div className="text-sm text-gray-600">Wins</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{todayStats.losses}</div>
            <div className="text-sm text-gray-600">Losses</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className={`text-2xl font-bold ${todayStats.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(todayStats.totalProfit)}
            </div>
            <div className="text-sm text-gray-600">Net Profit</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {formatPercentage(todayStats.winRate)}
            </div>
            <div className="text-sm text-gray-600">Win Rate</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Signals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-500" />
              Active Signals ({activeSignals.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activeSignals.length > 0 ? (
                activeSignals.map((signal) => (
                  <div key={signal.message_id} className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-3">
                      {getResultIcon(signal)}
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {signal.pair}
                        </div>
                        <div className="text-sm text-gray-500">
                          Entry: {signal.entry_time} • {signal.trade_duration}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {signal.direction === 'BUY' ? (
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-500" />
                      )}
                      {getStatusBadge(signal)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No active signals</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Completed Signals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-500" />
              Recent Results ({completedSignals.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {completedSignals.length > 0 ? (
                completedSignals.map((signal) => (
                  <div key={signal.message_id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      {getResultIcon(signal)}
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {signal.pair}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatTimeAgo(signal.received_at)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className={`font-bold ${signal.total_profit && signal.total_profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {signal.total_profit ? formatCurrency(signal.total_profit) : '-'}
                        </div>
                        {signal.payout_percent && (
                          <div className="text-xs text-gray-500">
                            {signal.payout_percent}
                          </div>
                        )}
                      </div>
                      {getStatusBadge(signal)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No completed signals</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}