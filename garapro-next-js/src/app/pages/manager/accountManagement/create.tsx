"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, User, Briefcase } from "lucide-react"
import type { Employee } from "./page"

interface CreateEmployeeProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (employee: Omit<Employee, "id">) => void
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

export default function CreateEmployee({ isOpen, onClose, onSubmit }: CreateEmployeeProps) {
  const [currentPhase, setCurrentPhase] = useState<1 | 2>(1)
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

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      role: "",
      payrollType: "salary",
      salary: "",
      certificate: "",
      status: "active",
    })
    setErrors({})
    setCurrentPhase(1)
  }

  const validatePhase1 = () => {
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

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validatePhase2 = () => {
    const newErrors: Record<string, string> = {}

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

  const handleNextPhase = () => {
    if (validatePhase1()) {
      setCurrentPhase(2)
    }
  }

  const handlePreviousPhase = () => {
    setCurrentPhase(1)
    setErrors({}) // Clear any phase 2 errors when going back
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (validatePhase2()) {
      onSubmit(formData)
      resetForm()
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
    resetForm()
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
      <DialogContent className="sm:max-w-[1100px] h-[600px] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          {/* Progress Indicator */}
          <div className="flex items-center justify-left space-x-4 py-4">
            <div className="flex items-center">
              <Badge
                variant={currentPhase === 1 ? "default" : "secondary"}
                className={`rounded-full w-8 h-8 flex items-center justify-center ${currentPhase === 1 ? "bg-[#154c79] text-white" : "bg-gray-200 text-gray-600"}`}
              >
                1
              </Badge>
              <span className={`ml-2 text-sm ${currentPhase === 1 ? "font-medium" : "text-muted-foreground"}`}>
                Basic Info
              </span>
            </div>
            <div className="w-12 h-px bg-border"></div>
            <div className="flex items-center">
              <Badge
                variant={currentPhase === 2 ? "default" : "secondary"}
                className={`rounded-full w-8 h-8 flex items-center justify-center ${currentPhase === 2 ? "bg-[#154c79] text-white" : "bg-gray-200 text-gray-600"}`}
              >
                2
              </Badge>
              <span className={`ml-2 text-sm ${currentPhase === 2 ? "font-medium" : "text-muted-foreground"}`}>
                Role & Salary
              </span>
            </div>
          </div>
          
          <DialogTitle className="flex items-center gap-2">
            {currentPhase === 1 ? (
              <>
                <User className="h-5 w-5" />
                Add New Employee Information
              </>
            ) : (
              <>
                <Briefcase className="h-5 w-5" />
                Setup Role & Compensation
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {currentPhase === 1
              ? ""
              : ""}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {currentPhase === 1 ? (
            <div className="space-y-4">
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
                  <div className="h-5">
                    {errors.firstName && <p className="text-sm text-red-500">{errors.firstName}</p>}
                  </div>
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
                  <div className="h-5">
                    {errors.lastName && <p className="text-sm text-red-500">{errors.lastName}</p>}
                  </div>
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
                <div className="h-5">
                  {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="john.doe@company.com"
                  className={errors.email ? "border-red-500" : ""}
                />
                <div className="h-5">
                  {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                </div>
                <DialogDescription> * This email will be used for the employee to login to GaragePro</DialogDescription>
              </div>

              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Additional information like emergency contacts, address, and personal details can
                be added later through the employee profile.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
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
                <div className="h-5">
                  {errors.role && <p className="text-sm text-red-500">{errors.role}</p>}
                </div>
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
                <div className="h-5">
                  {errors.salary && <p className="text-sm text-red-500">{errors.salary}</p>}
                </div>
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
                  <div className="h-5">
                    {errors.certificate && <p className="text-sm text-red-500">{errors.certificate}</p>}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    This role requires professional certification. Please specify relevant certifications.
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="status">Initial Status</Label>
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
            </form>
          )}
        </div>

        <div className="flex-shrink-0 border-t pt-4">
          {currentPhase === 1 ? (
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="button" onClick={handleNextPhase}>
                Next: Role & Pay
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          ) : (
            <div className="flex justify-between space-x-2">
              <Button type="button" variant="outline" onClick={handlePreviousPhase}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              <div className="flex space-x-2">
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button type="submit" onClick={handleSubmit}>Create Employee</Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
