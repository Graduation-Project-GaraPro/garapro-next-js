"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useUserProfile } from "@/hooks/use-user-profile"
import { User, Mail, Phone, Shield } from "lucide-react"

export default function ManagerProfilePage() {
  const { user, loading, error } = useUserProfile()

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b border-border bg-card">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-3">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Profile</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Loading profile information...
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b border-border bg-card">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-destructive/10 p-3">
                <User className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Profile</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  {error || "Failed to load profile"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-3">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Profile</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Manage your account information
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          {/* Profile Card */}
          <Card className="md:col-span-1">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4">
                <Avatar className="h-24 w-24">
                  <AvatarFallback className="text-2xl font-semibold">
                    {user.initials}
                  </AvatarFallback>
                </Avatar>
              </div>
              <CardTitle className="text-xl">{user.fullName}</CardTitle>
              <Badge variant="secondary" className="mx-auto w-fit">
                Manager
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{user.email}</span>
                </div>
                {user.phoneNumber && (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{user.phoneNumber}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Details Card */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Account Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    First Name
                  </label>
                  <p className="mt-1 text-sm font-medium">{user.firstName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Last Name
                  </label>
                  <p className="mt-1 text-sm font-medium">{user.lastName}</p>
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Email Address
                  </label>
                  <p className="mt-1 text-sm font-medium">{user.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Phone Number
                  </label>
                  <p className="mt-1 text-sm font-medium">
                    {user.phoneNumber || "Not provided"}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Role
                  </label>
                  <p className="mt-1 text-sm font-medium">Manager</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Gender
                  </label>
                  <p className="mt-1 text-sm font-medium">
                    {user.gender || "Not specified"}
                  </p>
                </div>
              </div>

              {user.dateOfBirth && (
                <>
                  <Separator />
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Date of Birth
                    </label>
                    <p className="mt-1 text-sm font-medium">
                      {new Date(user.dateOfBirth).toLocaleDateString()}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}