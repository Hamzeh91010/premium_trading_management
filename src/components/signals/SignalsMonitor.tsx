import React, { useState } from 'react'
import { TradingSignalsTable } from './TradingSignalsTable'
import { CurrencyPairAnalytics } from './CurrencyPairAnalytics'
import { useRealSignals } from '@/hooks/useRealSignals'

// Mock data for demonstration
const mockSignals = [
  {
    pair: "AUD/JPY OTC",
    entry_time: "03:09",
    direction: "BUY" as const,
    trade_duration: "5 minutes",
    is_otc: true,
    is_expired: true,
    received_at: "2025-07-26 03:06:58",
    result: "win" as const,
    message_id: 410,
    raw_text: "🇦🇺 AUD/JPY OTC\n🕘 תוקף 5M\n⏺️ כניסה בשעה 03:09\n🟩 קנייה\n\n🔽 רמות מרטינגייל\nרמה 1 בשעה 03:14\nרמה 2 בשעה 03:19\nרמה 3 בשעה 03:24",
    martingale_times: ["03:14", "03:19", "03:24"],
    executed: true,
    end_time: "03:14",
    payout_percent: "+90%",
    total_profit: 9.0,
    total_staked: 10.0,
    base_amount: 10.0,
    trade_count: 1
  },
  {
    pair: "CAD/CHF OTC",
    entry_time: "03:10",
    direction: "SELL" as const,
    trade_duration: "5 minutes",
    is_otc: true,
    is_expired: true,
    received_at: "2025-07-26 03:08:34",
    result: "win" as const,
    message_id: 411,
    raw_text: "🇨🇦 CAD/CHF OTC\n🕘 תוקף 5M\n⏺️ כניסה בשעה 03:10\n🟥 מכירה\n\n🔽 רמות מרטינגייל\nרמה 1 בשעה 03:15\nרמה 2 בשעה 03:20\nרמה 3 בשעה 03:25",
    martingale_times: ["03:15", "03:20", "03:25"],
    executed: true,
    end_time: "03:15",
    payout_percent: "+91%",
    total_profit: 9.1,
    total_staked: 10.0,
    base_amount: 10.0,
    trade_count: 1
  },
  {
    pair: "CAD/CHF OTC",
    entry_time: "03:20",
    direction: "SELL" as const,
    trade_duration: "5 minutes",
    is_otc: true,
    is_expired: true,
    received_at: "2025-07-26 03:18:32",
    result: "win" as const,
    message_id: 412,
    raw_text: "🇨🇦 CAD/CHF OTC\n🕘 תוקף 5M\n⏺️ כניסה בשעה 03:20\n🟥 מכירה\n\n🔽 רמות מרטינגייל\nרמה 1 בשעה 03:25\nרמה 2 בשעה 03:30\nרמה 3 בשעה 03:35",
    martingale_times: ["03:25", "03:30", "03:35"],
    executed: true,
    end_time: "03:30",
    payout_percent: "+68%",
    total_profit: 9.7,
    total_staked: 38.99,
    base_amount: 10.0,
    trade_count: 2
  },
  {
    pair: "NZD/USD",
    entry_time: "13:38",
    direction: "BUY" as const,
    trade_duration: "5 minutes",
    is_otc: false,
    is_expired: false,
    received_at: "2025-07-26 13:36:16",
    result: null,
    message_id: 448,
    raw_text: "🇳🇿 NZD/USD\n🕘 תוקף 5M\n⏺️ כניסה בשעה 13:38\n🟩 קנייה\n\n🔽 רמות מרטינגייל\nרמה 1 בשעה 13:43\nרמה 2 בשעה 13:48\nרמה 3 בשעה 13:53",
    martingale_times: ["13:43", "13:48", "13:53"],
    executed: false
  },
  {
    pair: "EUR/USD",
    entry_time: "14:15",
    direction: "BUY" as const,
    trade_duration: "3 minutes",
    is_otc: false,
    is_expired: true,
    received_at: "2025-07-26 14:12:45",
    result: "loss" as const,
    message_id: 449,
    raw_text: "🇪🇺 EUR/USD\n🕘 תוקף 3M\n⏺️ כניסה בשעה 14:15\n🟩 קנייה",
    martingale_times: ["14:18", "14:21", "14:24"],
    executed: true,
    end_time: "14:18",
    payout_percent: "-100%",
    total_profit: -10.0,
    total_staked: 10.0,
    base_amount: 10.0,
    trade_count: 1
  },
  // Additional mock data for better visualization
  {
    pair: "GBP/USD",
    entry_time: "15:30",
    direction: "SELL" as const,
    trade_duration: "5 minutes",
    is_otc: false,
    is_expired: true,
    received_at: "2025-07-26 15:28:00",
    result: "win" as const,
    message_id: 450,
    raw_text: "🇬🇧 GBP/USD\n🕘 תוקף 5M\n⏺️ כניסה בשעה 15:30\n🟥 מכירה",
    martingale_times: ["15:35", "15:40", "15:45"],
    executed: true,
    end_time: "15:35",
    payout_percent: "+85%",
    total_profit: 8.5,
    total_staked: 10.0,
    base_amount: 10.0,
    trade_count: 1
  },
  {
    pair: "USD/JPY",
    entry_time: "16:45",
    direction: "BUY" as const,
    trade_duration: "3 minutes",
    is_otc: false,
    is_expired: true,
    received_at: "2025-07-26 16:42:30",
    result: "win" as const,
    message_id: 451,
    raw_text: "🇺🇸 USD/JPY\n🕘 תוקף 3M\n⏺️ כניסה בשעה 16:45\n🟩 קנייה",
    martingale_times: ["16:48", "16:51", "16:54"],
    executed: true,
    end_time: "16:48",
    payout_percent: "+88%",
    total_profit: 8.8,
    total_staked: 10.0,
    base_amount: 10.0,
    trade_count: 1
  }
]

export function SignalsMonitor() {
  const { signals, fetchSignals } = useRealSignals()
  
  React.useEffect(() => {
    fetchSignals()
  }, [fetchSignals])

  // Use real signals if available, otherwise fall back to mock data
  const displaySignals = signals.length > 0 ? signals : mockSignals

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