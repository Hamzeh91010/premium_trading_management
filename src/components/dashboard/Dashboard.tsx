import React from 'react'
import { Bot, TrendingUp, Activity, Target, DollarSign, Percent } from 'lucide-react'
import { StatsCard } from './StatsCard'
import { BotOverview } from './BotOverview'
import { RecentSignals } from './RecentSignals'
import { ProfitChart } from './ProfitChart'
import { useBots } from '@/hooks/useBots'
import { useSignals } from '@/hooks/useSignals'

export function Dashboard() {
  const { bots } = useBots()
  const { signals } = useSignals()

  const stats = {
    totalBots: bots.length,
    activeBots: bots.filter(bot => bot.status === 'running').length,
    totalProfit: bots.reduce((sum, bot) => sum + bot.profit, 0),
    averageWinRate: bots.reduce((sum, bot) => sum + bot.winRate, 0) / bots.length,
    activeSignals: signals.filter(signal => signal.status === 'active').length,
    totalTrades: bots.reduce((sum, bot) => sum + bot.totalTrades, 0),
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Welcome back! Here's what's happening with your trading bots.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatsCard
          title="Total Bots"
          value={stats.totalBots}
          change={12.5}
          icon={<Bot className="w-4 h-4" />}
        />
        <StatsCard
          title="Active Bots"
          value={stats.activeBots}
          change={8.2}
          icon={<Activity className="w-4 h-4" />}
        />
        <StatsCard
          title="Total Profit"
          value={stats.totalProfit}
          change={15.3}
          type="currency"
          icon={<DollarSign className="w-4 h-4" />}
        />
        <StatsCard
          title="Win Rate"
          value={stats.averageWinRate}
          change={2.1}
          type="percentage"
          icon={<Percent className="w-4 h-4" />}
        />
        <StatsCard
          title="Active Signals"
          value={stats.activeSignals}
          change={-5.4}
          icon={<Target className="w-4 h-4" />}
        />
        <StatsCard
          title="Total Trades"
          value={stats.totalTrades}
          change={22.8}
          icon={<TrendingUp className="w-4 h-4" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProfitChart />
        <BotOverview />
      </div>

      <RecentSignals />
    </div>
  )
}