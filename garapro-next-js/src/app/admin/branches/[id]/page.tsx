'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { branchService, GarageBranch } from '@/services/branch-service'

export default function BranchDetailPage() {
  const params = useParams()
  const branchId = params.id as string
  const [branch, setBranch] = useState<GarageBranch | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const data = await branchService.getBranchById(branchId)
        setBranch(data)
      } finally {
        setLoading(false)
      }
    }
    if (branchId) load()
  }, [branchId])

  const getStatusBadge = (isActive: boolean) => (
    isActive ? <Badge className="bg-green-100 text-green-800">Active</Badge> : <Badge variant="secondary">Inactive</Badge>
  )

  if (loading) return <div className="space-y-6"><div className="text-center py-8">Loading branch...</div></div>
  if (!branch) return <div className="space-y-6"><div className="text-center py-8">Branch not found</div></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/branches">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Branches
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Branch Details</h1>
          <p className="text-muted-foreground">Overview of {branch.name}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Overview</CardTitle>
          <CardDescription>Location, contact and status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Manager</div>
              <div className="font-medium">{branch.managerName}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Location</div>
              <div className="font-medium">{branch.city}, {branch.state}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Contact</div>
              <div className="font-medium">{branch.phone}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Status</div>
              <div>{getStatusBadge(branch.isActive)}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Services</CardTitle>
          <CardDescription>Available at this branch</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {branch.services.map(s => (
              <div key={s.id} className="p-3 border rounded-lg">
                <div className="font-medium">{s.name}</div>
                <div className="text-sm text-muted-foreground">{s.description}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Staff</CardTitle>
          <CardDescription>Team members</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {branch.staff.map(s => (
              <div key={s.id} className="p-3 border rounded-lg">
                <div className="font-medium">{s.name} • {s.role}</div>
                <div className="text-sm text-muted-foreground">{s.email} • {s.phone}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


