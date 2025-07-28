import React, { useState } from 'react'
import { TradingSignalsTable } from './TradingSignalsTable'
import { CurrencyPairAnalytics } from './CurrencyPairAnalytics'
import { useRealSignals } from '@/hooks/useRealSignals'
import { TradingSignal } from './TradingSignalsTable'

export function SignalsMonitor() {
  const { signals, fetchSignals } = useRealSignals()
  const [allSignals, setAllSignals] = useState<TradingSignal[]>([])
  
  React.useEffect(() => {
    const loadAllSignals = async () => {
      try {
        const response = await fetch('/ALLSignals.json')
        if (response.ok) {
          const data: TradingSignal[] = await response.json()
          setAllSignals(data)
        }
      } catch (error) {
        console.error('Error loading signals:', error)
      }
    }
    
    loadAllSignals()
    fetchSignals()
  }, [fetchSignals])

  // Use all signals from JSON file
  const displaySignals = allSignals.length > 0 ? allSignals : signals

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Signals Monitor</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Real-time monitoring of trading signals and their performance
        </p>
      </div>

      <CurrencyPairAnalytics signals={displaySignals} />

      <TradingSignalsTable />
    </div>
  )
}