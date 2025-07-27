import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Play, 
  Square, 
  RotateCcw, 
  Settings, 
  AlertTriangle,
  TrendingUp,
  Clock,
  DollarSign
} from 'lucide-react'
import { useBots } from '@/hooks/useBots'
import { getStatusColor, formatCurrency, formatPercentage } from '@/lib/utils'

export function BotControlCenter() {
  const { bots, startBot, stopBot } = useBots()
  const [selectedBot, setSelectedBot] = useState<string | null>(null)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <Play className="w-4 h-4" />
      case 'stopped':
        return <Square className="w-4 h-4" />
      case 'error':
        return <AlertTriangle className="w-4 h-4" />
      default:
        return null
    }
  }

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Bot Control Center</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage and monitor your automated trading bots
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {bots.map((bot) => (
          <Card 
            key={bot.id} 
            className={`hover:shadow-lg transition-all duration-200 cursor-pointer ${
              selectedBot === bot.id ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => setSelectedBot(selectedBot === bot.id ? null : bot.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{bot.name}</CardTitle>
                <Badge className={getStatusColor(bot.status)}>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(bot.status)}
                    <span className="capitalize">{bot.status}</span>
                  </div>
                </Badge>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Created {new Date(bot.createdAt).toLocaleDateString()}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {formatCurrency(bot.profit)}
                  </div>
                  <div className="text-xs text-gray-500">Total Profit</div>
                </div>

                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {formatPercentage(bot.winRate)}
                  </div>
                  <div className="text-xs text-gray-500">Win Rate</div>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Base Amount:</span>
                  <span className="font-medium">{formatCurrency(bot.baseAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Payout:</span>
                  <span className="font-medium">{bot.payoutPercentage}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Total Trades:</span>
                  <span className="font-medium">{bot.totalTrades}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Uptime:</span>
                  <span className="font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatUptime(bot.uptime)}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                  Assigned Channels
                </div>
                <div className="flex flex-wrap gap-1">
                  {bot.assignedChannels.map((channel) => (
                    <Badge key={channel} variant="outline" className="text-xs">
                      {channel}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                {bot.status === 'running' ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation()
                      stopBot(bot.id)
                    }}
                    className="flex-1"
                  >
                    <Square className="w-4 h-4 mr-1" />
                    Stop
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      startBot(bot.id)
                    }}
                    className="flex-1"
                  >
                    <Play className="w-4 h-4 mr-1" />
                    Start
                  </Button>
                )}
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation()
                    // Restart logic would go here
                  }}
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation()
                    // Settings logic would go here
                  }}
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </div>

              {selectedBot === bot.id && (
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                    Configuration Details
                  </div>
                  <div className="space-y-1 text-xs text-blue-800 dark:text-blue-200">
                    <div>Strategy: {bot.config.strategy}</div>
                    <div>Risk Level: {bot.config.riskLevel}</div>
                    <div>Max Drawdown: {bot.config.maxDrawdown}%</div>
                    <div>Martingale Levels: {bot.config.martingaleLevels}</div>
                    <div>Timeframe: {bot.config.timeframe}</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}