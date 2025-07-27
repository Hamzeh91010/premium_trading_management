import { create } from 'zustand'
import { Bot } from '@/types'

interface BotsState {
  bots: Bot[]
  selectedBot: Bot | null
  isLoading: boolean
  fetchBots: () => void
  selectBot: (bot: Bot) => void
  updateBot: (id: string, updates: Partial<Bot>) => void
  startBot: (id: string) => void
  stopBot: (id: string) => void
}

const mockBots: Bot[] = [
  {
    id: '1',
    name: 'Scalper Pro',
    status: 'running',
    uptime: 86400,
    baseAmount: 10,
    payoutPercentage: 85,
    martingaleEnabled: true,
    assignedChannels: ['Premium Signals', 'VIP Channel'],
    totalTrades: 245,
    winRate: 78.5,
    profit: 1250.75,
    createdAt: '2024-01-15T10:00:00Z',
    lastActivity: new Date().toISOString(),
    config: {
      strategy: 'martingale',
      riskLevel: 'medium',
      maxDrawdown: 20,
      stopLoss: 10,
      takeProfit: 15,
      martingaleLevels: 3,
      timeframe: '1m',
    },
  },
  {
    id: '2',
    name: 'Conservative Bot',
    status: 'stopped',
    uptime: 43200,
    baseAmount: 5,
    payoutPercentage: 82,
    martingaleEnabled: false,
    assignedChannels: ['Main Channel'],
    totalTrades: 128,
    winRate: 82.1,
    profit: 890.50,
    createdAt: '2024-01-20T14:30:00Z',
    lastActivity: '2024-01-25T18:45:00Z',
    config: {
      strategy: 'flat',
      riskLevel: 'low',
      maxDrawdown: 10,
      stopLoss: 5,
      takeProfit: 10,
      martingaleLevels: 1,
      timeframe: '5m',
    },
  },
  {
    id: '3',
    name: 'Aggressive Trader',
    status: 'error',
    uptime: 0,
    baseAmount: 25,
    payoutPercentage: 88,
    martingaleEnabled: true,
    assignedChannels: ['High Risk Signals'],
    totalTrades: 89,
    winRate: 65.2,
    profit: -145.25,
    createdAt: '2024-01-25T09:15:00Z',
    lastActivity: '2024-01-25T16:20:00Z',
    config: {
      strategy: 'anti-martingale',
      riskLevel: 'high',
      maxDrawdown: 40,
      stopLoss: 20,
      takeProfit: 30,
      martingaleLevels: 5,
      timeframe: '1m',
    },
  },
]

export const useBots = create<BotsState>((set, get) => ({
  bots: mockBots,
  selectedBot: null,
  isLoading: false,
  fetchBots: () => {
    set({ isLoading: true })
    setTimeout(() => {
      set({ bots: mockBots, isLoading: false })
    }, 500)
  },
  selectBot: (bot: Bot) => {
    set({ selectedBot: bot })
  },
  updateBot: (id: string, updates: Partial<Bot>) => {
    const { bots } = get()
    const updatedBots = bots.map(bot =>
      bot.id === id ? { ...bot, ...updates } : bot
    )
    set({ bots: updatedBots })
  },
  startBot: (id: string) => {
    const { updateBot } = get()
    updateBot(id, { status: 'running', lastActivity: new Date().toISOString() })
  },
  stopBot: (id: string) => {
    const { updateBot } = get()
    updateBot(id, { status: 'stopped' })
  },
}))