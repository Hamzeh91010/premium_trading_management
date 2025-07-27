import React, { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line } from 'recharts'
import { TrendingUp, TrendingDown, Target, Activity, DollarSign, Percent } from 'lucide-react'
import { formatCurrency, formatPercentage } from '@/lib/utils'

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

interface CurrencyPairAnalyticsProps {
  signals: TradingSignal[]
}

const COLORS = [
  '#4F46E5', // Indigo
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Violet
  '#06B6D4', // Cyan
  '#F97316', // Orange
  '#84CC16', // Lime
  '#EC4899', // Pink
  '#64748B', // Slate
]

export function CurrencyPairAnalytics({ signals }: CurrencyPairAnalyticsProps) {
  const analytics = useMemo(() => {
    const pairStats = new Map<string, {
      count: number
      wins: number
      losses: number
      totalProfit: number
      totalStaked: number
      avgProfit: number
      winRate: number
    }>()

    // Process signals to calculate statistics
    signals.forEach(signal => {
      const pair = signal.pair
      const current = pairStats.get(pair) || {
        count: 0,
        wins: 0,
        losses: 0,
        totalProfit: 0,
        totalStaked: 0,
        avgProfit: 0,
        winRate: 0
      }

      current.count++
      
      if (signal.result === 'win') {
        current.wins++
      } else if (signal.result === 'loss') {
        current.losses++
      }

      if (signal.total_profit !== undefined) {
        current.totalProfit += signal.total_profit
      }
      
      if (signal.total_staked !== undefined) {
        current.totalStaked += signal.total_staked
      }

      pairStats.set(pair, current)
    })

    // Calculate derived metrics
    const pairData = Array.from(pairStats.entries()).map(([pair, stats]) => {
      const completedTrades = stats.wins + stats.losses
      const winRate = completedTrades > 0 ? (stats.wins / completedTrades) * 100 : 0
      const avgProfit = stats.count > 0 ? stats.totalProfit / stats.count : 0
      
      return {
        pair,
        count: stats.count,
        wins: stats.wins,
        losses: stats.losses,
        totalProfit: stats.totalProfit,
        totalStaked: stats.totalStaked,
        winRate,
        avgProfit,
        percentage: (stats.count / signals.length) * 100
      }
    }).sort((a, b) => b.count - a.count)

    // Prepare chart data
    const pieChartData = pairData.map((item, index) => ({
      name: item.pair,
      value: item.count,
      percentage: item.percentage,
      color: COLORS[index % COLORS.length]
    }))

    const profitChartData = pairData.map(item => ({
      pair: item.pair.replace(' OTC', ''),
      profit: item.totalProfit,
      winRate: item.winRate,
      trades: item.count
    }))

    const winRateData = pairData.map(item => ({
      pair: item.pair.replace(' OTC', ''),
      winRate: item.winRate,
      wins: item.wins,
      losses: item.losses
    }))

    return {
      pairData,
      pieChartData,
      profitChartData,
      winRateData,
      totalTrades: signals.length,
      totalProfit: pairData.reduce((sum, item) => sum + item.totalProfit, 0),
      avgWinRate: pairData.reduce((sum, item) => sum + item.winRate, 0) / pairData.length || 0
    }
  }, [signals])

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 dark:text-white">{data.name || label}</p>
          <p className="text-sm text-blue-600">
            Trades: {data.value || data.trades} ({data.percentage?.toFixed(1)}%)
          </p>
          {data.profit !== undefined && (
            <p className={`text-sm ${data.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              Profit: {formatCurrency(data.profit)}
            </p>
          )}
          {data.winRate !== undefined && (
            <p className="text-sm text-purple-600">
              Win Rate: {data.winRate.toFixed(1)}%
            </p>
          )}
        </div>
      )
    }
    return null
  }

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percentage }: any) => {
    if (percentage < 8) return null // Don't show labels for small slices
    
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.6
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize="14"
        fontWeight="bold"
        style={{ 
          textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
          filter: 'drop-shadow(0px 1px 2px rgba(0,0,0,0.8))'
        }}
      >
        {`${percentage.toFixed(0)}%`}
      </text>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">
      {/* Currency Pair Distribution - Pie Chart */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-500" />
            Currency Pair Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics.pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={90}
                  innerRadius={20}
                  fill="#8884d8"
                  dataKey="value"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth={2}
                >
                  {analytics.pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          {/* Legend */}
          <div className="mt-4 space-y-2">
            {analytics.pieChartData.slice(0, 5).map((item, index) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="font-medium">{item.name}</span>
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  {item.value} ({item.percentage.toFixed(1)}%)
                </div>
              </div>
            ))}
            {analytics.pieChartData.length > 5 && (
              <div className="text-xs text-gray-500 text-center pt-2">
                +{analytics.pieChartData.length - 5} more pairs
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Profit by Currency Pair - Bar Chart */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-500" />
            Profit by Currency Pair
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.profitChartData.slice(0, 6)} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="pair" 
                  tick={{ fontSize: 10 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="profit" 
                  radius={[2, 2, 0, 0]}
                >
                  {analytics.profitChartData.slice(0, 6).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.profit >= 0 ? '#10B981' : '#EF4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          {/* Currency Pair List ordered by profit */}
          <div className="mt-4 space-y-2">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Currency Pairs by Profit
            </h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {analytics.profitChartData
                .sort((a, b) => b.profit - a.profit)
                .slice(0, 8)
                .map((pair, index) => (
                  <div key={pair.pair} className="flex items-center justify-between py-2 px-3 bg-gray-100 dark:bg-gray-700/30 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700/50 transition-colors">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex items-center gap-2 min-w-[60px]">
                        <span className="text-gray-500 text-xs font-medium w-6 text-center">#{index + 1}</span>
                        <div className={`w-3 h-3 rounded-full ${pair.profit >= 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                      </div>
                      <div className="flex items-center gap-3 flex-1">
                        <span className="font-semibold text-gray-900 dark:text-white min-w-[80px]">
                          {pair.pair}
                        </span>
                        <span className="text-xs text-gray-500 bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded-full">
                          {pair.trades} trades
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 min-w-[100px] justify-end">
                      <span className={`font-bold text-lg ${pair.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(pair.profit)}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Win Rate by Currency Pair - Line Chart */}
      <Card className="lg:col-span-2 xl:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Percent className="w-5 h-5 text-purple-500" />
            Win Rate by Pair
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.winRateData.slice(0, 6)}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="pair" 
                  tick={{ fontSize: 10 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  tick={{ fontSize: 10 }}
                  domain={[0, 100]}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="winRate" 
                  stroke="#8B5CF6" 
                  strokeWidth={3}
                  dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#8B5CF6', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      <Card className="lg:col-span-2 xl:col-span-3">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-500" />
            Trading Summary by Currency Pair
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {analytics.pairData.slice(0, 10).map((pair, index) => (
              <div 
                key={pair.pair}
                className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <h4 className="font-medium text-sm text-gray-900 dark:text-white truncate">
                    {pair.pair}
                  </h4>
                </div>
                
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Trades:</span>
                    <span className="font-medium">{pair.count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Share:</span>
                    <span className="font-medium">{pair.percentage.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Win Rate:</span>
                    <span className={`font-medium ${pair.winRate >= 50 ? 'text-green-600' : 'text-red-600'}`}>
                      {pair.winRate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Profit:</span>
                    <span className={`font-medium ${pair.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(pair.totalProfit)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">W/L:</span>
                    <span className="font-medium text-xs">
                      <span className="text-green-600">{pair.wins}</span>
                      /
                      <span className="text-red-600">{pair.losses}</span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}