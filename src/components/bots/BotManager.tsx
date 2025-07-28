import React, { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Play, 
  Square, 
  RotateCcw, 
  Activity,
  Terminal,
  Settings,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  ExternalLink,
  X,
  Download,
  RefreshCw
} from 'lucide-react'
import { useBotManager } from '@/hooks/useBotManager'
import { getStatusColor } from '@/lib/utils'

export function BotManager() {
  const { bots, startBot, stopBot, restartBot, updateBotStatus } = useBotManager()
  const [selectedBotLogs, setSelectedBotLogs] = React.useState<string | null>(null)
  const [showLogsModal, setShowLogsModal] = React.useState(false)
  const [tradeAmount, setTradeAmount] = React.useState('10.00')
  const [isLoading, setIsLoading] = React.useState(false)

  useEffect(() => {
    // Update bot status every 30 seconds
    const interval = setInterval(updateBotStatus, 30000)
    return () => clearInterval(interval)
  }, [updateBotStatus])

  useEffect(() => {
    // Load initial trade amount from settings
    const loadTradeAmount = async () => {
      try {
        const response = await fetch('/settings.json')
        if (response.ok) {
          const settings = await response.json()
          if (settings.tradeAmount) {
            setTradeAmount(settings.tradeAmount.toString())
          }
        }
      } catch (error) {
        console.log('Could not load settings, using default amount of $10.00')
        setTradeAmount('10.00')
      }
    }
    loadTradeAmount()
  }, [])

  const handleSaveAmount = async () => {
    if (!tradeAmount || parseFloat(tradeAmount) <= 0) {
      alert('Please enter a valid amount')
      return
    }

    setIsLoading(true)
    try {
      // Simulate API call to save settings
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const settings = {
        tradeAmount: parseFloat(tradeAmount),
        updatedAt: new Date().toISOString()
      }
      
      // In a real app, this would be an API call
      console.log('Settings saved:', settings)
      alert('Trade amount saved successfully!')
    } catch (error) {
      alert('Failed to save trade amount')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'stopped':
        return <Square className="w-4 h-4 text-gray-500" />
      case 'starting':
      case 'stopping':
        return <Clock className="w-4 h-4 text-yellow-500 animate-spin" />
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-500" />
      default:
        return <Activity className="w-4 h-4" />
    }
  }

  const getBotDescription = (type: string) => {
    switch (type) {
      case 'telegram_listener':
        return 'Monitors Telegram channels for trading signals and parses them into structured data'
      case 'trade_runner':
        return 'Executes trades automatically based on parsed signals with martingale strategy'
      default:
        return 'Trading bot process'
    }
  }

  const formatUptime = (startTime?: string) => {
    if (!startTime) return 'Not running'
    
    const start = new Date(startTime)
    const now = new Date()
    const diff = now.getTime() - start.getTime()
    
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    return `${hours}h ${minutes}m`
  }

  const openLogsModal = (botId: string) => {
    setSelectedBotLogs(botId)
    setShowLogsModal(true)
  }

  const closeLogsModal = () => {
    setShowLogsModal(false)
    setSelectedBotLogs(null)
  }

  const getSelectedBotLogs = () => {
    if (!selectedBotLogs) return []
    const bot = bots.find(b => b.id === selectedBotLogs)
    return bot?.logs || []
  }

  const downloadLogs = () => {
    if (!selectedBotLogs) return
    
    const bot = bots.find(b => b.id === selectedBotLogs)
    if (!bot) return

    const logsText = bot.logs.join('\n')
    const blob = new Blob([logsText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${bot.name.replace(/\s+/g, '_')}_logs_${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Bot Management</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Monitor and control your trading automation bots
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {bots.map((bot) => (
          <Card key={bot.id} className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                    {bot.type === 'telegram_listener' ? (
                      <Terminal className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    ) : (
                      <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{bot.name}</CardTitle>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {bot.type.replace('_', ' ').toUpperCase()}
                    </p>
                  </div>
                </div>
                
                <Badge className={getStatusColor(bot.status)}>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(bot.status)}
                    <span className="capitalize">{bot.status}</span>
                  </div>
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {getBotDescription(bot.type)}
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {bot.pid || 'N/A'}
                  </div>
                  <div className="text-xs text-gray-500">Process ID</div>
                </div>

                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {formatUptime(bot.startTime)}
                  </div>
                  <div className="text-xs text-gray-500">Uptime</div>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Auto Restart:</span>
                  <span className="font-medium">
                    {bot.config.autoRestart ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Restart Count:</span>
                  <span className="font-medium">
                    {bot.config.restartCount}/{bot.config.maxRestarts}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Python Script:</span>
                  <span className="font-medium text-xs font-mono">
                    {bot.type === 'telegram_listener' ? 'telegram_listener_client.py' : 'trade_signal_runner.py'}
                  </span>
                </div>
                {bot.lastActivity && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Last Activity:</span>
                    <span className="font-medium text-xs">
                      {new Date(bot.lastActivity).toLocaleTimeString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Recent Logs */}
              <div 
                className="space-y-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/30 p-2 rounded-lg transition-colors"
                onClick={() => openLogsModal(bot.id)}
              >
                <div className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                  <div className="flex items-center justify-between">
                    <span>Python Process Logs</span>
                    <ExternalLink className="w-3 h-3" />
                  </div>
                </div>
                <div className="bg-gray-900 text-green-400 p-3 rounded-lg font-mono text-xs max-h-32 overflow-y-auto">
                  {bot.logs.length > 0 ? (
                    bot.logs.slice(-5).map((log, index) => (
                      <div key={index} className="mb-1">
                        {log}
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-500">No process logs available</div>
                  )}
                  {bot.logs.length > 5 && (
                    <div className="text-blue-400 text-center mt-2 text-xs">
                      Click to view all {bot.logs.length} logs...
                    </div>
                  )}
                </div>
              </div>

            {/* Trading Amount Section - Only for Trade Runner */}
            {bot.id === 'trade_runner' && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="space-y-3">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Trading Amount
                  </div>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                        $
                      </span>
                      <input
                        type="number"
                        value={tradeAmount}
                        onChange={(e) => setTradeAmount(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleSaveAmount()
                          }
                        }}
                        placeholder="10.00"
                        step="0.01"
                        min="0.01"
                        className="w-full pl-8 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>
                    <Button
                      size="sm"
                      onClick={handleSaveAmount}
                      disabled={isLoading || !tradeAmount || parseFloat(tradeAmount) <= 0}
                      className="px-4"
                    >
                      {isLoading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        'Accept'
                      )}
                    </Button>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Base amount for automated trades (martingale will calculate subsequent levels)
                  </div>
                </div>
              </div>
            )}

              {/* Control Buttons */}
              <div className="flex gap-2 pt-2">
                {bot.status === 'running' ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => stopBot(bot.id)}
                    className="flex-1"
                    disabled={bot.status === 'stopping'}
                  >
                    <Square className="w-4 h-4 mr-1" />
                    Stop
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => startBot(bot.id)}
                    className="flex-1"
                    disabled={bot.status === 'starting'}
                  >
                    <Play className="w-4 h-4 mr-1" />
                    Start
                  </Button>
                )}
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => restartBot(bot.id)}
                  disabled={bot.status === 'starting' || bot.status === 'stopping'}
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    // Settings logic would go here
                  }}
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* System Overview */}
      <Card>
        <CardHeader>
          <CardTitle>System Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {bots.filter(b => b.status === 'running').length}
              </div>
              <div className="text-sm text-green-600 dark:text-green-400">Running Bots</div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                {bots.filter(b => b.status === 'stopped').length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Stopped Bots</div>
            </div>
            
            <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {bots.filter(b => b.status === 'error').length}
              </div>
              <div className="text-sm text-red-600 dark:text-red-400">Error State</div>
            </div>
            
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {bots.reduce((sum, b) => sum + b.config.restartCount, 0)}
              </div>
              <div className="text-sm text-blue-600 dark:text-blue-400">Total Restarts</div>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>

      {/* Detailed Logs Modal */}
      {showLogsModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 w-full max-w-4xl max-h-[80vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <Terminal className="w-6 h-6 text-blue-500" />
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Python Process Logs
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {bots.find(b => b.id === selectedBotLogs)?.name || 'Bot'} - 
                    {getSelectedBotLogs().length} log entries
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadLogs}
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateBotStatus()}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={closeLogsModal}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-hidden p-6">
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm h-full overflow-y-auto">
                {getSelectedBotLogs().length > 0 ? (
                  <div className="space-y-1">
                    {getSelectedBotLogs().map((log, index) => (
                      <div 
                        key={index} 
                        className="hover:bg-gray-800/50 px-2 py-1 rounded transition-colors"
                      >
                        <span className="text-gray-500 mr-3">
                          {String(index + 1).padStart(3, '0')}:
                        </span>
                        {log}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                      <Terminal className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No process logs available</p>
                      <p className="text-xs mt-2">Start the bot to see logs here</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-4">
                  <span>Total Logs: {getSelectedBotLogs().length}</span>
                  <span>
                    Bot Status: 
                    <Badge className={`ml-2 ${getStatusColor(bots.find(b => b.id === selectedBotLogs)?.status || 'stopped')}`}>
                      {bots.find(b => b.id === selectedBotLogs)?.status || 'Unknown'}
                    </Badge>
                  </span>
                </div>
                <div className="text-xs">
                  Last updated: {new Date().toLocaleTimeString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}