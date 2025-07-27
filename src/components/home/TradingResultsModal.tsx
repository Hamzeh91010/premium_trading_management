import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { X, TrendingUp, TrendingDown, DollarSign, Target, Activity, Zap } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts'
import { formatCurrency, formatPercentage } from '@/lib/utils'
import { TradingSignalsList } from '@/components/signals/TradingSignalsList'

interface TradingResultsModalProps {
  isOpen: boolean
  onClose: () => void
}

const TradingResultsModal: React.FC<TradingResultsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null

  const profitData = [
    { time: '9:00', profit: 0 },
    { time: '10:00', profit: 150 },
    { time: '11:00', profit: 280 },
    { time: '12:00', profit: 420 },
    { time: '13:00', profit: 380 },
    { time: '14:00', profit: 650 },
    { time: '15:00', profit: 847 }
  ]

  const winLossData = [
    { name: 'Wins', value: 78, color: '#10B981' },
    { name: 'Losses', value: 22, color: '#EF4444' }
  ]

  const pairPerformance = [
    { pair: 'EURUSD', profit: 450, trades: 25 },
    { pair: 'GBPJPY', profit: 320, trades: 18 },
    { pair: 'USDCAD', profit: 280, trades: 22 },
    { pair: 'AUDUSD', profit: 190, trades: 15 }
  ]

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-xl border border-gray-700 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <>
            <div>
              <h2 className="text-2xl font-bold text-white">Trading Results</h2>
              <p className="text-gray-400">Your trading performance overview</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-gray-400 hover:text-white hover:bg-gray-800"
            >
              <X className="w-5 h-5" />
            </Button>
          </>
        </div>

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
              <div className="space-y-0">
                {[
                  {
                    pair: "USD/CNH OTC",
                    direction: "BUY" as const,
                    result: "win" as const,
                    profit: 8.8,
                    time: "2 min ago",
                    payout: "+88%"
                  },
                  {
                    pair: "AUD/CAD OTC", 
                    direction: "BUY" as const,
                    result: "win" as const,
                    profit: 9.2,
                    time: "5 min ago",
                    payout: "+92%"
                  },
                  {
                    pair: "EURUSD",
                    direction: "SELL" as const,
                    result: "win" as const,
                    profit: 25.50,
                    time: "8 min ago",
                    payout: "+85%"
                  },
                  {
                    pair: "GBPJPY",
                    direction: "BUY" as const,
                    result: "loss" as const,
                    profit: -10.00,
                    time: "12 min ago",
                    payout: "-100%"
                  }
                ].map((signal, index) => (
                  <TradingSignalsList key={index} signals={[signal]} />
                ))}
              </div>
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
                    <p className="text-xl font-bold text-green-400">$2,847.50</p>
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
                    <p className="text-xl font-bold text-blue-400">78.5%</p>
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
                    <p className="text-xl font-bold text-purple-400">127</p>
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
                    <p className="text-xl font-bold text-amber-400">3</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Profit Chart */}
            <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  Profit Timeline
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
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-300">Wins (78%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-sm text-gray-300">Losses (22%)</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pair Performance */}
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
                    <XAxis dataKey="pair" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
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
                    <Bar dataKey="profit" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Recent Trades */}
          <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Recent Trades</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { pair: 'EURUSD', direction: 'CALL', profit: 25.50, time: '2 min ago', status: 'won' },
                  { pair: 'GBPJPY', direction: 'PUT', profit: -10.00, time: '5 min ago', status: 'lost' },
                  { pair: 'USDCAD', direction: 'CALL', profit: 18.75, time: '8 min ago', status: 'won' },
                  { pair: 'AUDUSD', direction: 'PUT', profit: 22.00, time: '12 min ago', status: 'won' },
                ].map((trade, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="font-medium text-white">{trade.pair}</div>
                      <Badge 
                        variant="outline" 
                        className={trade.direction === 'CALL' ? 'border-green-500 text-green-400' : 'border-red-500 text-red-400'}
                      >
                        {trade.direction}
                      </Badge>
                      <Badge 
                        className={trade.status === 'won' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}
                      >
                        {trade.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`font-medium ${trade.profit > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {formatCurrency(trade.profit)}
                      </span>
                      <span className="text-sm text-gray-400">{trade.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

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
      </div>
    </div>
  )
}

export default TradingResultsModal