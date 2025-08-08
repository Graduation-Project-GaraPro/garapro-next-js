import { DomainManagement } from '@/components/admin/DomainManagement'

export default function DomainManagementPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Domain Management</h1>
          <p className="text-gray-600">Manage garage subdomains and DNS settings</p>
        </div>
      </div>

      <DomainManagement />
    </div>
  )
} 