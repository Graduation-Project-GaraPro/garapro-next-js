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
import { Trash2, Edit2, Plus, Search } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { PartCategoryService } from "@/services/manager/part-category-service"
import { Pagination } from "@/components/ui/pagination"
import PartCategoryForm from "./part-category-form"
import type { PartCategory, PaginatedResponse } from "@/types/manager/part-category"

export default function PartCategoriesTab() {
  const [categories, setCategories] = useState<PartCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<PartCategory | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [paginationData, setPaginationData] = useState<PaginatedResponse<PartCategory> | null>(null)
  const { toast } = useToast()

  const loadCategories = async () => {
    try {
      setLoading(true)
      let data: PaginatedResponse<PartCategory>
      
      if (searchTerm.trim()) {
        // Use search API when there's a search term
        data = await PartCategoryService.searchCategories({
          page: currentPage,
          pageSize: pageSize,
          searchTerm: searchTerm.trim(),
          sortBy: 'categoryName',
          sortOrder: 'asc'
        })
      } else {
        // Use paginated API for normal browsing
        data = await PartCategoryService.getCategoriesPaged({
          page: currentPage,
          pageSize: pageSize
        })
      }
      
      console.log('Categories data from API:', data) // Debug log
      setCategories(data.items)
      setPaginationData(data)
    } catch (error) {
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
  }, [currentPage, pageSize])

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
  }, [searchTerm])

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
    } catch (error) {
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
      } catch (error) {
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
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
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
                    {category.name || 'Unnamed Category'}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {category.description || 'No description provided'}
                  </p>
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