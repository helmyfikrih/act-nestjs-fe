"use client"

import { useState, useEffect } from "react"
import { getProject, assignUserRole, removeUserRole } from "@/lib/api-project"
import { getRoles, Role } from "@/lib/api-role"
import { apiFetch } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Loader2, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function UsersTab({ projectId }: { projectId: string }) {
  const [projectUsers, setProjectUsers] = useState<any[]>([])
  const [allUsers, setAllUsers] = useState<any[]>([])
  const [allRoles, setAllRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  
  const [selectedUserId, setSelectedUserId] = useState<string>("")
  const [selectedRoleId, setSelectedRoleId] = useState<string>("")
  const [assigning, setAssigning] = useState(false)

  const fetchData = async () => {
    try {
      setLoading(true)
      const [proj, users, roles] = await Promise.all([
        getProject(projectId),
        apiFetch<any[]>("/users"), // Assuming /users returns all users for admin
        getRoles()
      ])
      setProjectUsers((proj as any).userProjectRoles || [])
      setAllUsers(users)
      setAllRoles(roles)
    } catch (err) {
      toast.error("Failed to load users data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [projectId])

  const handleAssignUser = async () => {
    if (!selectedUserId || !selectedRoleId) return
    setAssigning(true)
    try {
      await assignUserRole(projectId, selectedUserId, selectedRoleId)
      toast.success("User assigned successfully")
      setSelectedUserId("")
      setSelectedRoleId("")
      fetchData()
    } catch (err: any) {
      toast.error(err.message || "Failed to assign user")
    } finally {
      setAssigning(false)
    }
  }

  const handleRemoveUser = async (userId: string, roleId: string, userName: string) => {
    if (!confirm(`Are you sure you want to remove ${userName} from this project role?`)) return
    try {
      await removeUserRole(projectId, userId, roleId)
      toast.success("User removed successfully")
      fetchData()
    } catch (err: any) {
      toast.error(err.message || "Failed to remove user")
    }
  }

  if (loading) {
    return <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-brand" /></div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Assigned Users</h3>
        <p className="text-sm text-muted-foreground">Assign users to this project with specific roles.</p>
      </div>

      <div className="flex items-center gap-4 p-4 border rounded-xl bg-muted/20">
        <div className="flex-1">
          <Select value={selectedUserId} onValueChange={setSelectedUserId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a user..." />
            </SelectTrigger>
            <SelectContent>
              {allUsers.map((u) => (
                <SelectItem key={u.id} value={u.id}>
                  {u.profile?.fullName || u.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1">
          <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a role..." />
            </SelectTrigger>
            <SelectContent>
              {allRoles.map((r) => (
                <SelectItem key={r.id} value={r.id}>
                  {r.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleAssignUser} disabled={!selectedUserId || !selectedRoleId || assigning} className="bg-brand text-white">
          {assigning ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Assign User
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Assigned Role</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projectUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                  No users assigned to this project yet.
                </TableCell>
              </TableRow>
            ) : (
              projectUsers.map((pu, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{pu.user.profile?.fullName || "-"}</TableCell>
                  <TableCell>{pu.user.email}</TableCell>
                  <TableCell>
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-semibold">{pu.role.name}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-8 w-8 text-red-500 hover:text-red-600"
                      onClick={() => handleRemoveUser(pu.user.id, pu.role.id, pu.user.profile?.fullName || pu.user.email)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
