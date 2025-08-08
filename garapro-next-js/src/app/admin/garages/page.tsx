import { GarageManagement } from '@/components/admin/GarageManagement'

export default function GaragesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Garage Management</h1>
          <p className="text-gray-600">Manage garage accounts and their domains</p>
        </div>
      </div>

      <GarageManagement />
    </div>
  )
} 