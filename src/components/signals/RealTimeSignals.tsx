import React, { useEffect, useState } from 'react'
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
import { formatCurrency, formatPercentage } from '@/lib/utils'

interface DatabaseSignal {
  id: number
  pair: string
  direction: 'BUY' | 'SELL'
  entry_time: string
  trade_duration: string
  is_status: 'processing' | 'completed'
  result?: 'win' | 'loss'
  profit?: number
  payout_percent?: string
  received_at: string
  trade_count?: number
  total_profit?: number
  total_staked?: number
}

interface TodayStats {
  totalTrades: number
  wins: number
  losses: number
  totalProfit: number
  winRate: number
}

export function RealTimeSignals() {
  const [activeSignals, setActiveSignals] = useState<DatabaseSignal[]>([])
  const [recentResults, setRecentResults] = useState<DatabaseSignal[]>([])
  const [todayStats, setTodayStats] = useState<TodayStats>({
    totalTrades: 0,
    wins: 0,
    losses: 0,
    totalProfit: 0,
    winRate: 0
  })
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)

  const fetchActiveSignals = async () => {
    try {
      // Fetch active signals from today_signals table where is_status = 'processing'
      const response = await fetch('/api/signals/active', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: "SELECT * FROM today_signals WHERE is_status = 'processing' ORDER BY received_at DESC"
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        setActiveSignals(data.results || [])
      } else {
        // Fallback to mock data if API is not available
        console.log('API not available, using mock data for active signals')
      }
    } catch (error) {
      console.log('Error fetching active signals:', error)
    }
  }

  const fetchRecentResults = async () => {
    try {
      // Fetch recent completed signals from all_signals table where is_status = 'completed'
      const response = await fetch('/api/signals/recent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: "SELECT * FROM all_signals WHERE is_status = 'completed' ORDER BY received_at DESC LIMIT 10"
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        setRecentResults(data.results || [])
      } else {
        // Fallback to mock data if API is not available
        console.log('API not available, using mock data for recent results')
      }
    } catch (error) {
      console.log('Error fetching recent results:', error)
    }
  }

  const fetchTodayStats = async () => {
    try {
      // Fetch today's statistics from all_signals table
      const response = await fetch('/api/signals/today-stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            SELECT 
              COUNT(*) as totalTrades,
              SUM(CASE WHEN result = 'win' THEN 1 ELSE 0 END) as wins,
              SUM(CASE WHEN result = 'loss' THEN 1 ELSE 0 END) as losses,
              SUM(COALESCE(total_profit, 0)) as totalProfit
            FROM all_signals 
            WHERE DATE(received_at) = DATE('now') AND is_status = 'completed'
          `
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        const stats = data.results?.[0]
        if (stats) {
          const winRate = stats.totalTrades > 0 ? (stats.wins / stats.totalTrades) * 100 : 0
          setTodayStats({
            totalTrades: stats.totalTrades || 0,
            wins: stats.wins || 0,
            losses: stats.losses || 0,
            totalProfit: stats.totalProfit || 0,
            winRate
          })
        }
      } else {
        // Fallback to mock data if API is not available
        console.log('API not available, using mock data for today stats')
      }
    } catch (error) {
      console.log('Error fetching today stats:', error)
    }
  }

  const fetchAllData = async () => {
    setIsLoading(true)
    try {
      await Promise.all([
        fetchActiveSignals(),
        fetchRecentResults(),
        fetchTodayStats()
      ])
      setLastUpdated(new Date().toISOString())
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Initial fetch
    fetchAllData()
    
    // Set up auto-refresh every 5 seconds
    const interval = setInterval(fetchAllData, 5000)
    
    return () => clearInterval(interval)
  }, [])

  const getStatusBadge = (signal: DatabaseSignal) => {
    if (signal.is_status === 'processing') {
      return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Active</Badge>
    }
    if (signal.result === 'win') {
      return <Badge className="bg-green-100 text-green-800 border-green-200">Won</Badge>
    }
    if (signal.result === 'loss') {
      return <Badge className="bg-red-100 text-red-800 border-red-200">Lost</Badge>
    }
    return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Completed</Badge>
  }

  const getResultIcon = (signal: DatabaseSignal) => {
    if (signal.is_status === 'processing') {
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
            Live trading signals from your database
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
            onClick={fetchAllData}
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
                  <div key={signal.id} className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
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

        {/* Recent Results */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-500" />
              Recent Results ({recentResults.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentResults.length > 0 ? (
                recentResults.map((signal) => (
                  <div key={signal.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
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
                  <p>No recent results</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}