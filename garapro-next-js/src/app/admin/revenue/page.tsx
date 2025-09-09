'use client'

import { useState, useEffect } from 'react'
import { Calendar, TrendingUp, TrendingDown, DollarSign, ShoppingCart, BarChart3, Download, PieChart, Activity } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LineChart, Line, BarChart, Bar, PieChart as RechartsPieChart, Cell, XAxis, YAxis,Pie, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { revenueService, RevenueReport, RevenueFilters } from '@/services/revenue-service'
import Link from 'next/link'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658']

export default function RevenuePage() {
  const [selectedPeriod, setSelectedPeriod] = useState('monthly')
  const [revenueData, setRevenueData] = useState<RevenueReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [activeTab, setActiveTab] = useState('overview')

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

  const handleExport = async (format: 'csv' | 'excel') => {
    try {
      const filters: RevenueFilters = {
        period: selectedPeriod as 'daily' | 'monthly' | 'yearly',
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
      alert('Failed to export report. Please try again.')
    }
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{`${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.dataKey}: ${entry.dataKey.includes('revenue') ? formatCurrency(entry.value) : entry.value}`}
            </p>
          ))}
        </div>
      )
    }
    return null
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
            Generate real-time financial reports with interactive charts
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
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
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
          {/* Revenue Overview Cards */}
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

          {/* Charts Section */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="trends" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Trends
              </TabsTrigger>
              <TabsTrigger value="services" className="flex items-center gap-2">
                <PieChart className="h-4 w-4" />
                Services
              </TabsTrigger>
              <TabsTrigger value="performance" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Performance
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue vs Orders Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue vs Orders Trend</CardTitle>
                    <CardDescription>Daily performance comparison</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={revenueData.branchComparison}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="branchName" />
                        <YAxis />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar dataKey="revenue" fill="#8884d8" name="Revenue" />
                        <Bar dataKey="orderCount" fill="#82ca9d" name="Orders" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Branch Comparison */}
                <Card>
                  <CardHeader>
                    <CardTitle>Branch Performance</CardTitle>
                    <CardDescription>Revenue comparison by branch</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={revenueData.branchComparison}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="branchName" />
                        <YAxis />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="revenue" fill="#0088FE" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="trends" className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                {/* Revenue Trend Over Time */}
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue Trend Analysis</CardTitle>
                    <CardDescription>Weekly revenue progression with growth indicators</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                      <AreaChart data={revenueData.branchComparison}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="branchName" />
                        <YAxis />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Area 
                          type="monotone" 
                          dataKey="revenue" 
                          stroke="#8884d8" 
                          fill="url(#colorRevenue)" 
                          strokeWidth={3}
                          name="Revenue"
                        />
                        <Area 
                          type="monotone" 
                          dataKey="orderCount" 
                          stroke="#82ca9d" 
                          fill="url(#colorOrders)" 
                          strokeWidth={2}
                          name="Orders"
                        />
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1}/>
                          </linearGradient>
                          <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#82ca9d" stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="services" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Service Revenue Pie Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue by Service</CardTitle>
                    <CardDescription>Distribution of revenue across services</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsPieChart>
                        <Pie
                          data={revenueData.topServices}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({serviceName, percentageOfTotal}) => `${serviceName} (${percentageOfTotal}%)`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="revenue"
                        >
                          {revenueData.topServices.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Service Orders Bar Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Orders by Service</CardTitle>
                    <CardDescription>Number of orders for each service type</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={revenueData.topServices} layout="horizontal">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="serviceName" type="category" width={80} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="orderCount" fill="#00C49F" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Top Services List */}
              <Card>
                <CardHeader>
                  <CardTitle>Service Performance Details</CardTitle>
                  <CardDescription>Detailed breakdown of top performing services</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {revenueData.topServices.map((service, index) => (
                      <div key={service.serviceName} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                            {index + 1}
                          </Badge>
                          <div>
                            <div className="font-medium">{service.serviceName}</div>
                            <div className="text-sm text-muted-foreground">
                              {service.orderCount} orders • Avg: {formatCurrency(service.revenue / service.orderCount)}
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
            </TabsContent>

            <TabsContent value="performance" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Technician Performance */}
                <Card>
                  <CardHeader>
                    <CardTitle>Technician Revenue</CardTitle>
                    <CardDescription>Performance comparison by technician</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={revenueData.revenueByTechnician}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="technicianName" />
                        <YAxis />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="revenue" fill="#FFBB28" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Branch Growth Rates */}
                <Card>
                  <CardHeader>
                    <CardTitle>Branch Growth Rates</CardTitle>
                    <CardDescription>Growth comparison across all branches</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={revenueData.branchComparison}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="branchName" />
                        <YAxis />
                        <Tooltip content={<CustomTooltip />} />
                        <Line 
                          type="monotone" 
                          dataKey="growthRate" 
                          stroke="#FF8042" 
                          strokeWidth={3}
                          dot={{ fill: '#FF8042', strokeWidth: 2, r: 6 }}
                          name="Growth Rate (%)"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Performance Summary Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Comprehensive Performance Summary</CardTitle>
                  <CardDescription>Detailed performance metrics for all team members</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-4 font-medium">Technician</th>
                          <th className="text-right p-4 font-medium">Revenue</th>
                          <th className="text-right p-4 font-medium">Orders</th>
                          <th className="text-right p-4 font-medium">Avg Order</th>
                          <th className="text-right p-4 font-medium">Performance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {revenueData.revenueByTechnician.map((tech, index) => (
                          <tr key={tech.technicianId} className="border-b hover:bg-gray-50">
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">{index + 1}</Badge>
                                {tech.technicianName}
                              </div>
                            </td>
                            <td className="text-right p-4 font-medium">{formatCurrency(tech.revenue)}</td>
                            <td className="text-right p-4">{tech.orderCount}</td>
                            <td className="text-right p-4">{formatCurrency(tech.averageOrderValue)}</td>
                            <td className="text-right p-4">
                              <Badge variant={index === 0 ? "default" : "secondary"}>
                                {index === 0 ? "Top Performer" : `#${index + 1}`}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

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