import { create } from 'zustand'

interface BotProcess {
  id: string
  name: string
  type: 'telegram_listener' | 'trade_runner'
  status: 'running' | 'stopped' | 'error' | 'starting' | 'stopping'
  pid?: number
  startTime?: string
  lastActivity?: string
  logs: string[]
  config: {
    autoRestart: boolean
    maxRestarts: number
    restartCount: number
  }
}

interface BotManagerState {
  bots: BotProcess[]
  isLoading: boolean
  startBot: (botId: string) => Promise<void>
  stopBot: (botId: string) => Promise<void>
  restartBot: (botId: string) => Promise<void>
  getBotLogs: (botId: string) => string[]
  updateBotStatus: () => Promise<void>
}

const initialBots: BotProcess[] = [
  {
    id: 'telegram_listener',
    name: 'Telegram Signal Listener',
    type: 'telegram_listener',
    status: 'stopped',
    logs: [],
    config: {
      autoRestart: true,
      maxRestarts: 5,
      restartCount: 0
    }
  },
  {
    id: 'trade_runner',
    name: 'Trade Signal Runner',
    type: 'trade_runner', 
    status: 'stopped',
    logs: [],
    config: {
      autoRestart: true,
      maxRestarts: 5,
      restartCount: 0
    }
  }
]

export const useBotManager = create<BotManagerState>((set, get) => ({
  bots: initialBots,
  isLoading: false,

  startBot: async (botId: string) => {
    const { bots } = get()
    const updatedBots = bots.map(bot => 
      bot.id === botId 
        ? { 
            ...bot, 
            status: 'starting' as const,
            logs: [...bot.logs, `${new Date().toISOString()}: Starting bot...`]
          }
        : bot
    )
    set({ bots: updatedBots })

    // Simulate bot startup
    setTimeout(() => {
      const { bots } = get()
      const finalBots = bots.map(bot => 
        bot.id === botId 
          ? { 
              ...bot, 
              status: 'running' as const,
              startTime: new Date().toISOString(),
              lastActivity: new Date().toISOString(),
              pid: Math.floor(Math.random() * 10000) + 1000,
              logs: [...bot.logs, `${new Date().toISOString()}: Bot started successfully`]
            }
          : bot
      )
      set({ bots: finalBots })
    }, 2000)
  },

  stopBot: async (botId: string) => {
    const { bots } = get()
    const updatedBots = bots.map(bot => 
      bot.id === botId 
        ? { 
            ...bot, 
            status: 'stopping' as const,
            logs: [...bot.logs, `${new Date().toISOString()}: Stopping bot...`]
          }
        : bot
    )
    set({ bots: updatedBots })

    // Simulate bot shutdown
    setTimeout(() => {
      const { bots } = get()
      const finalBots = bots.map(bot => 
        bot.id === botId 
          ? { 
              ...bot, 
              status: 'stopped' as const,
              pid: undefined,
              logs: [...bot.logs, `${new Date().toISOString()}: Bot stopped`]
            }
          : bot
      )
      set({ bots: finalBots })
    }, 1500)
  },

  restartBot: async (botId: string) => {
    const { stopBot, startBot } = get()
    await stopBot(botId)
    setTimeout(() => startBot(botId), 2000)
  },

  getBotLogs: (botId: string) => {
    const { bots } = get()
    const bot = bots.find(b => b.id === botId)
    return bot?.logs || []
  },

  updateBotStatus: async () => {
    // In a real implementation, this would check actual process status
    // For now, we'll simulate some activity updates
    const { bots } = get()
    const updatedBots = bots.map(bot => 
      bot.status === 'running' 
        ? { 
            ...bot, 
            lastActivity: new Date().toISOString(),
            logs: bot.logs.length > 50 
              ? [...bot.logs.slice(-45), `${new Date().toISOString()}: Bot is active`]
              : [...bot.logs, `${new Date().toISOString()}: Bot is active`]
          }
        : bot
    )
    set({ bots: updatedBots })
  }
}))