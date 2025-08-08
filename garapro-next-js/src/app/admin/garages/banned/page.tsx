import { BannedGaragesManagement } from '@/components/admin/BannedGaragesManagement'

export default function BannedGaragesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Banned Garages</h1>
          <p className="text-gray-600">Manage banned garage accounts and review ban reasons</p>
        </div>
      </div>

      <BannedGaragesManagement />
    </div>
  )
} 