import React, { useState, useMemo } from 'react'
import { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowUp, 
  ArrowDown, 
  Search,
  Filter,
  Download,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Clock,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export interface TradingSignal {
  pair: string
  entry_time: string
  direction: 'BUY' | 'SELL'
  trade_duration: string
  is_otc: boolean
  is_expired: boolean
  received_at: string
  result: 'win' | 'loss' | null
  message_id: number
  raw_text: string
  martingale_times: string[]
  executed: boolean
  end_time?: string
  payout_percent?: string
  total_profit?: number
  total_staked?: number
  base_amount?: number
  trade_count?: number
}

type SortField = keyof TradingSignal
type SortDirection = 'asc' | 'desc'

export function TradingSignalsTable() {
  const [signals, setSignals] = useState<TradingSignal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [directionFilter, setDirectionFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [sortField, setSortField] = useState<SortField>('received_at')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Fetch signals data from ALLSignals.json
  useEffect(() => {
    const fetchSignals = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/ALLSignals.json')
        if (response.ok) {
          const data: TradingSignal[] = await response.json()
          setSignals(data)
        } else {
          console.error('Failed to fetch signals data')
        }
      } catch (error) {
        console.error('Error fetching signals:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSignals()
  }, [])

  const filteredAndSortedSignals = useMemo(() => {
    if (isLoading || signals.length === 0) return []
    
    let filtered = signals.filter(signal => {
      const matchesSearch = 
        signal.pair.toLowerCase().includes(searchTerm.toLowerCase()) ||
        signal.direction.toLowerCase().includes(searchTerm.toLowerCase()) ||
        signal.message_id.toString().includes(searchTerm)

      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'active' && !signal.is_expired) ||
        (statusFilter === 'expired' && signal.is_expired) ||
        (statusFilter === 'executed' && signal.executed) ||
        (statusFilter === 'pending' && !signal.executed) ||
        (statusFilter === 'win' && signal.result === 'win') ||
        (statusFilter === 'loss' && signal.result === 'loss')

      const matchesDirection = directionFilter === 'all' || signal.direction === directionFilter
      const matchesType = typeFilter === 'all' || 
        (typeFilter === 'otc' && signal.is_otc) ||
        (typeFilter === 'regular' && !signal.is_otc)

      return matchesSearch && matchesStatus && matchesDirection && matchesType
    })

    // Sort
    filtered.sort((a, b) => {
      let aValue = a[sortField]
      let bValue = b[sortField]

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase()
        bValue = (bValue as string).toLowerCase()
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    return filtered
  }, [signals, searchTerm, statusFilter, directionFilter, typeFilter, sortField, sortDirection])

  const totalPages = Math.ceil(filteredAndSortedSignals.length / itemsPerPage)
  const paginatedSignals = filteredAndSortedSignals.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const getStatusBadge = (signal: TradingSignal) => {
    if (!signal.executed) {
      return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Pending</Badge>
    }
    if (!signal.is_expired) {
      return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Active</Badge>
    }
    if (signal.result === 'win') {
      return <Badge className="bg-green-100 text-green-800 border-green-200">Won</Badge>
    }
    if (signal.result === 'loss') {
      return <Badge className="bg-red-100 text-red-800 border-red-200">Lost</Badge>
    }
    return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Expired</Badge>
  }

  const getResultIcon = (signal: TradingSignal) => {
    if (!signal.executed) return <Clock className="w-4 h-4 text-blue-500" />
    if (signal.result === 'win') return <CheckCircle className="w-4 h-4 text-green-500" />
    if (signal.result === 'loss') return <XCircle className="w-4 h-4 text-red-500" />
    return <AlertCircle className="w-4 h-4 text-amber-500" />
  }

  const formatTime = (timeStr: string) => {
    try {
      return new Date(timeStr).toLocaleString()
    } catch {
      return timeStr
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Trading Signals</h2>
          <p className="text-gray-600 dark:text-gray-400">
            {filteredAndSortedSignals.length} signals found
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            {isLoading ? 'Loading...' : 'Refresh'}
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search signals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="executed">Executed</option>
              <option value="pending">Pending</option>
              <option value="win">Won</option>
              <option value="loss">Lost</option>
            </select>

            {/* Direction Filter */}
            <select
              value={directionFilter}
              onChange={(e) => setDirectionFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Directions</option>
              <option value="BUY">Buy</option>
              <option value="SELL">Sell</option>
            </select>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="otc">OTC</option>
              <option value="regular">Regular</option>
            </select>

            {/* Items per page */}
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={5}>5 per page</option>
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-3"></div>
              <span className="text-gray-600 dark:text-gray-400">Loading trading signals...</span>
            </div>
          ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('message_id')}
                      className="font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    >
                      ID
                      <ArrowUpDown className="w-3 h-3 ml-1" />
                    </Button>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('pair')}
                      className="font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    >
                      Pair
                      <ArrowUpDown className="w-3 h-3 ml-1" />
                    </Button>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('direction')}
                      className="font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    >
                      Direction
                      <ArrowUpDown className="w-3 h-3 ml-1" />
                    </Button>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('entry_time')}
                      className="font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    >
                      Entry Time
                      <ArrowUpDown className="w-3 h-3 ml-1" />
                    </Button>
                  </th>
                  <th className="px-4 py-3 text-left">Duration</th>
                  <th className="px-4 py-3 text-left">Type</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Martingale</th>
                  <th className="px-4 py-3 text-left">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('total_profit')}
                      className="font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    >
                      Profit
                      <ArrowUpDown className="w-3 h-3 ml-1" />
                    </Button>
                  </th>
                  <th className="px-4 py-3 text-left">Payout</th>
                  <th className="px-4 py-3 text-left">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('received_at')}
                      className="font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    >
                      Received
                      <ArrowUpDown className="w-3 h-3 ml-1" />
                    </Button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedSignals.map((signal) => (
                  <tr key={signal.message_id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        {getResultIcon(signal)}
                        <span className="font-medium text-sm">#{signal.message_id}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {signal.pair}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        {signal.direction === 'BUY' ? (
                          <TrendingUp className="w-4 h-4 text-green-600" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-600" />
                        )}
                        <span className={`font-medium ${
                          signal.direction === 'BUY' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {signal.direction}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm">
                        <div className="font-medium">{signal.entry_time}</div>
                        {signal.end_time && (
                          <div className="text-gray-500">End: {signal.end_time}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant="outline" className="text-xs">
                        {signal.trade_duration}
                      </Badge>
                    </td>
                    <td className="px-4 py-4">
                      <Badge 
                        variant="outline" 
                        className={signal.is_otc ? 'border-purple-500 text-purple-600' : 'border-blue-500 text-blue-600'}
                      >
                        {signal.is_otc ? 'OTC' : 'Regular'}
                      </Badge>
                    </td>
                    <td className="px-4 py-4">
                      {getStatusBadge(signal)}
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-xs">
                        {signal.trade_count && signal.trade_count > 1 ? (
                          <Badge variant="outline" className="border-amber-500 text-amber-600">
                            L{signal.trade_count}
                          </Badge>
                        ) : (
                          <Badge variant="outline">L1</Badge>
                        )}
                        <div className="text-gray-500 mt-1">
                          {signal.martingale_times.slice(0, 2).join(', ')}
                          {signal.martingale_times.length > 2 && '...'}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {signal.total_profit !== undefined ? (
                        <div className="text-right">
                          <div className={`font-medium ${
                            signal.total_profit >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {formatCurrency(signal.total_profit)}
                          </div>
                          {signal.total_staked && (
                            <div className="text-xs text-gray-500">
                              Staked: {formatCurrency(signal.total_staked)}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      {signal.payout_percent ? (
                        <Badge 
                          className={
                            signal.payout_percent.startsWith('+') 
                              ? 'bg-green-100 text-green-800 border-green-200'
                              : 'bg-red-100 text-red-800 border-red-200'
                          }
                        >
                          {signal.payout_percent}
                        </Badge>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-xs text-gray-500">
                        {formatTime(signal.received_at)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                {Math.min(currentPage * itemsPerPage, filteredAndSortedSignals.length)} of{' '}
                {filteredAndSortedSignals.length} results
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className="w-8 h-8 p-0"
                      >
                        {page}
                      </Button>
                    )
                  })}
                  {totalPages > 5 && <span className="text-gray-400">...</span>}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
          {filteredAndSortedSignals.length === 0 && (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No signals found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Try adjusting your search criteria or filters
              </p>
            </div>
          )}
          </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}