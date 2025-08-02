import { create } from 'zustand'

interface RealSignal {
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

interface RealSignalsState {
  signals: RealSignal[]
  isLoading: boolean
  lastUpdated: string | null
  fetchSignals: () => Promise<void>
  getActiveSignals: () => RealSignal[]
  getCompletedSignals: () => RealSignal[]
  getTodayStats: () => {
    totalTrades: number
    wins: number
    losses: number
    totalProfit: number
    winRate: number
  }
}

export const useRealSignals = create<RealSignalsState>((set, get) => ({
  signals: [],
  isLoading: false,
  lastUpdated: null,

  fetchSignals: async () => {
    set({ isLoading: true })
    try {
      const response = await fetch('/api/signals/all')
      const data = await response.json()
      const signals = data.results || []
      
      set({ 
        signals, 
        isLoading: false,
        lastUpdated: new Date().toISOString()
      })
    } catch (error) {
      console.error('Failed to fetch signals:', error)
      set({ isLoading: false })
    }
  },

  getActiveSignals: () => {
    const { signals } = get()
    return signals.filter(signal => 
      !signal.is_expired && 
      !signal.executed && 
      signal.result === null
    )
  },

  getCompletedSignals: () => {
    const { signals } = get()
    return signals.filter(signal => 
      signal.executed && 
      signal.result !== null
    )
  },

  getTodayStats: () => {
    const { signals } = get()
    const today = new Date().toISOString().split('T')[0]
    
    const todaySignals = signals.filter(signal => 
      signal.received_at.startsWith(today) && 
      signal.executed && 
      signal.result !== null
    )

    const wins = todaySignals.filter(s => s.result === 'win').length
    const losses = todaySignals.filter(s => s.result === 'loss').length
    const totalProfit = todaySignals.reduce((sum, s) => sum + (s.total_profit || 0), 0)
    const winRate = todaySignals.length > 0 ? (wins / todaySignals.length) * 100 : 0

    return {
      totalTrades: todaySignals.length,
      wins,
      losses,
      totalProfit,
      winRate
    }
  }
}))