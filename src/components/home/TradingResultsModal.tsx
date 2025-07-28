import React from 'react'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { X, TrendingUp, TrendingDown, DollarSign, Target, Activity, Zap } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts'
import { formatCurrency, formatPercentage } from '@/lib/utils'
import { TradingSignalsList } from '@/components/signals/TradingSignalsList'

interface TradingSignal {
  pair: string
  entry_time: string
  direction: 'BUY' | 'SELL'
  trade_duration: string
  is_otc: boolean
  is_expired: boolean
  received_at: string
  result: 'win' | 'loss' | null
  message_id: number
  raw_text: string
  martingale_times: string[]
  executed: boolean
  end_time?: string
  payout_percent?: string
  total_profit?: number
  total_staked?: number
  base_amount?: number
  trade_count?: number
}

interface TradingResultsModalProps {
  isOpen: boolean
  onClose: () => void
}

const TradingResultsModal: React.FC<TradingResultsModalProps> = ({ isOpen, onClose }) => {
  const [signals, setSignals] = useState<TradingSignal[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalProfit: 0,
    winRate: 0,
    totalTrades: 0,
    activeBots: 3
  })

  useEffect(() => {
    if (isOpen) {
      fetchSignalsData()
    }
  }, [isOpen])

  const fetchSignalsData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/ALLSignals.json')
      if (response.ok) {
        const data: TradingSignal[] = await response.json()
        setSignals(data)
        calculateStats(data)
      } else {
        console.error('Failed to fetch signals data')
      }
    } catch (error) {
      console.error('Error fetching signals:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (signalsData: TradingSignal[]) => {
    const executedSignals = signalsData.filter(s => s.executed && s.result !== null)
    const wins = executedSignals.filter(s => s.result === 'win').length
    const totalProfit = executedSignals.reduce((sum, s) => sum + (s.total_profit || 0), 0)
    const winRate = executedSignals.length > 0 ? (wins / executedSignals.length) * 100 : 0

    setStats({
      totalProfit,
      winRate,
      totalTrades: executedSignals.length,
      activeBots: 3
    })
  }

  const getRecentSignals = () => {
    return signals
      .filter(s => s.executed && s.result !== null)
      .sort((a, b) => new Date(b.received_at).getTime() - new Date(a.received_at).getTime())
      .slice(0, 10)
  }

  const getProfitData = () => {
    const executedSignals = signals.filter(s => s.executed && s.result !== null)
    const dailyProfits = new Map<string, number>()
    
    executedSignals.forEach(signal => {
      const date = signal.received_at.split(' ')[0]
      const profit = signal.total_profit || 0
      dailyProfits.set(date, (dailyProfits.get(date) || 0) + profit)
    })

    return Array.from(dailyProfits.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-7) // Last 7 days
      .map(([date, profit], index) => ({
        time: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        profit: Math.round(profit * 100) / 100
      }))
  }

  const getWinLossData = () => {
    const executedSignals = signals.filter(s => s.executed && s.result !== null)
    const wins = executedSignals.filter(s => s.result === 'win').length
    const losses = executedSignals.length - wins
    const winRate = executedSignals.length > 0 ? (wins / executedSignals.length) * 100 : 0
    const lossRate = 100 - winRate

    return [
      { name: 'Wins', value: Math.round(winRate), color: '#10B981' },
      { name: 'Losses', value: Math.round(lossRate), color: '#EF4444' }
    ]
  }

  const getPairPerformance = () => {
    const pairStats = new Map<string, { profit: number, trades: number }>()
    
    signals.filter(s => s.executed && s.result !== null).forEach(signal => {
      const pair = signal.pair.replace(' OTC', '')
      const current = pairStats.get(pair) || { profit: 0, trades: 0 }
      current.profit += signal.total_profit || 0
      current.trades += 1
      pairStats.set(pair, current)
    })

    return Array.from(pairStats.entries())
      .map(([pair, stats]) => ({
        pair,
        profit: Math.round(stats.profit * 100) / 100,
        trades: stats.trades
      }))
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 6)
  }

  if (!isOpen) return null

  const profitData = getProfitData()
  const winLossData = getWinLossData()
  const pairPerformance = getPairPerformance()
  const recentSignals = getRecentSignals()

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-xl border border-gray-700 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 z-10 bg-gray-900 flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-white">Trading Results</h2>
            <p className="text-gray-400">
              {loading ? 'Loading...' : `Your trading performance overview (${signals.length} total signals)`}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-gray-400 hover:text-white hover:bg-gray-800"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading trading data...</p>
          </div>
        ) : (
          <div className="p-6 space-y-6">
          {/* Recent Trading Signals */}
          <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-400" />
                Recent Trading Signals
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {recentSignals.length > 0 ? (
                <TradingSignalsList signals={recentSignals} maxItems={10} />
              ) : (
                <div className="p-8 text-center text-gray-400">
                  No trading signals found
                </div>
              )}
            </CardContent>
          </Card>

          {/* Key Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Total Profit</p>
                    <p className={`text-xl font-bold ${stats.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {formatCurrency(stats.totalProfit)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <Target className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Win Rate</p>
                    <p className="text-xl font-bold text-blue-400">{formatPercentage(stats.winRate)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <Activity className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Total Trades</p>
                    <p className="text-xl font-bold text-purple-400">{stats.totalTrades}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
                    <Zap className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Active Bots</p>
                    <p className="text-xl font-bold text-amber-400">{stats.activeBots}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Grid */}
          {profitData.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Profit Chart */}
            <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  Daily Profit Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={profitData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="time" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: '#1F2937',
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#F9FAFB'
                        }}
                        formatter={(value) => [`$${value}`, 'Profit']}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="profit" 
                        stroke="#10B981" 
                        strokeWidth={3}
                        dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Win/Loss Pie Chart */}
            <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-400" />
                  Win/Loss Ratio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={winLossData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {winLossData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: '#1F2937',
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#F9FAFB'
                        }}
                        formatter={(value) => [`${value}%`, 'Percentage']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-4 mt-4">
                  {winLossData.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span className="text-sm text-gray-300">{item.name} ({item.value}%)</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            </div>
          )}

          {pairPerformance.length > 0 && (
            <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-purple-400" />
                  Currency Pair Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={pairPerformance}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis 
                        dataKey="pair" 
                        stroke="#9CA3AF"
                        tick={{ fontSize: 10 }}
                        angle={-45}
                        textAnchor="end"
                        height={40}
                      />
                      <YAxis stroke="#9CA3AF" tick={{ fontSize: 10 }} />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: '#1F2937',
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#F9FAFB'
                        }}
                        formatter={(value, name) => [
                          name === 'profit' ? `$${value}` : value,
                          name === 'profit' ? 'Profit' : 'Trades'
                        ]}
                      />
                      <Bar dataKey="profit" radius={[4, 4, 0, 0]}>
                        {pairPerformance.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.profit >= 0 ? '#10B981' : '#EF4444'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 pt-4">
            <Button 
              onClick={onClose}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8"
            >
              Go to Dashboard
            </Button>
            <Button 
              variant="outline" 
              onClick={onClose}
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              View Full Report
            </Button>
          </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TradingResultsModal