import React from 'react'
import { 
  BarChart3, 
  Bot, 
  TrendingUp, 
  Settings, 
  Users, 
  Bell, 
  Home,
  Activity,
  Zap,
  Terminal,
  Radio
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
  collapsed: boolean
}

const navigationItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'bots', label: 'Bot Control', icon: Bot },
  { id: 'bot-manager', label: 'Bot Manager', icon: Terminal },
  { id: 'signals', label: 'Signals', icon: Activity },
  { id: 'real-signals', label: 'Live Signals', icon: Radio },
  { id: 'strategy', label: 'Strategy Studio', icon: Zap },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'admin', label: 'Admin Panel', icon: Users },
  { id: 'settings', label: 'Settings', icon: Settings },
]

export function Sidebar({ activeTab, onTabChange, collapsed }: SidebarProps) {
  return (
    <div className={cn(
      "bg-gray-900 text-white h-full transition-all duration-300 flex flex-col",
      collapsed ? "w-16" : "w-64"
    )}>
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="text-lg font-bold">TradingBot Pro</h1>
              <p className="text-xs text-gray-400">Enterprise Platform</p>
            </div>
          )}
        </div>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => onTabChange(item.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                    "hover:bg-gray-800",
                    isActive && "bg-blue-600 hover:bg-blue-700"
                  )}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
                </button>
              </li>
            )
          })}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full" />
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">System Online</p>
              <p className="text-xs text-gray-400">All services running</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}