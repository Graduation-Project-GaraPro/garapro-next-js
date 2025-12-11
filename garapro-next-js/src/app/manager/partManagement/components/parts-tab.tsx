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
import { branchService } from "@/services/branch-service"
import { Pagination } from "@/components/ui/pagination"
import PartForm from "./part-form"
import type { Part, PartCategory, PaginatedResponse } from "@/types/manager/part-category"

export default function PartsTab() {
  const [parts, setParts] = useState<Part[]>([])
  const [categories, setCategories] = useState<PartCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingPart, setEditingPart] = useState<Part | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
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
      
      // Load parts and categories
      const [partsResponse, categoriesData] = await Promise.all([
        searchTerm.trim() 
          ? PartCategoryService.searchParts({
              page: currentPage,
              pageSize: pageSize,
              searchTerm: searchTerm.trim()
            })
          : PartCategoryService.getPartsByBranchPaged(currentBranch.branchId, {
              page: currentPage,
              pageSize: pageSize
            }),
        PartCategoryService.getAllCategories()
      ])
      
      // Enrich parts with category names
      const enrichedParts = partsResponse.items.map((part) => {
        const category = categoriesData.find(cat => cat.id === part.partCategoryId)
        return {
          ...part,
          categoryName: category?.name || 'Unknown Category',
          branchName: currentBranch?.branchName || 'Unknown Branch'
        }
      })
      
      setParts(enrichedParts)
      setCategories(categoriesData)
      setPaginationData({
        ...partsResponse,
        items: enrichedParts
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load parts",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [currentPage, pageSize])

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
  }, [searchTerm])

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
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search parts by name or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Button onClick={handleAdd} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Part
        </Button>
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
                      <td className="px-4 py-3 text-sm font-semibold text-foreground">${part.price.toFixed(2)}</td>
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