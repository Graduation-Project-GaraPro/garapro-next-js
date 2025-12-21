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
import { Pagination } from "@/components/ui/pagination"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import PartCategoryForm from "./part-category-form"
import type { PartCategory, PaginatedResponse } from "@/types/manager/part-category"

export default function PartCategoriesTab() {
  const [categories, setCategories] = useState<PartCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<PartCategory | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<'all' | 'model' | 'brand' | 'vehicle'>('all')
  const [filterValue, setFilterValue] = useState("")
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [paginationData, setPaginationData] = useState<PaginatedResponse<PartCategory> | null>(null)
  const { toast } = useToast()

  const loadCategories = async () => {
    try {
      setLoading(true)
      let data: PaginatedResponse<PartCategory>
      
      const searchParams: any = {
        page: currentPage,
        pageSize: pageSize,
        sortBy: 'categoryName',
        sortOrder: 'asc'
      }

      // Add search term if provided
      if (searchTerm.trim()) {
        searchParams.searchTerm = searchTerm.trim()
      }

      // Add filter based on type
      if (filterType === 'model' && filterValue.trim()) {
        searchParams.modelName = filterValue.trim()
      } else if (filterType === 'brand' && filterValue.trim()) {
        searchParams.brandName = filterValue.trim()
      }

      if (searchTerm.trim() || (filterType !== 'all' && filterValue.trim())) {
        data = await PartCategoryService.searchCategories(searchParams)
      } else {
        data = await PartCategoryService.getCategoriesPaged({
          page: currentPage,
          pageSize: pageSize
        })
      }
      
      console.log('Categories data from API:', data) // Debug log
      
      // Filter to show only categories with vehicle info if filter is enabled
      let filteredItems = data.items
      if (filterType === 'vehicle') {
        filteredItems = data.items.filter(cat => cat.modelName || cat.brandName)
      }
      
      setCategories(filteredItems)
      setPaginationData({
        ...data,
        items: filteredItems,
        totalCount: filteredItems.length
      })
    } catch (error: unknown) {
      console.error("Failed to load categories:", error)
      toast({
        title: "Error",
        description: "Failed to load categories",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCategories()
  }, [currentPage, pageSize, filterType])

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1) // Reset to first page when searching
      } else {
        loadCategories()
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchTerm, filterValue])

  const handleFilterChange = (type: 'all' | 'model' | 'brand' | 'vehicle') => {
    setFilterType(type)
    setFilterValue("")
    setCurrentPage(1)
  }

  const getFilterLabel = () => {
    switch (filterType) {
      case 'model': return 'Filter by Model'
      case 'brand': return 'Filter by Brand'
      case 'vehicle': return 'Vehicle Only'
      default: return 'All Categories'
    }
  }

  const clearFilters = () => {
    setFilterType('all')
    setFilterValue("")
    setSearchTerm("")
    setCurrentPage(1)
  }

  const handleAdd = () => {
    setEditingCategory(null)
    setIsFormOpen(true)
  }

  const handleEdit = (category: PartCategory) => {
    setEditingCategory(category)
    setIsFormOpen(true)
  }

  const handleSave = async (formData: { name: string; description?: string }) => {
    try {
      if (editingCategory) {
        await PartCategoryService.updateCategory(editingCategory.id, formData)
        toast({
          title: "Success",
          description: "Category updated successfully",
        })
      } else {
        await PartCategoryService.createCategory(formData)
        toast({
          title: "Success",
          description: "Category created successfully",
        })
      }
      setIsFormOpen(false)
      setEditingCategory(null)
      loadCategories()
    } catch (error: unknown) {
      console.error(`Failed to ${editingCategory ? 'update' : 'create'} category:`, error)
      toast({
        title: "Error",
        description: `Failed to ${editingCategory ? 'update' : 'create'} category`,
        variant: "destructive",
      })
    }
  }

  const handleDelete = async () => {
    if (deleteId) {
      try {
        await PartCategoryService.deleteCategory(deleteId)
        toast({
          title: "Success",
          description: "Category deleted successfully",
        })
        setDeleteId(null)
        loadCategories()
      } catch (error: unknown) {
        console.error("Failed to delete category:", error)
        toast({
          title: "Error",
          description: "Failed to delete category",
          variant: "destructive",
        })
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">Loading categories...</div>
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
              placeholder="Search categories..."
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
                All Categories
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
          {(filterType !== 'all' || searchTerm || filterValue) && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear
            </Button>
          )}
        </div>

        {/* Filter Input for Model/Brand */}
        {(filterType === 'model' || filterType === 'brand') && (
          <div className="flex-1 max-w-xs">
            <Input
              placeholder={`Enter ${filterType} name...`}
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
            />
          </div>
        )}

        <Button onClick={handleAdd} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Category
        </Button>
      </div>

      {/* Categories Grid */}
      {categories.length > 0 ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <Card key={category.id} className="flex flex-col gap-4 border border-border p-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground text-lg mb-2">
                    {category.description || category.name || 'No description available'}
                  </h3>
                  {(category.modelName || category.brandName) && (
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {category.brandName} {category.modelName}
                      </span>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Created: {new Date(category.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button key={`edit-${category.id}`} variant="outline" size="sm" onClick={() => handleEdit(category)} className="flex-1 gap-2">
                    <Edit2 className="h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    key={`delete-${category.id}`}
                    variant="outline"
                    size="sm"
                    onClick={() => setDeleteId(category.id)}
                    className="flex-1 gap-2 text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </Card>
            ))}
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
          <p className="text-muted-foreground">No categories found</p>
        </Card>
      )}

      {/* Form Modal */}
      <PartCategoryForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSave={handleSave}
        initialData={editingCategory || undefined}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this category? This action cannot be undone.
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