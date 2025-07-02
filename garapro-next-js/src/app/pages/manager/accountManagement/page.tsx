"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Edit, Eye } from "lucide-react"
import CreateEmployee from "./create"
import UpdateEmployee from "./update"

export interface Employee {
  id: string
  firstName: string
  lastName: string
  phone: string
  email: string
  role: string
  payrollType: "salary" | "hourly" | "contract"
  salary: string
  certificate?: string
  status: "active" | "inactive"
}

const initialEmployees: Employee[] = [
  {
    id: "1",
    firstName: "John",
    lastName: "Doe",
    phone: "+1 (555) 123-4567",
    email: "john.doe@company.com",
    role: "Technician",
    payrollType: "salary",
    salary: "$75,000",
    status: "active",
  },
  {
    id: "2",
    firstName: "Jane",
    lastName: "Smith",
    phone: "+1 (555) 987-6543",
    email: "jane.smith@company.com",
    role: "Manager",
    payrollType: "salary",
    salary: "$85,000",
    status: "active",
  },
  {
    id: "3",
    firstName: "Mike",
    lastName: "Johnson",
    phone: "+1 (555) 456-7890",
    email: "mike.johnson@company.com",
    role: "Service Advisor",
    payrollType: "hourly",
    salary: "$45/hour",
    certificate: "Adobe Certified Expert",
    status: "active",
  },
]

export default function EmployeeManagement() {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)

  const handleAddEmployee = (newEmployee: Omit<Employee, "id">) => {
    const employee: Employee = {
      id: Date.now().toString(),
      ...newEmployee,
    }
    setEmployees([...employees, employee])
    setIsCreateDialogOpen(false)
  }

  const handleUpdateEmployee = (updatedEmployee: Employee) => {
    setEmployees(employees.map((emp) => (emp.id === updatedEmployee.id ? updatedEmployee : emp)))
    setIsUpdateDialogOpen(false)
    setSelectedEmployee(null)
  }



  const openViewDialog = (employee: Employee) => {
    setSelectedEmployee(employee)
    setIsViewDialogOpen(true)
  }

  const openUpdateDialog = (employee: Employee) => {
    setSelectedEmployee(employee)
    setIsUpdateDialogOpen(true)
  }

  return (
    <div className="container mx-auto py-8 px-4 border border-gray-300 rounded-sm">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl">Employee Management</CardTitle>
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)}
                className="bg-[#154c79] hover:bg-[#123a63] text-white">
              Add Employee
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-sm border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No employees found. Add your first employee to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  employees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell className="font-medium">{`${employee.firstName} ${employee.lastName}`}</TableCell>
                      <TableCell>{employee.email}</TableCell>
                      <TableCell>{employee.phone}</TableCell>
                      <TableCell>{employee.role}</TableCell>
                      <TableCell>
                        <Badge
                          variant={employee.status === "active" ? "default" : "secondary"}
                          className={employee.status === "active" ? "bg-green-100 text-green-800" : ""}
                        >
                          {employee.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button variant="ghost" size="sm" onClick={() => openViewDialog(employee)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => openUpdateDialog(employee)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create Employee Dialog */}
      <CreateEmployee
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSubmit={handleAddEmployee}
      />

      {/* Update Employee Dialog */}
      {selectedEmployee && (
        <UpdateEmployee
          isOpen={isUpdateDialogOpen}
          onClose={() => {
            setIsUpdateDialogOpen(false)
            setSelectedEmployee(null)
          }}
          onSubmit={handleUpdateEmployee}
          employee={selectedEmployee}
        />
      )}

      {/* View Employee Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Employee Details</DialogTitle>
            <DialogDescription>View employee information.</DialogDescription>
          </DialogHeader>
          {selectedEmployee && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">First Name</label>
                <div className="p-2 bg-gray-50 rounded-md">{selectedEmployee.firstName}</div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Last Name</label>
                <div className="p-2 bg-gray-50 rounded-md">{selectedEmployee.lastName}</div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone Number</label>
                <div className="p-2 bg-gray-50 rounded-sm">{selectedEmployee.phone}</div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email Address</label>
                <div className="p-2 bg-gray-50 rounded-sm">{selectedEmployee.email}</div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Role</label>
                <div className="p-2 bg-gray-50 rounded-sm">{selectedEmployee.role}</div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <div className="p-2 bg-gray-50 rounded-sm">
                  <Badge
                    variant={selectedEmployee.status === "active" ? "default" : "secondary"}
                    className={selectedEmployee.status === "active" ? "bg-green-100 text-green-800" : ""}
                  >
                    {selectedEmployee.status}
                  </Badge>
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <Button onClick={() => setIsViewDialogOpen(false)}>Close</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
