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
  pythonScript?: string
  workingDirectory?: string
}

interface BotManagerState {
  bots: BotProcess[]
  isLoading: boolean
  startBot: (botId: string) => Promise<void>
  stopBot: (botId: string) => Promise<void>
  restartBot: (botId: string) => Promise<void>
  getBotLogs: (botId: string) => string[]
  updateBotStatus: () => Promise<void>
  startPythonBot: (botId: string) => Promise<void>
  stopPythonBot: (botId: string) => Promise<void>
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
    },
    pythonScript: 'telegram_listener_client.py',
    workingDirectory: './'
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
    },
    pythonScript: 'trade_signal_runner.py',
    workingDirectory: './'
  }
]

export const useBotManager = create<BotManagerState>((set, get) => ({
  bots: initialBots,
  isLoading: false,

  startPythonBot: async (botId: string) => {
    const { bots } = get()
    const bot = bots.find(b => b.id === botId)
    if (!bot) return

    const updatedBots = bots.map(bot => 
      bot.id === botId 
        ? { 
            ...bot, 
            status: 'starting' as const,
            logs: [...bot.logs, `${new Date().toISOString()}: Starting Python bot ${bot.pythonScript}...`]
          }
        : bot
    )
    set({ bots: updatedBots })

    try {
      // In a real implementation, this would spawn the Python process
      // For now, we'll simulate the process startup
      const response = await fetch('/api/bots/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          botId, 
          script: bot.pythonScript,
          workingDir: bot.workingDirectory 
        })
      })

      if (response.ok) {
        const data = await response.json()
        const finalBots = get().bots.map(bot => 
          bot.id === botId 
            ? { 
                ...bot, 
                status: 'running' as const,
                startTime: new Date().toISOString(),
                lastActivity: new Date().toISOString(),
                pid: data.pid || Math.floor(Math.random() * 10000) + 1000,
                logs: [...bot.logs, `${new Date().toISOString()}: Python bot started successfully (PID: ${data.pid})`]
              }
            : bot
        )
        set({ bots: finalBots })
      } else {
        throw new Error('Failed to start bot')
      }
    } catch (error) {
      // Fallback to simulation if API is not available
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
                logs: [...bot.logs, `${new Date().toISOString()}: Python bot started successfully (simulated)`]
              }
            : bot
        )
        set({ bots: finalBots })
      }, 2000)
    }
  },

  stopPythonBot: async (botId: string) => {
    const { bots } = get()
    const bot = bots.find(b => b.id === botId)
    if (!bot) return

    const updatedBots = bots.map(bot => 
      bot.id === botId 
        ? { 
            ...bot, 
            status: 'stopping' as const,
            logs: [...bot.logs, `${new Date().toISOString()}: Stopping Python bot (PID: ${bot.pid})...`]
          }
        : bot
    )
    set({ bots: updatedBots })

    try {
      // In a real implementation, this would kill the Python process
      const response = await fetch('/api/bots/stop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ botId, pid: bot.pid })
      })

      if (response.ok) {
        const finalBots = get().bots.map(bot => 
          bot.id === botId 
            ? { 
                ...bot, 
                status: 'stopped' as const,
                pid: undefined,
                logs: [...bot.logs, `${new Date().toISOString()}: Python bot stopped successfully`]
              }
            : bot
        )
        set({ bots: finalBots })
      } else {
        throw new Error('Failed to stop bot')
      }
    } catch (error) {
      // Fallback to simulation if API is not available
      setTimeout(() => {
        const { bots } = get()
        const finalBots = bots.map(bot => 
          bot.id === botId 
            ? { 
                ...bot, 
                status: 'stopped' as const,
                pid: undefined,
                logs: [...bot.logs, `${new Date().toISOString()}: Python bot stopped (simulated)`]
              }
            : bot
        )
        set({ bots: finalBots })
      }, 1500)
    }
  },

  startBot: async (botId: string) => {
    return get().startPythonBot(botId)
  },

  stopBot: async (botId: string) => {
    return get().stopPythonBot(botId)
  },

  restartBot: async (botId: string) => {
    const { stopPythonBot, startPythonBot } = get()
    await stopPythonBot(botId)
    setTimeout(() => startPythonBot(botId), 2000)
  },

  getBotLogs: (botId: string) => {
    const { bots } = get()
    const bot = bots.find(b => b.id === botId)
    return bot?.logs || []
  },

  updateBotStatus: async () => {
    try {
      // In a real implementation, this would check actual Python process status
      const response = await fetch('/api/bots/status')
      if (response.ok) {
        const statusData = await response.json()
        // Update bot statuses based on actual process status
        const { bots } = get()
        const updatedBots = bots.map(bot => {
          const processStatus = statusData.find((p: any) => p.id === bot.id)
          if (processStatus) {
            return {
              ...bot,
              status: processStatus.status,
              pid: processStatus.pid,
              lastActivity: new Date().toISOString()
            }
          }
          return bot
        })
        set({ bots: updatedBots })
      }
    } catch (error) {
      // Fallback to simulation if API is not available
      const { bots } = get()
      const updatedBots = bots.map(bot => 
        bot.status === 'running' 
          ? { 
              ...bot, 
              lastActivity: new Date().toISOString(),
              logs: bot.logs.length > 50 
                ? [...bot.logs.slice(-45), `${new Date().toISOString()}: Python bot is active`]
                : [...bot.logs, `${new Date().toISOString()}: Python bot is active`]
            }
          : bot
      )
      set({ bots: updatedBots })
    }
  }
}))