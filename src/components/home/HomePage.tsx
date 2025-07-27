import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { TradingBackground } from './TradingBackground'
import TradingResultsModal from './TradingResultsModal'
import { 
  TrendingUp, 
  BarChart3, 
  Zap, 
  Shield, 
  Clock, 
  Target,
  ArrowRight,
  Play
} from 'lucide-react'

interface HomePageProps {
  onEnterDashboard: () => void
}

export function HomePage({ onEnterDashboard }: HomePageProps) {
  const [showModal, setShowModal] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Auto-show modal after 2 seconds
    const timer = setTimeout(() => {
      setShowModal(true)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  const handleFeatureClick = (feature: string) => {
    // Navigate to dashboard with specific tab
    onEnterDashboard()
    // Small delay to ensure dashboard is loaded before setting active tab
    setTimeout(() => {
      const event = new CustomEvent('navigateToTab', { detail: feature })
      window.dispatchEvent(event)
    }, 100)
  }

  const features = [
    {
      id: 'signals',
      icon: <Clock className="w-6 h-6" />,
      title: 'Live Signal Tracking',
      description: 'Monitor upcoming trading signals in real-time with countdown timers and execution status',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'analytics',
      icon: <BarChart3 className="w-6 h-6" />,
      title: 'Trading Statistics',
      description: 'Track your trading performance with detailed statistics and visualizations',
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'bots',
      icon: <Target className="w-6 h-6" />,
      title: 'Complete Control',
      description: 'Control your trading bot with pause/resume functionality and customize settings',
      color: 'from-green-500 to-emerald-500'
    }
  ]

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden">
      <TradingBackground />
      
      {/* Animated Color Spectrum Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-cyan-900/20 animate-pulse" />
      <div className="absolute inset-0 bg-gradient-to-tl from-green-900/10 via-transparent to-blue-900/10" 
           style={{ 
             animation: 'gradient-shift 8s ease-in-out infinite',
             backgroundSize: '400% 400%'
           }} />

      {/* Header */}
      <header className="relative z-10 p-6">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">TradingBot Dashboard</h1>
            </div>
          </div>
          
          <Button 
            onClick={onEnterDashboard}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6"
          >
            Go to Dashboard
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex items-center justify-center min-h-[calc(100vh-120px)] p-6">
        <div className="max-w-6xl mx-auto text-center">
          {/* Hero Section */}
          <div className="mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-500/20 backdrop-blur-sm border border-blue-500/30 rounded-full px-4 py-2 mb-6">
              <Zap className="w-4 h-4 text-blue-400" />
              <span className="text-blue-300 text-sm font-medium">Advanced Trading Automation</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Trading Automation
              <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Dashboard
              </span>
            </h1>
            
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Monitor and manage your trading bot with real-time signals, statistics, and 
              performance tracking in one comprehensive platform
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                onClick={() => setShowModal(true)}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg"
              >
                <Play className="w-5 h-5 mr-2" />
                View Trading Results
              </Button>
              
              <Button 
                onClick={onEnterDashboard}
                size="lg"
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-800 px-8 py-3 text-lg backdrop-blur-sm"
              >
                Open Dashboard
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="bg-gray-800/30 backdrop-blur-md border-gray-700/50 hover:bg-gray-800/50 transition-all duration-300 group cursor-pointer transform hover:scale-105"
                onClick={() => handleFeatureClick(feature.id)}
              >
                <CardContent className="p-6 text-center">
                  <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <div className="text-white">
                      {feature.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                  <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="inline-flex items-center text-sm text-blue-400 font-medium">
                      Click to explore
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Stats Preview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Active Bots', value: '3', color: 'text-green-400' },
              { label: 'Win Rate', value: '78.5%', color: 'text-blue-400' },
              { label: 'Total Profit', value: '$2,847', color: 'text-purple-400' },
              { label: 'Live Signals', value: '12', color: 'text-cyan-400' },
            ].map((stat, index) => (
              <div key={index} className="bg-gray-800/20 backdrop-blur-sm border border-gray-700/30 rounded-lg p-4">
                <div className={`text-2xl font-bold ${stat.color} mb-1`}>
                  {stat.value}
                </div>
                <div className="text-sm text-gray-400">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Trading Results Modal */}
      <TradingResultsModal 
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />

      {/* Custom CSS for gradient animation */}
      <style jsx>{`
        @keyframes gradient-shift {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
      `}</style>
    </div>
  )
}