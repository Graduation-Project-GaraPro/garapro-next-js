'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BarChart3, Download, ArrowUp, ArrowDown } from 'lucide-react'
import { RevenueReport, revenueService } from '@/services/revenue-service'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export default function DetailedRevenueReport() {
  const params = useParams()
  const period = params.period as string
  const [report, setReport] = useState<RevenueReport | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchReport = async () => {
      setIsLoading(true)
      try {
        let data: RevenueReport
        
        // Xác định loại báo cáo dựa trên period
        if (period === 'daily') {
          const today = new Date()
          const dateStr = today.toISOString().split('T')[0]
          data = await revenueService.getDailyRevenue(dateStr)
        } else if (period === 'monthly') {
          const today = new Date()
          data = await revenueService.getMonthlyRevenue(today.getFullYear(), today.getMonth() + 1)
        } else if (period === 'yearly') {
          const today = new Date()
          data = await revenueService.getYearlyRevenue(today.getFullYear())
        } else {
          data = await revenueService.getRevenueReport({ period: period as any })
        }
        
        setReport(data)
      } catch (error) {
        console.error('Failed to fetch revenue report:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchReport()
  }, [period])

  const handleExport = async (format: 'csv' | 'excel') => {
    try {
      const filters = {
        period: period as 'daily' | 'monthly' | 'yearly'
      }
      const blob = await revenueService.exportRevenueReport(filters, format)
      
      // Tạo URL tải xuống
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = `revenue-report-${period}.${format === 'csv' ? 'csv' : 'xlsx'}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export failed:', error)
      alert('Failed to export report. Please try again.')
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <p>Loading report...</p>
        </div>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <p>Failed to load revenue report.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          {period.charAt(0).toUpperCase() + period.slice(1)} Revenue Report
        </h1>
        <div className="space-x-2">
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

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${report.totalRevenue.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {report.growthRate >= 0 ? (
                <ArrowUp className="h-3 w-3 text-green-600" />
              ) : (
                <ArrowDown className="h-3 w-3 text-red-600" />
              )}
              <span className={report.growthRate >= 0 ? 'text-green-600' : 'text-red-600'}>
                {Math.abs(report.growthRate)}% from previous period
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{report.totalOrders.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${report.averageOrderValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${report.growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {report.growthRate >= 0 ? '+' : ''}{report.growthRate}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Top Services Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Top Services</CardTitle>
            <CardDescription>Revenue by service type</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={report.topServices}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ serviceName, percentageOfTotal }) => `${serviceName}: ${percentageOfTotal}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="revenue"
                  nameKey="serviceName"
                >
                  {report.topServices.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Technician Performance Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Technician Performance</CardTitle>
            <CardDescription>Revenue by technician</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={report.revenueByTechnician}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 60,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="technicianName" angle={-45} textAnchor="end" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
                <Legend />
                <Bar dataKey="revenue" name="Revenue" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Branch Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle>Branch Performance</CardTitle>
          <CardDescription>Revenue comparison across branches</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4">Branch</th>
                  <th className="text-right p-4">Revenue</th>
                  <th className="text-right p-4">Orders</th>
                  <th className="text-right p-4">Growth</th>
                </tr>
              </thead>
              <tbody>
                {report.branchComparison.map((branch) => (
                  <tr key={branch.branchId} className="border-b">
                    <td className="p-4 font-medium">{branch.branchName}</td>
                    <td className="p-4 text-right">${branch.revenue.toLocaleString()}</td>
                    <td className="p-4 text-right">{branch.orderCount.toLocaleString()}</td>
                    <td className="p-4 text-right">
                      <div className={`flex items-center justify-end ${branch.growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {branch.growthRate >= 0 ? (
                          <ArrowUp className="h-3 w-3 mr-1" />
                        ) : (
                          <ArrowDown className="h-3 w-3 mr-1" />
                        )}
                        {Math.abs(branch.growthRate)}%
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}