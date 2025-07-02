"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { Employee } from "./page"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"

interface UpdateEmployeeProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (employee: Employee) => void
  employee: Employee
}

const roles = [
  "Software Engineer",
  "Product Manager",
  "Designer",
  "Marketing Manager",
  "Sales Representative",
  "HR Manager",
  "Finance Manager",
  "Data Analyst",
  "DevOps Engineer",
  "QA Engineer",
]

const rolesRequiringCertificate = ["Software Engineer", "Data Analyst", "DevOps Engineer", "QA Engineer", "Designer"]

export default function UpdateEmployee({ isOpen, onClose, onSubmit, employee }: UpdateEmployeeProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    role: "",
    payrollType: "salary" as "salary" | "hourly" | "contract",
    salary: "",
    certificate: "",
    status: "active" as "active" | "inactive",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Populate form with employee data when dialog opens
  useEffect(() => {
    if (employee) {
      setFormData({
        firstName: employee.firstName,
        lastName: employee.lastName,
        phone: employee.phone,
        email: employee.email,
        role: employee.role,
        payrollType: employee.payrollType,
        salary: employee.salary,
        certificate: employee.certificate || "",
        status: employee.status,
      })
    }
  }, [employee])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required"
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required"
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    if (!formData.role) {
      newErrors.role = "Role is required"
    }

    if (!formData.salary.trim()) {
      newErrors.salary = "Salary is required"
    }

    if (rolesRequiringCertificate.includes(formData.role) && !formData.certificate.trim()) {
      newErrors.certificate = "Certificate is required for this role"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (validateForm()) {
      const updatedEmployee: Employee = {
        id: employee.id,
        ...formData,
      }
      onSubmit(updatedEmployee)
      setErrors({})
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }))
    }
  }

  const handleClose = () => {
    setErrors({})
    onClose()
  }

  const getSalaryPlaceholder = () => {
    switch (formData.payrollType) {
      case "salary":
        return "$75,000"
      case "hourly":
        return "$25/hour"
      case "contract":
        return "$5,000/month"
      default:
        return "Enter amount"
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Employee</DialogTitle>
          <DialogDescription>Update the employee information below.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                placeholder="John"
                className={errors.firstName ? "border-red-500" : ""}
              />
              {errors.firstName && <p className="text-sm text-red-500">{errors.firstName}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                placeholder="Doe"
                className={errors.lastName ? "border-red-500" : ""}
              />
              {errors.lastName && <p className="text-sm text-red-500">{errors.lastName}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              placeholder="+1 (555) 123-4567"
              className={errors.phone ? "border-red-500" : ""}
            />
            {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="employee@company.com"
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role *</Label>
            <Select value={formData.role} onValueChange={(value) => handleInputChange("role", value)}>
              <SelectTrigger className={errors.role ? "border-red-500" : ""}>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                    {rolesRequiringCertificate.includes(role) && (
                      <Badge variant="outline" className="ml-2 text-xs">
                        Cert Required
                      </Badge>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.role && <p className="text-sm text-red-500">{errors.role}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="payrollType">Payroll Type</Label>
            <Select
              value={formData.payrollType}
              onValueChange={(value) => handleInputChange("payrollType", value as "salary" | "hourly" | "contract")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="salary">Salary (Annual)</SelectItem>
                <SelectItem value="hourly">Hourly Rate</SelectItem>
                <SelectItem value="contract">Contract (Monthly)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="salary">
              {formData.payrollType === "salary" && "Annual Salary *"}
              {formData.payrollType === "hourly" && "Hourly Rate *"}
              {formData.payrollType === "contract" && "Monthly Rate *"}
            </Label>
            <Input
              id="salary"
              value={formData.salary}
              onChange={(e) => handleInputChange("salary", e.target.value)}
              placeholder={getSalaryPlaceholder()}
              className={errors.salary ? "border-red-500" : ""}
            />
            {errors.salary && <p className="text-sm text-red-500">{errors.salary}</p>}
          </div>

          {rolesRequiringCertificate.includes(formData.role) && (
            <div className="space-y-2">
              <Label htmlFor="certificate">Certificate *</Label>
              <Textarea
                id="certificate"
                value={formData.certificate}
                onChange={(e) => handleInputChange("certificate", e.target.value)}
                placeholder="Enter relevant certifications (e.g., AWS Certified, Adobe Certified Expert, etc.)"
                className={errors.certificate ? "border-red-500" : ""}
                rows={3}
              />
              {errors.certificate && <p className="text-sm text-red-500">{errors.certificate}</p>}
              <p className="text-sm text-muted-foreground">
                This role requires professional certification. Please specify relevant certifications.
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => handleInputChange("status", value as "active" | "inactive")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit">Update Employee</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
