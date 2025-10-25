"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
    name: "",
    phone: "",
    email: "",
    address: "",
    birthday: "",
  })
  const [isLoading, setIsLoading] = useState(false)

  const validateForm = (): string | null => {
    // Validate required fields
    if (!formData.name.trim()) {
      return "Customer name is required"
    }
    
    // Check if name contains only valid characters
    if (formData.name.trim().length < 2) {
      return "Customer name must be at least 2 characters long"
    }
    
    if (!formData.phone.trim()) {
      return "Phone number is required"
    }
    
    // Basic phone validation (at least 6 digits)
    if (formData.phone.trim().replace(/\D/g, '').length < 6) {
      return "Please enter a valid phone number"
    }
    
    // Basic email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      return "Please enter a valid email address"
    }
    
    // Validate name parts
    const nameParts = formData.name.trim().split(' ')
    const firstName = nameParts[0] || ''
    
    if (!firstName || firstName.length < 1) {
      return "First name is required"
    }
    
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Validate form before submission
    const validationError = validateForm()
    if (validationError) {
      toast.error(validationError)
      setIsLoading(false)
      return
    }
    
    try {
      // Split name into first and last name
      const nameParts = formData.name.trim().split(' ')
      const firstName = nameParts[0] || ''
      const lastName = nameParts.slice(1).join(' ') || ''
      
      // Validate that we have valid name parts
      if (!firstName || firstName === 'undefined' || firstName.trim() === '') {
        toast.error("Please enter a valid first name")
        setIsLoading(false)
        return
      }
      
      // Format birthday - if empty, send null, otherwise send the date
      let birthdayValue: string | null = null
      if (formData.birthday) {
        birthdayValue = new Date(formData.birthday).toISOString()
      }
      
      // Create customer via API
      const newCustomer = await customerService.createCustomer({
        firstName,
        lastName,
        phoneNumber: formData.phone,
        email: formData.email,
        birthday: birthdayValue
      })
      
      // Convert API customer to our format
      // Ensure we don't show "undefined undefined" in the name
      const customerName = lastName 
        ? `${newCustomer.firstName} ${newCustomer.lastName}` 
        : newCustomer.firstName;
        
      const customer: Omit<Customer, "id" | "vehicles"> = {
        name: customerName || "", // Ensure name is never undefined
        phone: newCustomer.phoneNumber || "", // Ensure phone is never undefined
        email: newCustomer.email || "", // Ensure email is never undefined
        address: formData.address || "" // Address is only stored locally in this form
      }
      
      onCustomerAdd(customer)
      setFormData({
        name: "",
        phone: "",
        email: "",
        address: "",
        birthday: "",
      })
      onOpenChange(false)
      
    } catch (error: unknown) {
      console.error("Failed to create customer:", error)
      if (error instanceof Error) {
        // Show specific error messages in red
        toast.error(`Failed to create customer: ${error.message}`)
      } else {
        toast.error("Failed to create customer. Please check your input and try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      name: "",
      phone: "",
      email: "",
      address: "",
      birthday: "",
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Customer</DialogTitle>
          <DialogDescription>
            Add a new customer to the system. All fields except address and birthday are required.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name *
              </Label>
              <div className="col-span-3">
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Customer full name"
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
                  placeholder="Email address"
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="birthday" className="text-right">
                Birthday
              </Label>
              <div className="col-span-3">
                <Input
                  id="birthday"
                  type="date"
                  value={formData.birthday}
                  onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="address" className="text-right">
                Address
              </Label>
              <div className="col-span-3">
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Customer address"
                  className="resize-none"
                  disabled={isLoading}
                />
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