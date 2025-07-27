import React, { useState } from 'react'
import { HomePage } from '@/components/home/HomePage'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { Dashboard } from '@/components/dashboard/Dashboard'
import { BotControlCenter } from '@/components/bots/BotControlCenter'
import { SignalsMonitor } from '@/components/signals/SignalsMonitor'
import { ComingSoon } from '@/components/placeholder/ComingSoon'

function App() {
  const [showHomePage, setShowHomePage] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    const handleNavigateToTab = (event: CustomEvent) => {
      setActiveTab(event.detail)
    }

    window.addEventListener('navigateToTab', handleNavigateToTab as EventListener)
    
    return () => {
      window.removeEventListener('navigateToTab', handleNavigateToTab as EventListener)
    }
  }, [])

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />
      case 'bots':
        return <BotControlCenter />
      case 'signals':
        return <SignalsMonitor />
      case 'strategy':
        return (
          <ComingSoon 
            title="Strategy Studio" 
            description="Visual strategy editor with drag-and-drop functionality"
          />
        )
      case 'analytics':
        return (
          <ComingSoon 
            title="Analytics & Reporting" 
            description="Advanced analytics and exportable reports"
          />
        )
      case 'notifications':
        return (
          <ComingSoon 
            title="Notification Center" 
            description="Manage alerts and notification preferences"
          />
        )
      case 'admin':
        return (
          <ComingSoon 
            title="Admin Panel" 
            description="User management and system administration"
          />
        )
      case 'settings':
        return (
          <ComingSoon 
            title="Settings" 
            description="Application settings and integrations"
          />
        )
      default:
        return <Dashboard />
    }
  }

  const handleEnterDashboard = () => {
    setShowHomePage(false)
  }

  if (showHomePage) {
    return <HomePage onEnterDashboard={handleEnterDashboard} />
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <div className={`${sidebarCollapsed ? 'w-16' : 'w-64'} transition-all duration-300 flex-shrink-0`}>
        <Sidebar 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
          collapsed={sidebarCollapsed}
        />
      </div>
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          onMenuToggle={toggleSidebar}
          theme={theme}
          onThemeToggle={toggleTheme}
        />
        
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <div className="animate-fade-in">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  )
}

export default App