"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Users, Clock, DollarSign } from "lucide-react"

interface Employee {
  id: string
  name: string
  role: string
  hourlyRate: number
  isActive: boolean
  skills: string[]
}

interface LaborCategory {
  id: string
  name: string
  description: string
  hourlyRate: number
  isActive: boolean
}

export default function LaborManagementTab() {
  const [employees, setEmployees] = useState<Employee[]>([
    {
      id: "1",
      name: "John Smith",
      role: "Senior Technician",
      hourlyRate: 45.00,
      isActive: true,
      skills: ["Engine Repair", "Transmission", "Diagnostics"]
    },
    {
      id: "2", 
      name: "Sarah Johnson",
      role: "Technician",
      hourlyRate: 35.00,
      isActive: true,
      skills: ["Brake Service", "Oil Change", "Tire Service"]
    },
    {
      id: "3",
      name: "Mike Wilson",
      role: "Apprentice",
      hourlyRate: 20.00,
      isActive: true,
      skills: ["Basic Maintenance"]
    }
  ])

  const [laborCategories, setLaborCategories] = useState<LaborCategory[]>([
    {
      id: "1",
      name: "Diagnostic Work",
      description: "Computer diagnostics and troubleshooting",
      hourlyRate: 125.00,
      isActive: true
    },
    {
      id: "2",
      name: "Engine Repair",
      description: "Engine rebuilds and major repairs",
      hourlyRate: 150.00,
      isActive: true
    },
    {
      id: "3",
      name: "General Service",
      description: "Oil changes, filters, and basic maintenance",
      hourlyRate: 95.00,
      isActive: true
    }
  ])

  const [showEmployeeForm, setShowEmployeeForm] = useState(false)
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [editingCategory, setEditingCategory] = useState<LaborCategory | null>(null)

  const [employeeForm, setEmployeeForm] = useState({
    name: "",
    role: "",
    hourlyRate: 0,
    skills: ""
  })

  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: "",
    hourlyRate: 0
  })

  const handleAddEmployee = () => {
    if (editingEmployee) {
      setEmployees(prev => prev.map(emp => 
        emp.id === editingEmployee.id 
          ? { ...emp, ...employeeForm, skills: employeeForm.skills.split(',').map(s => s.trim()) }
          : emp
      ))
    } else {
      const newEmployee: Employee = {
        id: Date.now().toString(),
        name: employeeForm.name,
        role: employeeForm.role,
        hourlyRate: employeeForm.hourlyRate,
        isActive: true,
        skills: employeeForm.skills.split(',').map(s => s.trim())
      }
      setEmployees(prev => [...prev, newEmployee])
    }
    setShowEmployeeForm(false)
    setEditingEmployee(null)
    setEmployeeForm({ name: "", role: "", hourlyRate: 0, skills: "" })
  }

  const handleAddCategory = () => {
    if (editingCategory) {
      setLaborCategories(prev => prev.map(cat => 
        cat.id === editingCategory.id 
          ? { ...cat, ...categoryForm }
          : cat
      ))
    } else {
      const newCategory: LaborCategory = {
        id: Date.now().toString(),
        name: categoryForm.name,
        description: categoryForm.description,
        hourlyRate: categoryForm.hourlyRate,
        isActive: true
      }
      setLaborCategories(prev => [...prev, newCategory])
    }
    setShowCategoryForm(false)
    setEditingCategory(null)
    setCategoryForm({ name: "", description: "", hourlyRate: 0 })
  }

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee)
    setEmployeeForm({
      name: employee.name,
      role: employee.role,
      hourlyRate: employee.hourlyRate,
      skills: employee.skills.join(', ')
    })
    setShowEmployeeForm(true)
  }

  const handleEditCategory = (category: LaborCategory) => {
    setEditingCategory(category)
    setCategoryForm({
      name: category.name,
      description: category.description,
      hourlyRate: category.hourlyRate
    })
    setShowCategoryForm(true)
  }

  const handleDeleteEmployee = (id: string) => {
    setEmployees(prev => prev.filter(emp => emp.id !== id))
  }

  const handleDeleteCategory = (id: string) => {
    setLaborCategories(prev => prev.filter(cat => cat.id !== id))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Labor Management</h1>
        <p className="text-gray-600 mt-2">
          Manage your employees, labor categories, and hourly rates for different types of work.
        </p>
      </div>

      {/* Employees Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Employees
          </CardTitle>
          <Button onClick={() => setShowEmployeeForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Employee
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {employees.map((employee) => (
              <div key={employee.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-gray-900">{employee.name}</h3>
                    <Badge variant={employee.isActive ? "default" : "secondary"}>
                      {employee.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{employee.role}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium">${employee.hourlyRate.toFixed(2)}/hr</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {employee.skills.map((skill, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditEmployee(employee)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteEmployee(employee.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Labor Categories Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Labor Categories
          </CardTitle>
          <Button onClick={() => setShowCategoryForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Category
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {laborCategories.map((category) => (
              <div key={category.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-gray-900">{category.name}</h3>
                    <Badge variant={category.isActive ? "default" : "secondary"}>
                      {category.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium">${category.hourlyRate.toFixed(2)}/hr</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditCategory(category)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteCategory(category.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Employee Form Modal */}
      {showEmployeeForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {editingEmployee ? "Edit Employee" : "Add Employee"}
            </h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="emp-name">Name</Label>
                <Input
                  id="emp-name"
                  value={employeeForm.name}
                  onChange={(e) => setEmployeeForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="emp-role">Role</Label>
                <Input
                  id="emp-role"
                  value={employeeForm.role}
                  onChange={(e) => setEmployeeForm(prev => ({ ...prev, role: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="emp-rate">Hourly Rate</Label>
                <Input
                  id="emp-rate"
                  type="number"
                  step="0.01"
                  value={employeeForm.hourlyRate}
                  onChange={(e) => setEmployeeForm(prev => ({ ...prev, hourlyRate: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label htmlFor="emp-skills">Skills (comma-separated)</Label>
                <Input
                  id="emp-skills"
                  value={employeeForm.skills}
                  onChange={(e) => setEmployeeForm(prev => ({ ...prev, skills: e.target.value }))}
                  placeholder="Engine Repair, Diagnostics, Brake Service"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <Button onClick={handleAddEmployee} className="flex-1">
                {editingEmployee ? "Update" : "Add"} Employee
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowEmployeeForm(false)
                  setEditingEmployee(null)
                  setEmployeeForm({ name: "", role: "", hourlyRate: 0, skills: "" })
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Category Form Modal */}
      {showCategoryForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {editingCategory ? "Edit Category" : "Add Category"}
            </h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="cat-name">Category Name</Label>
                <Input
                  id="cat-name"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="cat-description">Description</Label>
                <Input
                  id="cat-description"
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="cat-rate">Hourly Rate</Label>
                <Input
                  id="cat-rate"
                  type="number"
                  step="0.01"
                  value={categoryForm.hourlyRate}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, hourlyRate: parseFloat(e.target.value) || 0 }))}
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <Button onClick={handleAddCategory} className="flex-1">
                {editingCategory ? "Update" : "Add"} Category
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowCategoryForm(false)
                  setEditingCategory(null)
                  setCategoryForm({ name: "", description: "", hourlyRate: 0 })
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
