"use client"

import { useState, useEffect } from "react"
import { getProject, getProjectPermissions, assignProjectPermissions, removeProjectPermission } from "@/lib/api-project"
import { Button } from "@/components/ui/button"
import { Loader2, Save, ShieldAlert } from "lucide-react"
import { toast } from "sonner"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function PermissionsTab({ projectId }: { projectId: string }) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  const [projectRoles, setProjectRoles] = useState<any[]>([])
  const [projectMenus, setProjectMenus] = useState<any[]>([])
  const [permissions, setPermissions] = useState<any[]>([])
  
  const [selectedRoleId, setSelectedRoleId] = useState<string>("")

  const fetchData = async () => {
    try {
      setLoading(true)
      const [proj, perms] = await Promise.all([
        getProject(projectId),
        getProjectPermissions(projectId)
      ])
      
      const p = proj as any
      // Extract unique roles from user-role assignments
      const rolesMap = new Map()
      p.userProjectRoles?.forEach((ur: any) => {
        rolesMap.set(ur.role.id, ur.role)
      })
      const roles = Array.from(rolesMap.values())
      
      setProjectRoles(roles)
      setProjectMenus(p.projectMenus || [])
      setPermissions(perms || [])
      
      if (roles.length > 0 && !selectedRoleId) {
        setSelectedRoleId(roles[0].id)
      }
    } catch (err) {
      toast.error("Failed to load permissions")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [projectId])

  const handleToggle = (menuId: string, field: 'canCreate' | 'canRead' | 'canUpdate' | 'canDelete') => {
    setPermissions(prev => {
      const existing = prev.find(p => p.role.id === selectedRoleId && p.menu.id === menuId)
      if (existing) {
        return prev.map(p => 
          (p.role.id === selectedRoleId && p.menu.id === menuId) 
            ? { ...p, [field]: !p[field] } 
            : p
        )
      } else {
        return [...prev, {
          role: { id: selectedRoleId },
          menu: { id: menuId },
          canCreate: false,
          canRead: false,
          canUpdate: false,
          canDelete: false,
          [field]: true
        }]
      }
    })
  }

  const handleSave = async () => {
    if (!selectedRoleId) return
    setSaving(true)
    try {
      // Get permissions just for this role to save
      const rolePerms = permissions.filter(p => p.role.id === selectedRoleId).map(p => ({
        roleId: selectedRoleId,
        menuId: p.menu.id,
        canCreate: p.canCreate,
        canRead: p.canRead,
        canUpdate: p.canUpdate,
        canDelete: p.canDelete
      }))
      
      await assignProjectPermissions(projectId, rolePerms)
      toast.success("Permissions saved successfully")
      fetchData()
    } catch (err: any) {
      toast.error(err.message || "Failed to save permissions")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-brand" /></div>
  }

  if (projectRoles.length === 0) {
    return (
      <div className="text-center py-10 border border-dashed rounded-xl">
        <ShieldAlert className="mx-auto h-12 w-12 text-muted-foreground opacity-20 mb-4" />
        <h3 className="text-lg font-medium">No Roles Available</h3>
        <p className="text-muted-foreground text-sm">Assign users with roles in the Users tab first.</p>
      </div>
    )
  }

  if (projectMenus.length === 0) {
    return (
      <div className="text-center py-10 border border-dashed rounded-xl">
        <h3 className="text-lg font-medium">No Menus Available</h3>
        <p className="text-muted-foreground text-sm">Assign menus to this project in the Menus tab first.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-medium">Role Permissions</h3>
          <p className="text-sm text-muted-foreground">Configure what each role can do within the assigned menus.</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select Role" />
            </SelectTrigger>
            <SelectContent>
              {projectRoles.map(r => (
                <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleSave} disabled={saving} className="bg-brand text-white">
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Save Permissions
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Menu</TableHead>
              <TableHead className="text-center">Read</TableHead>
              <TableHead className="text-center">Create</TableHead>
              <TableHead className="text-center">Update</TableHead>
              <TableHead className="text-center">Delete</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projectMenus.map((pm) => {
              const perm = permissions.find(p => p.role.id === selectedRoleId && p.menu.id === pm.menu.id) || {
                canCreate: false, canRead: false, canUpdate: false, canDelete: false
              }
              
              return (
                <TableRow key={pm.menu.id}>
                  <TableCell className="font-medium">{pm.menu.name}</TableCell>
                  <TableCell className="text-center">
                    <Checkbox 
                      checked={perm.canRead} 
                      onCheckedChange={() => handleToggle(pm.menu.id, 'canRead')} 
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <Checkbox 
                      checked={perm.canCreate} 
                      onCheckedChange={() => handleToggle(pm.menu.id, 'canCreate')} 
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <Checkbox 
                      checked={perm.canUpdate} 
                      onCheckedChange={() => handleToggle(pm.menu.id, 'canUpdate')} 
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <Checkbox 
                      checked={perm.canDelete} 
                      onCheckedChange={() => handleToggle(pm.menu.id, 'canDelete')} 
                    />
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
