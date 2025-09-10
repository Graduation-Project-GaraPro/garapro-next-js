"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface WorkProgressTabProps {
  orderId: string
}

export default function WorkProgressTab({ orderId }: WorkProgressTabProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Work Progress - RO #{orderId}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">No work started yet.</p>
        </CardContent>
      </Card>
    </div>
  )
}
