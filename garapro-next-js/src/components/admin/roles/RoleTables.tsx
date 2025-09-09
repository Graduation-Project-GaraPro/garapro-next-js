import { useMemo, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  Shield,
  Users,
  Eye,
  Edit,
  Copy,
  Trash2,
  MoreHorizontal
} from 'lucide-react'
import { Role } from '@/services/role-service'

interface RoleTableProps {
  roles: Role[]
  loading: boolean
  onEdit: (role: Role) => void
  onView: (role: Role) => void
  onDelete: (role: Role) => void
  onDuplicate: (role: Role) => void
}

export const RoleTable = ({ 
  roles, 
  loading, 
  onEdit, 
  onView, 
  onDelete, 
  onDuplicate 
}: RoleTableProps) => {
  
  const handleEdit = useCallback((role: Role) => onEdit(role), [onEdit])
  const handleView = useCallback((role: Role) => onView(role), [onView])
  const handleDelete = useCallback((role: Role) => onDelete(role), [onDelete])
  const handleDuplicate = useCallback((role: Role) => onDuplicate(role), [onDuplicate])

  const tableRows = useMemo(() => 
    roles.map((role) => (
      <TableRow key={role.id}>
        <TableCell>
          <div className="flex items-center space-x-2">
            <Shield className="h-4 w-4 text-blue-600" />
            <span className="font-medium">{role.name}</span>
          </div>
        </TableCell>
        <TableCell>
          <div className="max-w-xs truncate" title={role.description}>
            {role.description}
          </div>
        </TableCell>
        <TableCell>
          <div className="flex items-center space-x-1">
            <Users className="h-4 w-4 text-gray-400" />
            <span>{role.users.toLocaleString()}</span>
          </div>
        </TableCell>
        <TableCell>
          <div className="flex flex-wrap gap-1">
            {role.permissions.slice(0, 3).map((permission) => (
              <Badge key={permission} variant="secondary" className="text-xs">
                {permission.replace('_', ' ')}
              </Badge>
            ))}
            {role.permissions.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{role.permissions.length - 3}
              </Badge>
            )}
          </div>
        </TableCell>
        <TableCell>
          {role.isDefault ? (
            <Badge className="bg-green-100 text-green-800">Default</Badge>
          ) : (
            <Badge variant="outline">Custom</Badge>
          )}
        </TableCell>
        <TableCell>
          <span className="text-sm text-gray-500">
            {new Date(role.createdAt).toLocaleDateString()}
          </span>
        </TableCell>
        <TableCell className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleView(role)}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleEdit(role)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Role
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDuplicate(role)}>
                <Copy className="mr-2 h-4 w-4" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {!role.isDefault && (
                <DropdownMenuItem 
                  onClick={() => handleDelete(role)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Role
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
    ))
  , [roles, handleEdit, handleView, handleDelete, handleDuplicate])

  return (
    <div className="w-full overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Users</TableHead>
            <TableHead>Permissions</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-6">
                Loading...
              </TableCell>
            </TableRow>
          ) : roles.length > 0 ? (
            tableRows
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-6 text-gray-500">
                No roles found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
