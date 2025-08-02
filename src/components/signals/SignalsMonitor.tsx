import React, { useState } from 'react'
import { TradingSignalsTable } from './TradingSignalsTable'
import { CurrencyPairAnalytics } from './CurrencyPairAnalytics'
import { TradingSignal } from './TradingSignalsTable'

export function SignalsMonitor() {
  const [allSignals, setAllSignals] = useState<TradingSignal[]>([])
  const [isLoading, setIsLoading] = useState(false)
  
  React.useEffect(() => {
    const loadAllSignals = async () => {
      setIsLoading(true)
      try {
        // Fetch all signals from ForexSignals.db all_signals table
        const response = await fetch('/api/signals/all', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: "SELECT * FROM all_signals ORDER BY received_at DESC"
          })
        })
        
        if (response.ok) {
          const data = await response.json()
          const signals = data.results || []
          
          // Transform database data to match TradingSignal interface
          const transformedSignals = signals.map((signal: any) => ({
            pair: signal.pair || '',
            entry_time: signal.entry_time || '',
            direction: signal.direction || 'BUY',
            trade_duration: signal.trade_duration || '',
            is_otc: Boolean(signal.is_otc),
            is_expired: signal.is_status === 'expired',
            received_at: signal.received_at || '',
            result: signal.trading_result || null,
            message_id: signal.message_id || 0,
            raw_text: signal.raw_text || '',
            martingale_times: signal.martingale_times ? 
              (typeof signal.martingale_times === 'string' ? 
                JSON.parse(signal.martingale_times) : signal.martingale_times) : [],
            executed: Boolean(signal.is_executed),
            end_time: signal.end_time || undefined,
            payout_percent: signal.payout_percent || undefined,
            total_profit: signal.total_profit || undefined,
            total_staked: signal.total_staked || undefined,
            base_amount: signal.base_amount || undefined,
            trade_count: signal.trade_level || 1
          }))
          
          setAllSignals(transformedSignals)
          console.log(`Loaded ${transformedSignals.length} signals from ForexSignals.db`)
        } else {
          console.error('Failed to fetch signals from database')
          setAllSignals([])
        }
      } catch (error) {
        console.error('Error loading signals from ForexSignals.db:', error)
        setAllSignals([])
      } finally {
        setIsLoading(false)
      }
    }
    
    loadAllSignals()
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadAllSignals, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const displaySignals = allSignals

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Signals Monitor</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Real-time monitoring of trading signals from ForexSignals.db ({displaySignals.length} signals)
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-3"></div>
          <span className="text-gray-600 dark:text-gray-400">Loading signals from database...</span>
        </div>
      ) : (
        <>
          <CurrencyPairAnalytics signals={displaySignals} />
          <TradingSignalsTable />
        </>
      )}
    </div>
  )
}

      <TradingSignalsTable />
    </div>
  )
}