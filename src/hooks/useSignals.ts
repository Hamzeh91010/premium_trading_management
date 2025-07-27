import { create } from 'zustand'
import { Signal } from '@/types'

interface SignalsState {
  signals: Signal[]
  isLoading: boolean
  fetchSignals: () => void
  addSignal: (signal: Signal) => void
}

const mockSignals: Signal[] = [
  {
    id: '1',
    pair: 'EURUSD',
    direction: 'call',
    timeframe: '1m',
    timestamp: new Date(Date.now() - 120000).toISOString(),
    source: 'Premium Signals',
    status: 'won',
    profit: 15.50,
    level: 1,
    botId: '1',
  },
  {
    id: '2',
    pair: 'GBPJPY',
    direction: 'put',
    timeframe: '5m',
    timestamp: new Date(Date.now() - 300000).toISOString(),
    source: 'VIP Channel',
    status: 'lost',
    profit: -10.00,
    level: 2,
    botId: '1',
  },
  {
    id: '3',
    pair: 'USDCAD',
    direction: 'call',
    timeframe: '1m',
    timestamp: new Date(Date.now() - 60000).toISOString(),
    source: 'Main Channel',
    status: 'active',
    level: 1,
    botId: '2',
  },
  {
    id: '4',
    pair: 'AUDUSD',
    direction: 'put',
    timeframe: '3m',
    timestamp: new Date().toISOString(),
    source: 'Premium Signals',
    status: 'active',
    level: 1,
    botId: '1',
  },
]

export const useSignals = create<SignalsState>((set, get) => ({
  signals: mockSignals,
  isLoading: false,
  fetchSignals: () => {
    set({ isLoading: true })
    setTimeout(() => {
      set({ signals: mockSignals, isLoading: false })
    }, 500)
  },
  addSignal: (signal: Signal) => {
    const { signals } = get()
    set({ signals: [signal, ...signals] })
  },
}))