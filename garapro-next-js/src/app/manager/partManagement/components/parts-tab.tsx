"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Trash2, Edit2, Plus, Search, Filter, ChevronDown } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { PartCategoryService } from "@/services/manager/part-category-service"
import { branchService } from "@/services/branch-service"
import { Pagination } from "@/components/ui/pagination"
import { formatVND } from "@/lib/currency"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import PartForm from "./part-form"
import type { Part, PartCategory, PaginatedResponse } from "@/types/manager/part-category"

export default function PartsTab() {
  const [parts, setParts] = useState<Part[]>([])
  const [categories, setCategories] = useState<PartCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingPart, setEditingPart] = useState<Part | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<'all' | 'category' | 'model' | 'brand'>('all')
  const [categoryNameFilter, setCategoryNameFilter] = useState("")
  const [modelNameFilter, setModelNameFilter] = useState("")
  const [brandNameFilter, setBrandNameFilter] = useState("")
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [paginationData, setPaginationData] = useState<PaginatedResponse<Part> | null>(null)
  const [currentBranchId, setCurrentBranchId] = useState<string>("")
  const { toast } = useToast()

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Get current branch info
      let currentBranch = null
      try {
        currentBranch = await branchService.getCurrentUserBranch("")
        if (currentBranch) {
          setCurrentBranchId(currentBranch.branchId)
        }
      } catch (error) {
        console.warn("Could not load branch info:", error)
      }
      
      if (!currentBranch?.branchId) {
        toast({
          title: "Error",
          description: "Could not determine current branch",
          variant: "destructive",
        })
        return
      }
      
      // Build search parameters for server-side filtering
      const searchParams: any = {
        page: currentPage,
        pageSize: pageSize
      }

      // Only add parameters if they have values to avoid API issues
      if (searchTerm.trim()) {
        searchParams.searchTerm = searchTerm.trim()
      }

      if (filterType === 'category' && categoryNameFilter.trim()) {
        searchParams.categoryName = categoryNameFilter.trim()
      } else if (filterType === 'model' && modelNameFilter.trim()) {
        searchParams.modelName = modelNameFilter.trim()
      } else if (filterType === 'brand' && brandNameFilter.trim()) {
        searchParams.brandName = brandNameFilter.trim()
      }

      // Load parts and categories
      let partsResponse
      try {
        // If no filters are applied, use the simpler getAllPartsPaged method
        if (filterType === 'all' && !searchTerm.trim()) {
          partsResponse = await PartCategoryService.getAllPartsPaged({
            page: currentPage,
            pageSize: pageSize
          })
        } else {
          // Use search API with filters
          partsResponse = await PartCategoryService.searchParts(searchParams)
        }
      } catch (searchError) {
        console.warn("Search API failed, falling back to branch-specific API:", searchError)
        // Fallback to branch-specific API if search fails
        partsResponse = await PartCategoryService.getPartsByBranchPaged(currentBranch.branchId, {
          page: currentPage,
          pageSize: pageSize
        })
      }

      const categoriesData = await PartCategoryService.getAllCategories()
      
      // Enrich parts with category names and vehicle info
      let enrichedParts = partsResponse.items.map((part) => {
        const category = categoriesData.find(cat => cat.id === part.partCategoryId)
        return {
          ...part,
          categoryName: part.categoryName || category?.name || 'Unknown Category',
          branchName: currentBranch?.branchName || 'Unknown Branch',
          // Use part's vehicle info if available, otherwise fall back to category
          modelName: part.modelName || category?.modelName,
          brandName: part.brandName || category?.brandName
        }
      })

      // Apply client-side filtering if server-side search failed
      if (searchParams.categoryName && !partsResponse.items.some(p => p.categoryName)) {
        enrichedParts = enrichedParts.filter(part => 
          part.categoryName?.toLowerCase().includes(categoryNameFilter.toLowerCase())
        )
      }
      if (searchParams.modelName && !partsResponse.items.some(p => p.modelName)) {
        enrichedParts = enrichedParts.filter(part => 
          part.modelName?.toLowerCase().includes(modelNameFilter.toLowerCase())
        )
      }
      if (searchParams.brandName && !partsResponse.items.some(p => p.brandName)) {
        enrichedParts = enrichedParts.filter(part => 
          part.brandName?.toLowerCase().includes(brandNameFilter.toLowerCase())
        )
      }
      
      setParts(enrichedParts)
      setCategories(categoriesData)
      setPaginationData({
        ...partsResponse,
        items: enrichedParts,
        totalCount: enrichedParts.length
      })
    } catch (error) {
      console.error("Failed to load parts:", error)
      toast({
        title: "Error",
        description: "Failed to load parts. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [currentPage, pageSize, filterType])

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1) // Reset to first page when searching
      } else {
        loadData()
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchTerm, categoryNameFilter, modelNameFilter, brandNameFilter])

  const handleFilterChange = (type: 'all' | 'category' | 'model' | 'brand') => {
    setFilterType(type)
    setCategoryNameFilter("")
    setModelNameFilter("")
    setBrandNameFilter("")
    setCurrentPage(1)
  }

  const getFilterLabel = () => {
    switch (filterType) {
      case 'category': return 'Filter by Category'
      case 'model': return 'Filter by Model'
      case 'brand': return 'Filter by Brand'
      default: return 'All Parts'
    }
  }

  const clearFilters = () => {
    setFilterType('all')
    setCategoryNameFilter("")
    setModelNameFilter("")
    setBrandNameFilter("")
    setSearchTerm("")
    setCurrentPage(1)
  }

  const hasActiveFilters = filterType !== 'all' || searchTerm || categoryNameFilter || modelNameFilter || brandNameFilter

  const handleAdd = () => {
    setEditingPart(null)
    setIsFormOpen(true)
  }

  const handleEdit = (part: Part) => {
    setEditingPart(part)
    setIsFormOpen(true)
  }

  const handleSave = async (formData: {
    name: string
    partCategoryId: string
    branchId?: string
    price: number
    stock: number
  }) => {
    try {
      if (editingPart) {
        // For updates, don't send branchId
        const updateData = {
          name: formData.name,
          partCategoryId: formData.partCategoryId,
          price: formData.price,
          stock: formData.stock
        }
        await PartCategoryService.updatePart(editingPart.id, updateData)
        toast({
          title: "Success",
          description: "Part updated successfully",
        })
      } else {
        // For creates, include branchId
        if (!formData.branchId) {
          toast({
            title: "Error",
            description: "Branch ID is required for new parts",
            variant: "destructive",
          })
          return
        }
        const createData = {
          name: formData.name,
          partCategoryId: formData.partCategoryId,
          branchId: formData.branchId,
          price: formData.price,
          stock: formData.stock
        }
        await PartCategoryService.createPart(createData)
        toast({
          title: "Success",
          description: "Part created successfully",
        })
      }
      setIsFormOpen(false)
      setEditingPart(null)
      loadData()
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${editingPart ? 'update' : 'create'} part`,
        variant: "destructive",
      })
    }
  }

  const handleDelete = async () => {
    if (deleteId) {
      try {
        await PartCategoryService.deletePart(deleteId)
        toast({
          title: "Success",
          description: "Part deleted successfully",
        })
        setDeleteId(null)
        loadData()
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete part",
          variant: "destructive",
        })
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">Loading parts...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Search and Add Button */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-4 flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search parts by name or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {/* Filter Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant={filterType !== 'all' ? "default" : "outline"}
                className="gap-2 min-w-[140px]"
              >
                <Filter className="h-4 w-4" />
                {getFilterLabel()}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => handleFilterChange('all')}>
                All Parts
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleFilterChange('category')}>
                Filter by Category
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleFilterChange('model')}>
                Filter by Model Name
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleFilterChange('brand')}>
                Filter by Brand Name
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear
            </Button>
          )}
        </div>

        {/* Filter Controls */}
        <div className="flex gap-4 items-center">
          {filterType === 'category' && (
            <Input
              placeholder="Enter category name..."
              value={categoryNameFilter}
              onChange={(e) => setCategoryNameFilter(e.target.value)}
              className="w-48"
            />
          )}

          {filterType === 'model' && (
            <Input
              placeholder="Enter model name..."
              value={modelNameFilter}
              onChange={(e) => setModelNameFilter(e.target.value)}
              className="w-48"
            />
          )}

          {filterType === 'brand' && (
            <Input
              placeholder="Enter brand name..."
              value={brandNameFilter}
              onChange={(e) => setBrandNameFilter(e.target.value)}
              className="w-48"
            />
          )}

          <Button onClick={handleAdd} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Part
          </Button>
        </div>
      </div>

      {/* Parts Table */}
      {parts.length > 0 ? (
        <>
          <div className="overflow-hidden rounded-lg border border-border">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-border bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Name</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Category</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Vehicle</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Price</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Stock</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {parts.map((part) => (
                    <tr key={part.id} className="border-b border-border hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <p className="font-medium text-foreground">{part.name}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground">{part.categoryName}</td>
                      <td className="px-4 py-3 text-sm text-foreground">
                        {part.brandName || part.modelName ? (
                          <div className="flex flex-col gap-1">
                            {part.brandName && (
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded w-fit">
                                {part.brandName}
                              </span>
                            )}
                            {part.modelName && (
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded w-fit">
                                {part.modelName}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">No vehicle info</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-foreground">{formatVND(part.price)}</td>
                      <td className="px-4 py-3 text-sm text-foreground">{part.stock}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <Button key={`edit-${part.id}`} variant="ghost" size="sm" onClick={() => handleEdit(part)}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            key={`delete-${part.id}`}
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteId(part.id)}
                            className="text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Pagination */}
          {paginationData && (
            <Pagination
              currentPage={paginationData.page}
              totalPages={paginationData.totalPages}
              pageSize={paginationData.pageSize}
              totalCount={paginationData.totalCount}
              hasPreviousPage={paginationData.hasPreviousPage}
              hasNextPage={paginationData.hasNextPage}
              onPageChange={setCurrentPage}
              onPageSizeChange={(newPageSize) => {
                setPageSize(newPageSize)
                setCurrentPage(1)
              }}
            />
          )}
        </>
      ) : (
        <Card className="border border-border p-8 text-center">
          <p className="text-muted-foreground">No parts found</p>
        </Card>
      )}

      {/* Form Modal */}
      <PartForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSave={handleSave}
        initialData={editingPart || undefined}
        categories={categories}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Part</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this part? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}