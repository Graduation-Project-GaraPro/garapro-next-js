import { DashboardOverview } from '@/components/admin/DashboardOverview'
import { QuickActions } from '@/components/admin/QuickActions'
import { RecentActivity } from '@/components/admin/RecentActivity'
import { SystemStats } from '@/components/admin/SystemStats'

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Manage your system and monitor performance</p>
        </div>
      </div>

      <DashboardOverview />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <QuickActions />
        <RecentActivity />
      </div>

      <SystemStats />
    </div>
  )
} 