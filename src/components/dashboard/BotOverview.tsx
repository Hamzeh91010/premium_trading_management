import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Play, Square, AlertTriangle } from 'lucide-react'
import { useBots } from '@/hooks/useBots'
import { getStatusColor, formatCurrency } from '@/lib/utils'

export function BotOverview() {
  const { bots, startBot, stopBot } = useBots()

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <Play className="w-3 h-3" />
      case 'stopped':
        return <Square className="w-3 h-3" />
      case 'error':
        return <AlertTriangle className="w-3 h-3" />
      default:
        return null
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bot Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {bots.map((bot) => (
            <div key={bot.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {getStatusIcon(bot.status)}
                  <span className="font-medium">{bot.name}</span>
                </div>
                <Badge className={getStatusColor(bot.status)}>
                  {bot.status}
                </Badge>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {formatCurrency(bot.profit)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {bot.winRate.toFixed(1)}% win rate
                  </p>
                </div>
                
                <div className="flex gap-1">
                  {bot.status === 'running' ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => stopBot(bot.id)}
                      className="h-8 w-8 p-0"
                    >
                      <Square className="w-3 h-3" />
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => startBot(bot.id)}
                      className="h-8 w-8 p-0"
                    >
                      <Play className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}