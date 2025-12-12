"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import PartCategoriesTab from "./components/part-categories-tab"
import PartsTab from "./components/parts-tab"
import { Wrench, Package } from "lucide-react"

export default function PartManagementPage() {
  const [activeTab, setActiveTab] = useState("categories")

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-3">
              <Wrench className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Part Management</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Manage part categories and parts inventory
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Card className="border border-border bg-card">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 border-b border-border rounded-none bg-transparent p-0">
              <TabsTrigger
                value="categories"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                <Package className="mr-2 h-4 w-4" />
                Categories
              </TabsTrigger>
              <TabsTrigger
                value="parts"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                <Wrench className="mr-2 h-4 w-4" />
                Parts
              </TabsTrigger>
            </TabsList>

            <div className="p-6">
              <TabsContent value="categories" className="mt-0">
                <PartCategoriesTab />
              </TabsContent>
              <TabsContent value="parts" className="mt-0">
                <PartsTab />
              </TabsContent>
            </div>
          </Tabs>
        </Card>
      </div>
    </div>
  )
}