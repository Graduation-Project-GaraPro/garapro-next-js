"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { customerService } from "@/services/manager/customer-service"
import { toast } from "sonner"

interface Customer {
  id: string
  name: string
  phone: string
  email: string
  address: string
  vehicles: Vehicle[]
}

interface Vehicle {
  id: string
  licensePlate: string
  brand: string
  model: string
  year: number
  color: string
}

interface AddCustomerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCustomerAdd: (customer: Omit<Customer, "id" | "vehicles">) => void
}

export function AddCustomerDialog({ open, onOpenChange, onCustomerAdd }: AddCustomerDialogProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
  })
  const [isLoading, setIsLoading] = useState(false)

  const validateForm = (): string | null => {
    if (!formData.firstName.trim()) {
      return "First name is required"
    }
    
    if (formData.firstName.trim().length < 2) {
      return "First name must be at least 2 characters long"
    }
    
    if (!formData.phone.trim()) {
      return "Phone number is required"
    }
    
    if (formData.phone.trim().replace(/\D/g, '').length < 6) {
      return "Please enter a valid phone number"
    }
    
    // Email validation (optional field)
    if (formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email.trim())) {
        return "Please enter a valid email address"
      }
    }
    
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    // Prevent duplicate submissions
    if (isLoading) {
      return
    }
    
    setIsLoading(true)
    
    // Validate form before submission
    const validationError = validateForm()
    if (validationError) {
      toast.error(validationError)
      setIsLoading(false)
      return
    }
    
    try {
      const firstName = formData.firstName.trim()
      const lastName = formData.lastName.trim()
      
      // Use quick create endpoint with required fields and optional email
      const newCustomer = await customerService.quickCreateCustomer({
        firstName,
        lastName,
        phoneNumber: formData.phone,
        email: formData.email.trim() || undefined,
      })
      
      // Convert API customer to our format
      const customerName = lastName 
        ? `${newCustomer.firstName} ${newCustomer.lastName}` 
        : newCustomer.firstName;
        
      const customer: Omit<Customer, "id" | "vehicles"> = {
        name: customerName || "",
        phone: newCustomer.phoneNumber || "",
        email: newCustomer.email || "",
        address: ""
      }
      
      // Show success toast
      toast.success(`Customer "${customerName}" added successfully!`)
      
      onCustomerAdd(customer)
      setFormData({
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
      })
      onOpenChange(false)
      
    } catch (error: unknown) {
      // Extract detailed error message
      let errorMessage = "Failed to create customer. Please try again."
      
      if (error && typeof error === 'object') {
        // Check for details.details (nested error message from API)
        if ('details' in error && error.details && typeof error.details === 'object' && 'details' in error.details) {
          errorMessage = (error.details as any).details
        }
        // Check for message property
        else if ('message' in error && typeof error.message === 'string') {
          errorMessage = error.message
        }
      } else if (error instanceof Error) {
        errorMessage = error.message
      }
      
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Customer</DialogTitle>
          <DialogDescription>
            Quick add a new customer. First name, last name, and phone are required. Email is optional.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="firstName" className="text-right">
                First Name *
              </Label>
              <div className="col-span-3">
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="First name"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="lastName" className="text-right">
                Last Name *
              </Label>
              <div className="col-span-3">
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="Last name"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Phone *
              </Label>
              <div className="col-span-3">
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Phone number"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <div className="col-span-3">
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="customer@example.com"
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-500 mt-1">Optional</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Adding..." : "Add Customer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}