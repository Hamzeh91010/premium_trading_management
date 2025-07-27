export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'user' | 'operator'
  avatar?: string
  createdAt: string
  lastLogin?: string
}

export interface Bot {
  id: string
  name: string
  status: 'running' | 'stopped' | 'error'
  uptime: number
  baseAmount: number
  payoutPercentage: number
  martingaleEnabled: boolean
  assignedChannels: string[]
  totalTrades: number
  winRate: number
  profit: number
  createdAt: string
  lastActivity?: string
  config: BotConfig
}

export interface BotConfig {
  strategy: string
  riskLevel: 'low' | 'medium' | 'high'
  maxDrawdown: number
  stopLoss: number
  takeProfit: number
  martingaleLevels: number
  timeframe: string
}

export interface Signal {
  id: string
  pair: string
  direction: 'call' | 'put'
  timeframe: string
  timestamp: string
  source: string
  status: 'active' | 'expired' | 'won' | 'lost'
  profit?: number
  level: number
  botId?: string
}

export interface Trade {
  id: string
  signalId: string
  botId: string
  pair: string
  direction: 'call' | 'put'
  amount: number
  profit: number
  timestamp: string
  status: 'won' | 'lost' | 'pending'
  level: number
}

export interface DashboardStats {
  totalBots: number
  activeBots: number
  totalTrades: number
  dailyProfit: number
  winRate: number
  activeSignals: number
}

export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  timestamp: string
  read: boolean
}