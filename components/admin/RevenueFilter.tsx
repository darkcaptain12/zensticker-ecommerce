'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar, TrendingUp, DollarSign, Filter } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface RevenueData {
  total: number
  daily: number
  weekly: number
  monthly: number
  yearly: number
  today: number
  thisMonth: number
  thisYear: number
  monthlyBreakdown: Array<{
    month: string
    revenue: number
    count: number
  }>
}

interface RevenueFilterProps {
  initialData: RevenueData
}

type FilterPeriod = 'today' | 'week' | 'month' | 'year' | 'all' | 'custom'

export function RevenueFilter({ initialData }: RevenueFilterProps) {
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>('all')
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')
  const [revenueData, setRevenueData] = useState<RevenueData>(initialData)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const fetchFilteredRevenue = async (period: FilterPeriod, startDate?: string, endDate?: string) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('period', period)
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)

      const response = await fetch(`/api/admin/revenue?${params.toString()}`)
      const data = await response.json()
      
      if (response.ok) {
        setRevenueData(data)
      }
    } catch (error) {
      console.error('Error fetching revenue:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (filterPeriod !== 'custom') {
      fetchFilteredRevenue(filterPeriod)
    }
  }, [filterPeriod])

  const handleCustomDateFilter = () => {
    if (customStartDate && customEndDate) {
      fetchFilteredRevenue('custom', customStartDate, customEndDate)
      setIsDialogOpen(false)
    }
  }

  const getDisplayValue = () => {
    switch (filterPeriod) {
      case 'today':
        return formatPrice(revenueData.today)
      case 'week':
        return formatPrice(revenueData.weekly)
      case 'month':
        return formatPrice(revenueData.thisMonth)
      case 'year':
        return formatPrice(revenueData.thisYear)
      case 'custom':
        return formatPrice(revenueData.total)
      default:
        return formatPrice(revenueData.total)
    }
  }

  return (
    <>
      <Card className="hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/50 cursor-pointer">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
            Toplam Gelir
          </CardTitle>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded-lg">
            <DollarSign className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl md:text-3xl font-bold mb-1" onClick={() => setIsDialogOpen(true)}>
            {loading ? 'Yükleniyor...' : getDisplayValue()}
          </div>
          <div className="flex items-center justify-between mt-3">
            <Select value={filterPeriod} onValueChange={(value: FilterPeriod) => setFilterPeriod(value)}>
              <SelectTrigger className="w-[140px] h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Zamanlar</SelectItem>
                <SelectItem value="today">Bugün</SelectItem>
                <SelectItem value="week">Bu Hafta</SelectItem>
                <SelectItem value="month">Bu Ay</SelectItem>
                <SelectItem value="year">Bu Yıl</SelectItem>
                <SelectItem value="custom">Özel Tarih</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDialogOpen(true)}
              className="h-8 text-xs"
            >
              <Filter className="h-3 w-3 mr-1" />
              Detaylar
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Gelir Detayları ve Filtreleme</DialogTitle>
            <DialogDescription>
              Gelir istatistiklerini detaylı olarak görüntüleyin ve filtreleyin
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Filter Options */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button
                variant={filterPeriod === 'today' ? 'default' : 'outline'}
                onClick={() => {
                  setFilterPeriod('today')
                  fetchFilteredRevenue('today')
                }}
                className="flex flex-col items-center gap-1 h-auto py-3"
              >
                <Calendar className="h-5 w-5" />
                <span className="text-xs">Bugün</span>
                <span className="text-sm font-bold">{formatPrice(revenueData.today)}</span>
              </Button>
              <Button
                variant={filterPeriod === 'week' ? 'default' : 'outline'}
                onClick={() => {
                  setFilterPeriod('week')
                  fetchFilteredRevenue('week')
                }}
                className="flex flex-col items-center gap-1 h-auto py-3"
              >
                <TrendingUp className="h-5 w-5" />
                <span className="text-xs">Bu Hafta</span>
                <span className="text-sm font-bold">{formatPrice(revenueData.weekly)}</span>
              </Button>
              <Button
                variant={filterPeriod === 'month' ? 'default' : 'outline'}
                onClick={() => {
                  setFilterPeriod('month')
                  fetchFilteredRevenue('month')
                }}
                className="flex flex-col items-center gap-1 h-auto py-3"
              >
                <TrendingUp className="h-5 w-5" />
                <span className="text-xs">Bu Ay</span>
                <span className="text-sm font-bold">{formatPrice(revenueData.thisMonth)}</span>
              </Button>
              <Button
                variant={filterPeriod === 'year' ? 'default' : 'outline'}
                onClick={() => {
                  setFilterPeriod('year')
                  fetchFilteredRevenue('year')
                }}
                className="flex flex-col items-center gap-1 h-auto py-3"
              >
                <DollarSign className="h-5 w-5" />
                <span className="text-xs">Bu Yıl</span>
                <span className="text-sm font-bold">{formatPrice(revenueData.thisYear)}</span>
              </Button>
            </div>

            {/* Custom Date Range */}
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Özel Tarih Aralığı</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Başlangıç Tarihi</label>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Bitiş Tarihi</label>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
              </div>
              <Button
                onClick={handleCustomDateFilter}
                disabled={!customStartDate || !customEndDate}
                className="mt-3"
              >
                Filtrele
              </Button>
            </div>

            {/* Monthly Breakdown */}
            {revenueData.monthlyBreakdown && revenueData.monthlyBreakdown.length > 0 && (
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Aylık Gelir Dağılımı</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {revenueData.monthlyBreakdown.map((month, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{month.month}</p>
                        <p className="text-sm text-gray-500">{month.count} sipariş</p>
                      </div>
                      <p className="font-bold text-primary">{formatPrice(month.revenue)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Summary */}
            <div className="border-t pt-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-xs text-gray-600 dark:text-gray-400">Günlük</p>
                  <p className="text-lg font-bold">{formatPrice(revenueData.daily)}</p>
                </div>
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-xs text-gray-600 dark:text-gray-400">Haftalık</p>
                  <p className="text-lg font-bold">{formatPrice(revenueData.weekly)}</p>
                </div>
                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <p className="text-xs text-gray-600 dark:text-gray-400">Aylık</p>
                  <p className="text-lg font-bold">{formatPrice(revenueData.monthly)}</p>
                </div>
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <p className="text-xs text-gray-600 dark:text-gray-400">Yıllık</p>
                  <p className="text-lg font-bold">{formatPrice(revenueData.yearly)}</p>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

