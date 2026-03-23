"use client"

import { useState, useEffect } from "react"
import { getRoles, createRole, updateRole, deleteRole, Role } from "@/lib/api-role"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit2, Trash2, Loader2, ShieldAlert } from "lucide-react"
import { toast } from "sonner"
import { RoleDialog } from "./components/role-dialog"

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [roleToEdit, setRoleToEdit] = useState<Role | null>(null)

  const fetchRoles = async () => {
    try {
      setLoading(true)
      const data = await getRoles()
      setRoles(data)
    } catch (err) {
      toast.error("Failed to fetch roles")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRoles()
  }, [])

  const handleCreate = () => {
    setRoleToEdit(null)
    setIsDialogOpen(true)
  }

  const handleEdit = (role: Role) => {
    setRoleToEdit(role)
    setIsDialogOpen(true)
  }

  const handleDelete = async (role: Role) => {
    if (!confirm(`Are you sure you want to delete role "${role.name}"?`)) return
    
    try {
      await deleteRole(role.id)
      toast.success("Role deleted successfully")
      fetchRoles()
    } catch (err: any) {
      toast.error(err.message || "Failed to delete role")
    }
  }

  const handleSave = async (data: any) => {
    try {
      if (roleToEdit) {
        await updateRole(roleToEdit.id, data)
        toast.success("Role updated successfully")
      } else {
        await createRole(data)
        toast.success("Role created successfully")
      }
      fetchRoles()
    } catch (err: any) {
      toast.error(err.message || "Failed to save role")
      throw err // Re-throw to keep the dialog open/loading state
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Role Management</h1>
          <p className="text-muted-foreground">Manage user roles and basic role definitions.</p>
        </div>
        <Button className="bg-brand hover:opacity-90" onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" /> Add Role
        </Button>
      </div>

      <Card className="rounded-2xl border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-brand" /> System Roles
          </CardTitle>
          <CardDescription>View and manage all roles. Note: Permissions are assigned per project.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-brand" />
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Role Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roles.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                        No roles found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    roles.map((role) => (
                      <TableRow key={role.id}>
                        <TableCell className="font-medium">{role.name}</TableCell>
                        <TableCell>{role.description || "-"}</TableCell>
                        <TableCell>{new Date(role.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button variant="outline" size="icon" className="h-8 w-8 text-blue-500 hover:text-blue-600" onClick={() => handleEdit(role)}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600" onClick={() => handleDelete(role)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      <RoleDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        roleToEdit={roleToEdit}
        onSave={handleSave}
      />
    </div>
  )
}
