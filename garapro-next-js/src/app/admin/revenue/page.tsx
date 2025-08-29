'use client'

import { useState, useEffect } from 'react'
import { Calendar, TrendingUp, TrendingDown, DollarSign, ShoppingCart, BarChart3, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { revenueService, RevenueReport, RevenueFilters } from '@/services/revenue-service'
import Link from 'next/link'

export default function RevenuePage() {
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'monthly' | 'yearly'>('monthly')
  const [revenueData, setRevenueData] = useState<RevenueReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)

  useEffect(() => {
    loadRevenueData()
  }, [selectedPeriod, selectedDate, selectedYear, selectedMonth])

  const loadRevenueData = async () => {
    try {
      setLoading(true)
      let data: RevenueReport

      switch (selectedPeriod) {
        case 'daily':
          data = await revenueService.getDailyRevenue(selectedDate)
          break
        case 'monthly':
          data = await revenueService.getMonthlyRevenue(selectedYear, selectedMonth)
          break
        case 'yearly':
          data = await revenueService.getYearlyRevenue(selectedYear)
          break
        default:
          data = await revenueService.getMonthlyRevenue(selectedYear, selectedMonth)
      }

      setRevenueData(data)
    } catch (error) {
      console.error('Failed to load revenue data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num)
  }

  const getGrowthIcon = (growthRate: number) => {
    if (growthRate > 0) {
      return <TrendingUp className="h-4 w-4 text-green-600" />
    } else if (growthRate < 0) {
      return <TrendingDown className="h-4 w-4 text-red-600" />
    }
    return null
  }

  const getGrowthColor = (growthRate: number) => {
    if (growthRate > 0) return 'text-green-600'
    if (growthRate < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  const handleExport = async (format: 'csv' | 'excel' | 'pdf') => {
    try {
      const filters: RevenueFilters = {
        period: selectedPeriod,
        startDate: selectedDate,
        endDate: selectedDate,
      }
      
      const blob = await revenueService.exportRevenueReport(filters, format)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `revenue-report-${selectedPeriod}-${selectedDate}.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Failed to export report:', error)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">Loading revenue data...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Revenue Reports</h1>
          <p className="text-muted-foreground">
            Generate real-time financial reports by time period
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleExport('csv')}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={() => handleExport('excel')}>
            <Download className="mr-2 h-4 w-4" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Period Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Report Period</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-center">
            <Select value={selectedPeriod} onValueChange={(value: 'daily' | 'monthly' | 'yearly') => setSelectedPeriod(value)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily Reports</SelectItem>
                <SelectItem value="monthly">Monthly Reports</SelectItem>
                <SelectItem value="yearly">Yearly Reports</SelectItem>
              </SelectContent>
            </Select>

            {selectedPeriod === 'daily' && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="border rounded px-3 py-2"
                />
              </div>
            )}

            {selectedPeriod === 'monthly' && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                      <SelectItem key={month} value={month.toString()}>
                        {new Date(2024, month - 1).toLocaleString('default', { month: 'long' })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {selectedPeriod === 'yearly' && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {revenueData && (
        <>
          {/* Revenue Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(revenueData.totalRevenue)}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  {getGrowthIcon(revenueData.growthRate)}
                  <span className={`ml-1 ${getGrowthColor(revenueData.growthRate)}`}>
                    {revenueData.growthRate > 0 ? '+' : ''}{revenueData.growthRate.toFixed(1)}% from previous period
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(revenueData.totalOrders)}</div>
                <p className="text-xs text-muted-foreground">
                  Average: {formatCurrency(revenueData.averageOrderValue)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${getGrowthColor(revenueData.growthRate)}`}>
                  {revenueData.growthRate > 0 ? '+' : ''}{revenueData.growthRate.toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  vs {formatCurrency(revenueData.previousPeriodRevenue)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Period</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold capitalize">{selectedPeriod}</div>
                <p className="text-xs text-muted-foreground">
                  {selectedPeriod === 'daily' && selectedDate}
                  {selectedPeriod === 'monthly' && `${new Date(2024, selectedMonth - 1).toLocaleString('default', { month: 'long' })} ${selectedYear}`}
                  {selectedPeriod === 'yearly' && selectedYear}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Top Services */}
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Services</CardTitle>
              <CardDescription>
                Services generating the highest revenue this period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {revenueData.topServices.slice(0, 5).map((service, index) => (
                  <div key={service.serviceName} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                        {index + 1}
                      </Badge>
                      <div>
                        <div className="font-medium">{service.serviceName}</div>
                        <div className="text-sm text-muted-foreground">
                          {service.orderCount} orders
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(service.revenue)}</div>
                      <div className="text-sm text-muted-foreground">
                        {service.percentageOfTotal.toFixed(1)}% of total
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Detailed Reports</CardTitle>
                <CardDescription>
                  Access comprehensive revenue analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href={`/admin/revenue/${selectedPeriod}`}>
                  <Button variant="outline" className="w-full justify-start">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    View Detailed {selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)} Report
                  </Button>
                </Link>
                <Link href="/admin/revenue/branches">
                  <Button variant="outline" className="w-full justify-start">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Branch Comparison
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Export Options</CardTitle>
                <CardDescription>
                  Download reports in various formats
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" onClick={() => handleExport('csv')}>
                  <Download className="mr-2 h-4 w-4" />
                  Export as CSV
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => handleExport('excel')}>
                  <Download className="mr-2 h-4 w-4" />
                  Export as Excel
                </Button>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
