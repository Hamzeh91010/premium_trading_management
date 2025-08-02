import React from 'react'
import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export interface TradingSignal {
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
  payout_percent?: number
  total_profit?: number
  total_staked?: number
  base_amount?: number
  trade_count?: number
}

interface TradingSignalsListProps {
  maxItems?: number
}

export function TradingSignalsList({ maxItems = 10 }: TradingSignalsListProps) {
  const [signals, setSignals] = useState<TradingSignal[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchSignalsFromDatabase = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/signals/all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `SELECT * FROM all_signals WHERE is_status = 'completed' ORDER BY received_at DESC LIMIT ${maxItems}`
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        setSignals(data.results || [])
      } else {
        console.error('Database API not available')
        setSignals([])
      }
    } catch (error) {
      console.error('Error fetching signals:', error)
      setSignals([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSignalsFromDatabase()
    
    // Auto-refresh every 5 seconds
    const interval = setInterval(fetchSignalsFromDatabase, 5000)
    
    return () => clearInterval(interval)
  }, [maxItems])

  const displaySignals = signals.slice(0, maxItems)

  const getDirectionBadge = (direction: 'BUY' | 'SELL') => {
    if (direction === 'BUY') {
      return (
        <Badge className="bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30">
          CALL
        </Badge>
      )
    } else {
      return (
        <Badge className="bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30">
          PUT
        </Badge>
      )
    }
  }

  const getResultBadge = (result: 'win' | 'loss' | null, executed: boolean) => {
    if (!executed) {
      return (
        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
          pending
        </Badge>
      )
    }
    
    if (result === 'win') {
      return (
        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
          win
        </Badge>
      )
    } else if (result === 'loss') {
      return (
        <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
          lost
        </Badge>
      )
    }
    
    return (
      <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">
        expired
      </Badge>
    )
  }

  const getResultIcon = (result: 'win' | 'loss' | null, executed: boolean) => {
    if (!executed) return <Clock className="w-4 h-4 text-blue-400" />
    if (result === 'win') return <CheckCircle className="w-4 h-4 text-green-400" />
    if (result === 'loss') return <XCircle className="w-4 h-4 text-red-400" />
    return <AlertCircle className="w-4 h-4 text-gray-400" />
  }

  const getProfitColor = (profit?: number) => {
    if (profit === undefined) return 'text-gray-400'
    return profit >= 0 ? 'text-green-400' : 'text-red-400'
  }

  const formatTimeAgo = (receivedAt: string) => {
    try {
      const now = new Date()
      const received = new Date(receivedAt)
      const diffMs = now.getTime() - received.getTime()
      const diffMins = Math.floor(diffMs / (1000 * 60))
      
      if (diffMins < 1) return 'now'
      if (diffMins < 60) return `${diffMins} min ago`
      
      const diffHours = Math.floor(diffMins / 60)
      if (diffHours < 24) return `${diffHours}h ago`
      
      const diffDays = Math.floor(diffHours / 24)
      return `${diffDays}d ago`
    } catch {
      return 'unknown'
    }
  }

  return (
    <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
      <CardContent className="p-0">
        <div className="space-y-0">
          {displaySignals.map((signal, index) => (
            <div
              key={signal.message_id}
              className={`flex items-center justify-between p-4 hover:bg-gray-700/30 transition-colors duration-200 ${
                index !== displaySignals.length - 1 ? 'border-b border-gray-700/30' : ''
              }`}
            >
              {/* Left Section - Pair and Direction */}
              <div className="flex items-center gap-4 flex-1">
                <div className="flex items-center gap-2">
                  {getResultIcon(signal.result, signal.executed)}
                  <div>
                    <div className="font-semibold text-white text-lg">
                      {signal.pair.replace(' OTC', '')}
                      {signal.is_otc && (
                        <span className="ml-2 text-xs text-purple-400 bg-purple-500/20 px-2 py-0.5 rounded">
                          OTC
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-400">
                      Entry: {signal.entry_time} • {signal.trade_duration}
                    </div>
                  </div>
                </div>
                
                {/* Direction Badge */}
                <div className="flex items-center gap-2">
                  {signal.direction === 'BUY' ? (
                    <TrendingUp className="w-4 h-4 text-green-400" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-400" />
                  )}
                  {getDirectionBadge(signal.direction)}
                </div>
              </div>

              {/* Middle Section - Status */}
              <div className="flex items-center gap-3">
                {getResultBadge(signal.result, signal.executed)}
                
                {/* Martingale Level */}
                {signal.trade_count && signal.trade_count > 1 && (
                  <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                    L{signal.trade_count}
                  </Badge>
                )}
              </div>

              {/* Right Section - Profit and Time */}
              <div className="text-right flex-shrink-0 min-w-[120px]">
                <div className={`font-bold text-lg ${getProfitColor(signal.total_profit)}`}>
                  {signal.total_profit !== undefined ? formatCurrency(signal.total_profit) : '-'}
                </div>
                <div className="text-sm text-gray-400">
                  {formatTimeAgo(signal.received_at)}
                </div>
                {signal.payout_percent && (
                  <div className="text-xs text-gray-500 mt-1">
                    {signal.payout_percent}%
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Show more indicator if there are more signals */}
        {signals.length > maxItems && !isLoading && (
          <div className="p-4 text-center border-t border-gray-700/30">
            <div className="text-sm text-gray-400">
              Showing {maxItems} of {signals.length} signals
            </div>
          </div>
        )}

        {/* Empty state */}
        {signals.length === 0 && !isLoading && (
          <div className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <div className="text-gray-400">No trading signals available</div>
          </div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <div className="text-gray-400">Loading trading signals...</div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}